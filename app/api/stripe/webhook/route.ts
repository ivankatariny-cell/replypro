import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()
  const obj = event.data.object as unknown as Record<string, unknown>

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const userId = (obj.metadata as Record<string, string>)?.user_id
        if (!userId) break
        await supabase.from('rp_subscriptions').update({
          status: 'active',
          stripe_customer_id: obj.customer as string,
          stripe_subscription_id: obj.subscription as string,
        }).eq('user_id', userId)
        break
      }

      case 'invoice.payment_succeeded': {
        const subId = obj.subscription as string
        if (!subId) break
        const sub = await getStripe().subscriptions.retrieve(subId)
        const periodEnd = (sub as unknown as Record<string, number>).current_period_end
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
    }
  } catch {
    // Log but don't fail — Stripe will retry
  }

  return NextResponse.json({ received: true })
}
