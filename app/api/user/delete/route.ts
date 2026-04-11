import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'

export async function DELETE() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const serviceRole = createServiceRoleClient()

    // 1. Fetch subscription info before deleting the user
    const { data: subscription } = await serviceRole
      .from('rp_subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', user.id)
      .single()

    // 2. Cancel active Stripe subscription if one exists
    if (
      subscription?.stripe_subscription_id &&
      (subscription.status === 'active' || subscription.status === 'past_due')
    ) {
      try {
        await getStripe().subscriptions.cancel(subscription.stripe_subscription_id)
      } catch (stripeErr) {
        // Log but don't block — user should always be able to delete their account
        console.error('Failed to cancel Stripe subscription during account deletion:', stripeErr)
      }
    }

    // 3. Explicitly delete the subscription row (CASCADE on auth.users handles it,
    //    but this ensures cleanup even if FK constraints change)
    await serviceRole
      .from('rp_subscriptions')
      .delete()
      .eq('user_id', user.id)

    // 4. Delete the auth user
    const { error: deleteError } = await serviceRole.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Failed to delete user:', deleteError)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
