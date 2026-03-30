import Groq from 'groq-sdk'

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
  const completion = await getGroq().chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `CLIENT MESSAGE:\n${userMessage}` },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  })

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
