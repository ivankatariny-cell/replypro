import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '@/lib/resend/emails'

/** Silently log a webhook event — never throws */
async function logWebhookEvent(
  supabase: ReturnType<typeof createServiceRoleClient>,
  eventId: string,
  eventType: string,
  status: 'processed' | 'failed' | 'skipped',
  userId?: string | null,
  errorMessage?: string,
) {
  try {
    await supabase.from('rp_webhook_events').upsert({
      event_id: eventId,
      event_type: eventType,
      user_id: userId ?? null,
      status,
      error_message: errorMessage ?? null,
    }, { onConflict: 'event_id', ignoreDuplicates: true })
  } catch {
    // Logging must never affect the webhook response
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()
  const obj = event.data.object as unknown as Record<string, unknown>
  let resolvedUserId: string | null = null

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const userId = (obj.metadata as Record<string, string>)?.user_id
        if (!userId) break
        resolvedUserId = userId
        await supabase.from('rp_subscriptions').update({
          status: 'active',
          stripe_customer_id: obj.customer as string,
          stripe_subscription_id: obj.subscription as string,
        }).eq('user_id', userId)

        try {
          const { data: authUser } = await supabase.auth.admin.getUserById(userId)
          const { data: profileData } = await supabase.from('profiles').select('language').eq('id', userId).single()
          const email = authUser?.user?.email
          if (email) {
            await sendPaymentSuccessEmail(email, (profileData?.language as 'hr' | 'en') ?? 'hr')
          }
        } catch (emailErr) {
          console.error('[stripe/webhook] Failed to send payment success email', {
            userId,
            error: emailErr instanceof Error ? emailErr.message : String(emailErr),
          })
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const subId = obj.subscription as string
        if (!subId) break
        const sub = await getStripe().subscriptions.retrieve(subId)
        const periodEnd = sub.current_period_end
        await supabase.from('rp_subscriptions').update({
          current_period_end: new Date(periodEnd * 1000).toISOString(),
          status: 'active',
        }).eq('stripe_subscription_id', subId)
        break
      }

      case 'invoice.payment_failed': {
        const subId = obj.subscription as string
        if (!subId) break
        await supabase.from('rp_subscriptions').update({
          status: 'past_due',
        }).eq('stripe_subscription_id', subId)

        try {
          const { data: sub } = await supabase.from('rp_subscriptions').select('user_id').eq('stripe_subscription_id', subId).single()
          if (sub?.user_id) {
            resolvedUserId = sub.user_id
            const { data: authUser } = await supabase.auth.admin.getUserById(sub.user_id)
            const { data: profileData } = await supabase.from('profiles').select('language').eq('id', sub.user_id).single()
            const email = authUser?.user?.email
            if (email) {
              await sendPaymentFailedEmail(email, (profileData?.language as 'hr' | 'en') ?? 'hr')
            }
          }
        } catch (emailErr) {
          console.error('[stripe/webhook] Failed to send payment failed email', {
            subId,
            error: emailErr instanceof Error ? emailErr.message : String(emailErr),
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        await supabase.from('rp_subscriptions').update({
          status: 'cancelled',
        }).eq('stripe_subscription_id', obj.id as string)
        break
      }

      case 'customer.subscription.updated': {
        const periodEnd = (obj as Record<string, number>).current_period_end
        await supabase.from('rp_subscriptions').update({
          current_period_end: new Date(periodEnd * 1000).toISOString(),
          status: obj.status === 'active' ? 'active' : 'past_due',
        }).eq('stripe_subscription_id', obj.id as string)
        break
      }

      default: {
        await logWebhookEvent(supabase, event.id, event.type, 'skipped')
        return NextResponse.json({ received: true })
      }
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error('[stripe/webhook] Failed to process event', {
      eventType: event.type,
      eventId: event.id,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    })
    await logWebhookEvent(supabase, event.id, event.type, 'failed', resolvedUserId, errorMessage)
    // Return 500 so Stripe retries the event
    return NextResponse.json(
      { error: 'Webhook handler failed', eventType: event.type },
      { status: 500 }
    )
  }

  await logWebhookEvent(supabase, event.id, event.type, 'processed', resolvedUserId)
  return NextResponse.json({ received: true })
}
