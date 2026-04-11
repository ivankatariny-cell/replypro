import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const FALLBACK = { success: true, remaining: 999 }

function isValidEnvVar(value: string | undefined): boolean {
  return !!value && value.length > 0 && !value.startsWith('your-')
}

let ratelimit: Ratelimit | null = null

try {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (isValidEnvVar(url) && isValidEnvVar(token)) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      analytics: false,
    })
  } else {
    console.warn('[rate-limit] Upstash not configured, rate limiting disabled')
  }
} catch (err) {
  console.warn('[rate-limit] Upstash not configured, rate limiting disabled', err)
}

export async function rateLimit(userId: string): Promise<{ success: boolean; remaining: number }> {
  if (!ratelimit) return FALLBACK

  try {
    const { success, remaining } = await ratelimit.limit(userId)
    return { success, remaining }
  } catch (err) {
    console.warn('[rate-limit] Rate limit check failed, allowing request', err)
    return FALLBACK
  }
}
