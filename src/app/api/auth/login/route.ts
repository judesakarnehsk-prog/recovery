import { NextRequest, NextResponse } from 'next/server'
import { rateLimiters } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed, resetAt } = rateLimiters.login(ip)

  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait 15 minutes before trying again.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  // Actual login is handled client-side by Supabase SDK.
  // This route exists solely to enforce rate limiting.
  // The client checks this endpoint first, then calls supabase.auth.signInWithPassword().
  return NextResponse.json({ allowed: true })
}
