import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { generateReplies } from '@/lib/groq/client'
import { buildSystemPrompt } from '@/lib/prompts/real-estate'
import { sanitizeMessage } from '@/lib/utils/sanitize'
import { rateLimit } from '@/lib/utils/rate-limit'
import type { GenerateResponse, ApiError } from '@/types'

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated', code: 'AUTH_REQUIRED' } satisfies ApiError,
        { status: 401 }
      )
    }

    // 2. Rate limit
    const { allowed, retryAfter } = rateLimit(user.id)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests', code: 'RATE_LIMITED' } satisfies ApiError,
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    // 3. Check subscription
    const serviceClient = createServiceRoleClient()
    const { data: sub } = await serviceClient
      .from('rp_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!sub) {
      // Auto-create if missing
      await serviceClient.from('rp_subscriptions').insert({ user_id: user.id })
      return NextResponse.json(
        { error: 'Subscription initialized, please retry', code: 'RETRY' } satisfies ApiError,
        { status: 503 }
      )
    }

    if (sub.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Subscription cancelled. Please resubscribe.', code: 'SUBSCRIPTION_CANCELLED' } satisfies ApiError,
        { status: 402 }
      )
    }

    if (sub.status === 'trial' && sub.trial_generations_used >= sub.trial_generations_limit) {
      return NextResponse.json(
        { error: 'Trial limit reached. Upgrade to Pro.', code: 'TRIAL_EXPIRED' } satisfies ApiError,
        { status: 402 }
      )
    }

    // 4. Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.onboarding_completed) {
      return NextResponse.json(
        { error: 'Please complete onboarding first', code: 'ONBOARDING_REQUIRED' } satisfies ApiError,
        { status: 400 }
      )
    }

    // 5. Validate input
    const body = await req.json()
    const message = sanitizeMessage(body.message || '')
    if (!message || message.length < 1) {
      return NextResponse.json(
        { error: 'Message is required (1-2000 chars)', code: 'INVALID_INPUT' } satisfies ApiError,
        { status: 400 }
      )
    }

    // 6. Build prompt and call AI
    const systemPrompt = buildSystemPrompt({
      agentName: profile.full_name,
      agencyName: profile.agency_name,
      city: profile.city,
      preferredTone: profile.preferred_tone,
    })

    const aiResult = await generateReplies(systemPrompt, message)

    // 7. Save generation
    await serviceClient.from('rp_generations').insert({
      user_id: user.id,
      original_message: message,
      reply_professional: aiResult.professional,
      reply_friendly: aiResult.friendly,
      reply_direct: aiResult.direct,
      detected_language: aiResult.detected_language,
    })

    // 8. Increment trial count
    if (sub.status === 'trial') {
      await serviceClient
        .from('rp_subscriptions')
        .update({ trial_generations_used: sub.trial_generations_used + 1 })
        .eq('user_id', user.id)
    }

    // 9. Calculate remaining
    let generationsRemaining: number | null = null
    if (sub.status === 'trial') {
      generationsRemaining = sub.trial_generations_limit - sub.trial_generations_used - 1
    }

    const response: GenerateResponse = {
      professional: aiResult.professional,
      friendly: aiResult.friendly,
      direct: aiResult.direct,
      detected_language: aiResult.detected_language,
      generations_remaining: generationsRemaining,
    }

    return NextResponse.json(response)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json(
      { error: message, code: 'GENERATION_FAILED' } satisfies ApiError,
      { status: 500 }
    )
  }
}
