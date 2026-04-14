import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/utils/rate-limit'
import type { ImportResult } from '@/types'

const GROQ_TIMEOUT_MS = 30_000
const JINA_TIMEOUT_MS = 15_000

const EXTRACTION_PROMPT = `Return a JSON object with these fields:
- title: string (property name/headline, required)
- address: string or null (street address)
- city: string or null
- price: number or null (EUR; convert from other currencies if possible)
- sqm: number or null (square meters)
- rooms: number or null
- description: string or null (max 500 chars, plain text)
- property_type: one of "apartment" | "house" | "land" | "commercial" | "other"

Return ONLY the JSON object, no explanation.`

function err(status: number, code: string, message: string) {
  return NextResponse.json({ error: message, code }, { status })
}

export async function POST(req: NextRequest) {
  try {
    // 3.1 Auth guard
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return err(401, 'UNAUTHORIZED', 'Authentication required')
    }

    // 3.1 Rate limit guard
    const rl = await rateLimit(user.id)
    if (!rl.success) {
      return err(429, 'RATE_LIMITED', 'Too many requests. Please wait before trying again.')
    }

    // 3.2 URL validation
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return err(400, 'INVALID_URL', 'Invalid request body')
    }

    const rawUrl = (body as Record<string, unknown>)?.url
    if (typeof rawUrl !== 'string') {
      return err(400, 'INVALID_URL', 'url must be a string')
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(rawUrl)
    } catch {
      return err(400, 'INVALID_URL', 'url is not a valid URL')
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return err(400, 'INVALID_URL', 'url must use http or https protocol')
    }

    // 3.3 Jina AI fetch with timeout
    const jinaController = new AbortController()
    const jinaTimer = setTimeout(() => jinaController.abort(), JINA_TIMEOUT_MS)

    let markdown: string
    try {
      const jinaRes = await fetch(`https://r.jina.ai/${rawUrl}`, {
        signal: jinaController.signal,
      })

      if (!jinaRes.ok) {
        return err(502, 'SCRAPE_FAILED', 'Failed to fetch listing content')
      }

      markdown = await jinaRes.text()
    } catch (e) {
      if (jinaController.signal.aborted) {
        return err(504, 'SCRAPE_TIMEOUT', 'Listing fetch timed out')
      }
      return err(502, 'SCRAPE_FAILED', 'Failed to fetch listing content')
    } finally {
      clearTimeout(jinaTimer)
    }

    // 3.4 Groq structured extraction with timeout
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const groqController = new AbortController()
    const groqTimer = setTimeout(() => groqController.abort(), GROQ_TIMEOUT_MS)

    let rawContent: string
    try {
      const completion = await groq.chat.completions.create(
        {
          messages: [
            { role: 'system', content: EXTRACTION_PROMPT },
            { role: 'user', content: markdown },
          ],
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          response_format: { type: 'json_object' },
        },
        { signal: groqController.signal }
      )

      rawContent = completion.choices[0]?.message?.content ?? ''
    } catch (e) {
      if (groqController.signal.aborted) {
        return err(504, 'EXTRACTION_TIMEOUT', 'Extraction timed out')
      }
      throw e
    } finally {
      clearTimeout(groqTimer)
    }

    // 3.5 Parse and validate extraction result
    let extracted: Record<string, unknown>
    try {
      extracted = JSON.parse(rawContent)
    } catch {
      return err(422, 'EXTRACTION_FAILED', 'Could not parse extraction result')
    }

    if (!extracted.title || typeof extracted.title !== 'string' || extracted.title.trim() === '') {
      return err(422, 'EXTRACTION_INCOMPLETE', 'Extraction result missing required title field')
    }

    const result: ImportResult = {
      title: extracted.title as string,
      address: typeof extracted.address === 'string' ? extracted.address : null,
      city: typeof extracted.city === 'string' ? extracted.city : null,
      price: typeof extracted.price === 'number' ? extracted.price : null,
      sqm: typeof extracted.sqm === 'number' ? extracted.sqm : null,
      rooms: typeof extracted.rooms === 'number' ? extracted.rooms : null,
      description: typeof extracted.description === 'string' ? extracted.description : null,
      property_type: (['apartment', 'house', 'land', 'commercial', 'other'] as const).includes(
        extracted.property_type as ImportResult['property_type']
      )
        ? (extracted.property_type as ImportResult['property_type'])
        : 'other',
    }

    return NextResponse.json(result, { status: 200 })
  } catch {
    return err(500, 'IMPORT_FAILED', 'An unexpected error occurred')
  }
}
