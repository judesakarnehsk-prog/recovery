/**
 * Simple in-memory rate limiter.
 *
 * TODO: Replace with Upstash Redis for production multi-instance deployments.
 * Install: npm install @upstash/ratelimit @upstash/redis
 * Docs: https://github.com/upstash/ratelimit
 *
 * Note: In-memory works fine for single-instance deployments (Vercel serverless
 * functions are stateless per-invocation, so this resets per cold start).
 * For true rate limiting on Vercel, Upstash is required.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    store.forEach((entry, key) => {
      if (entry.resetAt < now) store.delete(key)
    })
  }, 5 * 60 * 1000)
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

// Pre-configured limiters
export const rateLimiters = {
  // 5 signup attempts per hour per IP
  signup: (ip: string) => checkRateLimit(`signup:${ip}`, 5, 60 * 60 * 1000),
  // 10 login attempts per 15 minutes per IP
  login: (ip: string) => checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000),
  // 3 forgot-password attempts per hour per IP
  forgotPassword: (ip: string) => checkRateLimit(`forgot:${ip}`, 3, 60 * 60 * 1000),
}
