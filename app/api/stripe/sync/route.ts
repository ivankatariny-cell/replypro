import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const serviceClient = createServiceRoleClient()

    // First ensure subscription row exists
    await serviceClient.from('rp_subscriptions').upsert(
      { user_id: user.id, status: 'trial' },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )

    // Check Stripe for checkout sessions by email
    const sessions = await getStripe().checkout.sessions.list({
      customer_details: { email: user.email! },
      limit: 5,
      status: 'complete',
    })

    // Find a paid session
    const paidSession = sessions.data.find(s => s.payment_status === 'paid')
    
    if (!paidSession) {
      // Also try searching by customer
      const { data: sub } = await serviceClient
        .from('rp_subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single()

      if (sub?.stripe_customer_id) {
        const stripeSub = await getStripe().subscriptions.list({
          customer: sub.stripe_customer_id,
          status: 'active',
          limit: 1,
        })
        if (stripeSub.data.length > 0) {
          await serviceClient.from('rp_subscriptions').update({
            status: 'active',
          }).eq('user_id', user.id)
          return NextResponse.json({ status: 'active' })
        }
      }

      return NextResponse.json({ status: 'no_payment' })
    }

    // Update subscription to active
    const updateData: Record<string, string> = { status: 'active' }
    if (paidSession.customer) updateData.stripe_customer_id = paidSession.customer as string
    if (paidSession.subscription) updateData.stripe_subscription_id = paidSession.subscription as string

    const { error } = await serviceClient
      .from('rp_subscriptions')
      .update(updateData)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message, status: 'db_error' }, { status: 500 })
    }

    return NextResponse.json({ status: 'active' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
