import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { generateReplies } from '@/lib/groq/client'
import { buildSystemPrompt } from '@/lib/prompts/real-estate'
import { sanitizeMessage } from '@/lib/utils/sanitize'
import { rateLimit } from '@/lib/utils/rate-limit'
import { sendTrialLowEmail, sendTrialExpiredEmail } from '@/lib/resend/emails'
import { containsDateOrTime } from '@/lib/utils/datetime-detect'
import { fetchAvailabilityContext } from '@/lib/calendar/availability'
import { extractBooking } from '@/lib/calendar/extract-booking'
import type { GenerateResponse, ApiError } from '@/types'

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

    const { success } = await rateLimit(user.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests', code: 'RATE_LIMITED' } satisfies ApiError,
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const serviceClient = createServiceRoleClient()
    const { data: sub } = await serviceClient
      .from('rp_subscriptions').select('*').eq('user_id', user.id).single()

    if (!sub) {
      await serviceClient.from('rp_subscriptions').insert({ user_id: user.id })
      return NextResponse.json(
        { error: 'Subscription initialized, please retry', code: 'RETRY' } satisfies ApiError,
        { status: 503 }
      )
    }

    if (sub.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Subscription cancelled', code: 'SUBSCRIPTION_CANCELLED' } satisfies ApiError,
        { status: 402 }
      )
    }

    // Trial limit pre-check (non-atomic, just for fast-path rejection before AI call)
    if (sub.status === 'trial' && sub.trial_generations_used >= sub.trial_generations_limit) {
      return NextResponse.json(
        { error: 'Trial limit reached', code: 'TRIAL_EXPIRED' } satisfies ApiError,
        { status: 402 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()

    if (!profile || !profile.onboarding_completed) {
      return NextResponse.json(
        { error: 'Please complete onboarding first', code: 'ONBOARDING_REQUIRED' } satisfies ApiError,
        { status: 400 }
      )
    }

    const body = await req.json()
    const message = sanitizeMessage(body.message || '')
    if (!message || message.length < 1) {
      return NextResponse.json(
        { error: 'Message is required', code: 'INVALID_INPUT' } satisfies ApiError,
        { status: 400 }
      )
    }

    // Fetch optional client context
    let clientContext = ''
    if (body.client_id) {
      const { data: client } = await supabase
        .from('rp_clients').select('*').eq('id', body.client_id).single()
      if (client) {
        clientContext = `\n\nKLIJENT: ${client.full_name}`
        if (client.city) clientContext += `, ${client.city}`
        if (client.property_interest) clientContext += `. Traži: ${client.property_interest}`
        if (client.budget_min || client.budget_max) {
          clientContext += `. Budžet: ${client.budget_min ? `€${client.budget_min}` : '?'} - ${client.budget_max ? `€${client.budget_max}` : '?'}`
        }
        if (client.notes) clientContext += `. Napomene: ${client.notes}`
      }
    }

    // Fetch optional property context
    let propertyContext = ''
    if (body.property_id) {
      const { data: property } = await supabase
        .from('rp_properties').select('*').eq('id', body.property_id).single()
      if (property) {
        propertyContext = `\n\nNEKRETNINA: ${property.title}`
        if (property.address) propertyContext += `, ${property.address}`
        if (property.city) propertyContext += `, ${property.city}`
        if (property.price) propertyContext += `. Cijena: €${property.price}`
        if (property.sqm) propertyContext += `, ${property.sqm}m²`
        if (property.rooms) propertyContext += `, ${property.rooms} soba`
        if (property.description) propertyContext += `. ${property.description}`
      }
    }

    // Template context — sanitize server-side to prevent prompt injection
    const sanitizedTemplateCtx = body.template_context ? sanitizeMessage(body.template_context) : ''
    const templateCtx = sanitizedTemplateCtx ? `\n\nKONTEKST PREDLOŠKA: ${sanitizedTemplateCtx}` : ''

    const systemPrompt = buildSystemPrompt({
      agentName: profile.full_name,
      agencyName: profile.agency_name,
      city: profile.city,
      preferredTone: profile.preferred_tone,
    })

    // Availability context + booking suggestion — only when message contains a date/time reference
    let availabilityContext = ''
    let suggestedBooking = null
    if (containsDateOrTime(message)) {
      availabilityContext = await fetchAvailabilityContext(user.id, message, serviceClient)

      // Detect language from message: Croatian/Bosnian/Serbian keywords → 'hr', else profile language
      const hasCroatianWords = /\b(ponedjeljak|ponedeljak|utorak|srijed|sredu?|[cč]etvrtak|petak|subota?|nedjelja?|nedelja?|sutra|prekosutra|danas|sati|sata|idući|ovaj|tjedan)\b/i.test(message)
      const msgLanguage: 'hr' | 'en' = hasCroatianWords ? 'hr' : (profile.language ?? 'en')

      let clientName: string | null = null
      let propertyTitle: string | null = null

      if (body.client_id) {
        const { data: clientForBooking } = await supabase
          .from('rp_clients').select('full_name').eq('id', body.client_id).single()
        clientName = clientForBooking?.full_name ?? null
      }
      if (body.property_id) {
        const { data: propertyForBooking } = await supabase
          .from('rp_properties').select('title').eq('id', body.property_id).single()
        propertyTitle = propertyForBooking?.title ?? null
      }

      suggestedBooking = extractBooking(message, clientName, propertyTitle, msgLanguage)
    }

    const enrichedPrompt = systemPrompt + clientContext + propertyContext + templateCtx + availabilityContext
    const aiResult = await generateReplies(enrichedPrompt, message)

    const { data: genRow, error: genInsertError } = await serviceClient.from('rp_generations').insert({
      user_id: user.id,
      original_message: message,
      reply_professional: aiResult.professional,
      reply_friendly: aiResult.friendly,
      reply_direct: aiResult.direct,
      detected_language: aiResult.detected_language,
      client_id: body.client_id || null,
    }).select('id').single()

    if (genInsertError || !genRow) {
      console.error('[generate] failed to insert generation', genInsertError)
      return NextResponse.json(
        { error: 'Failed to save generation', code: 'GENERATION_FAILED' } satisfies ApiError,
        { status: 500 }
      )
    }

    let generationsRemaining: number | null = null
    if (sub.status === 'trial') {
      const { data: rpcResult, error: rpcError } = await serviceClient
        .rpc('increment_trial_usage', { p_user_id: user.id })
        .single()

      if (rpcError) {
        console.error('[generate] increment_trial_usage RPC failed', rpcError)
        return NextResponse.json(
          { error: 'Failed to update trial usage', code: 'GENERATION_FAILED' } satisfies ApiError,
          { status: 500 }
        )
      }

      if (!rpcResult.success) {
        // Exhausted — send expired email then reject
        const { data: profileForEmail } = await serviceClient
          .from('profiles').select('language').eq('id', user.id).single()
        try {
          await sendTrialExpiredEmail(user.email!, profileForEmail?.language ?? 'en')
        } catch (emailErr) {
          console.error('[generate] sendTrialExpiredEmail failed', emailErr)
        }
        return NextResponse.json(
          { error: 'Trial limit reached', code: 'TRIAL_EXPIRED' } satisfies ApiError,
          { status: 402 }
        )
      }

      generationsRemaining = rpcResult.generations_limit - rpcResult.generations_used

      // Warn when running low (1 generation left)
      if (generationsRemaining === 1) {
        const { data: profileForEmail } = await serviceClient
          .from('profiles').select('language').eq('id', user.id).single()
        try {
          await sendTrialLowEmail(user.email!, profileForEmail?.language ?? 'en')
        } catch (emailErr) {
          console.error('[generate] sendTrialLowEmail failed', emailErr)
        }
      }
    }

    const response: GenerateResponse = {
      professional: aiResult.professional,
      friendly: aiResult.friendly,
      direct: aiResult.direct,
      detected_language: aiResult.detected_language,
      generations_remaining: generationsRemaining,
      suggestedBooking,
      availabilityConflict: availabilityContext.includes('OCCUPIED'),
    }

    return NextResponse.json(response)
  } catch (err) {
    if (err instanceof Error && err.message.includes('timed out after 30 seconds')) {
      return NextResponse.json(
        { error: 'The AI took too long to respond. Please try again in a moment.', code: 'AI_TIMEOUT' } satisfies ApiError,
        { status: 504 }
      )
    }
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json(
      { error: message, code: 'GENERATION_FAILED' } satisfies ApiError,
      { status: 500 }
    )
  }
}
