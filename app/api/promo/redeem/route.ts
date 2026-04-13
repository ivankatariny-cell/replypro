import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { ApiError } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated', code: 'AUTH_REQUIRED' } satisfies ApiError,
        { status: 401 }
      )
    }

    const body = await req.json()
    const code = (body.code || '').trim()
    if (!code) {
      return NextResponse.json(
        { error: 'Promo code is required', code: 'INVALID_INPUT' } satisfies ApiError,
        { status: 400 }
      )
    }

    const serviceClient = createServiceRoleClient()
    const { data: rpcResults, error: rpcError } = await serviceClient
      .rpc('redeem_promo_code', { p_user_id: user.id, p_code: code })

    if (rpcError || !rpcResults?.[0]) {
      console.error('[promo/redeem] RPC error', rpcError)
      return NextResponse.json(
        { error: 'Failed to redeem code', code: 'REDEMPTION_FAILED' } satisfies ApiError,
        { status: 500 }
      )
    }

    const result = rpcResults[0]

    if (!result.success) {
      const messageMap: Record<string, { error: string; status: number }> = {
        invalid_code:     { error: 'invalid_code', status: 404 },
        code_inactive:    { error: 'code_inactive', status: 410 },
        code_expired:     { error: 'code_expired', status: 410 },
        code_exhausted:   { error: 'code_exhausted', status: 410 },
        already_redeemed: { error: 'already_redeemed', status: 409 },
        already_pro:      { error: 'already_pro', status: 409 },
      }
      const mapped = messageMap[result.message] ?? { error: 'redemption_failed', status: 400 }
      return NextResponse.json(
        { error: mapped.error, code: 'PROMO_ERROR' } satisfies ApiError,
        { status: mapped.status }
      )
    }

    // Fetch updated subscription to return fresh state
    const { data: updatedSub } = await serviceClient
      .from('rp_subscriptions')
      .select('trial_generations_limit, trial_generations_used')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      success: true,
      generations_granted: result.generations_granted,
      new_limit: updatedSub?.trial_generations_limit ?? null,
      remaining: updatedSub
        ? updatedSub.trial_generations_limit - updatedSub.trial_generations_used
        : null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Redemption failed'
    return NextResponse.json(
      { error: message, code: 'REDEMPTION_FAILED' } satisfies ApiError,
      { status: 500 }
    )
  }
}
