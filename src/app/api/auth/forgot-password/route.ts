import { NextRequest, NextResponse } from 'next/server'
import { rateLimiters } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed, resetAt } = rateLimiters.forgotPassword(ip)

  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please wait an hour before requesting another reset link.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  // Actual reset email is sent client-side via supabase.auth.resetPasswordForEmail().
  // This route exists solely to enforce rate limiting.
  return NextResponse.json({ allowed: true })
}
