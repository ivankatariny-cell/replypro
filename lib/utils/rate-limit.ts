const rateMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(userId: string, limit = 30, windowMs = 60000): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  const entry = rateMap.get(userId)

  if (!entry || now > entry.resetTime) {
    rateMap.set(userId, { count: 1, resetTime: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  entry.count++
  return { allowed: true, retryAfter: 0 }
}
