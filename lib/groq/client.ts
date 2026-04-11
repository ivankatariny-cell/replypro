import Groq from 'groq-sdk'

const GROQ_TIMEOUT_MS = 30_000

let _groq: Groq | null = null

function getGroq(): Groq {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return _groq
}

export async function generateReplies(
  systemPrompt: string,
  userMessage: string
): Promise<{
  professional: string
  friendly: string
  direct: string
  detected_language: 'hr' | 'en'
}> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS)

  let completion
  try {
    completion = await getGroq().chat.completions.create(
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `PORUKA KLIJENTA:\n${userMessage}` },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      },
      { signal: controller.signal }
    )
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error('AI generation timed out after 30 seconds. Please try again.')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('Empty response from AI')

  const parsed = JSON.parse(content)

  if (!parsed.professional || !parsed.friendly || !parsed.direct) {
    throw new Error('Invalid AI response structure')
  }

  return {
    professional: parsed.professional,
    friendly: parsed.friendly,
    direct: parsed.direct,
    detected_language: parsed.detected_language || 'hr',
  }
}
