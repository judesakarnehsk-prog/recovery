import { NextRequest, NextResponse } from 'next/server'
import { rateLimiters } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed, resetAt } = rateLimiters.signup(ip)

  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: 'Too many signup attempts. Please try again in an hour.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  // Actual signup is handled client-side by Supabase SDK.
  // This route exists solely to enforce rate limiting.
  return NextResponse.json({ allowed: true })
}
