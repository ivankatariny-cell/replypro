import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'

// Called after Stripe checkout to sync subscription status
export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check Stripe for recent checkout sessions for this user
    const sessions = await getStripe().checkout.sessions.list({
      customer_email: user.email!,
      limit: 1,
    })

    const session = sessions.data[0]
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ status: 'no_payment' })
    }

    const serviceClient = createServiceRoleClient()

    // Update subscription to active
    await serviceClient.from('rp_subscriptions').update({
      status: 'active',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
    }).eq('user_id', user.id)

    return NextResponse.json({ status: 'active' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
