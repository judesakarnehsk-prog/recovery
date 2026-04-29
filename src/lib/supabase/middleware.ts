import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdmin } from '@/lib/admin'

const PAID_PLANS = ['starter', 'growth', 'scale']
const HARD_BLOCKED_PLANS = ['expired', 'free']
// past_due gets a grace period: blocked from app but shown an upgrade banner
// (handled via redirect to /billing?past_due=true — same page, gentler message)

// Routes always accessible regardless of plan (so user can actually upgrade)
const ALWAYS_ALLOWED = ['/billing', '/help']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const protectedRoutes = ['/dashboard', '/onboarding', '/connect', '/billing', '/integrations', '/settings', '/admin', '/recoveries', '/profile']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Enforce email verification — redirect unverified users to /verify-email
  const isVerifyEmailRoute = request.nextUrl.pathname.startsWith('/verify-email')
  if (isProtectedRoute && user && !user.email_confirmed_at && !isVerifyEmailRoute) {
    return NextResponse.redirect(new URL('/verify-email', request.url))
  }

  // Admin-only routes
  if (request.nextUrl.pathname.startsWith('/admin') && user) {
    const { data: profile } = await supabase.from('users').select('email').eq('id', user.id).single()
    if (!profile || !isAdmin(profile.email)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // ─── Plan / trial enforcement ─────────────────────────────────────────────
  // Only applies to authenticated users on protected app routes.
  // /billing and /help are always accessible so the user can upgrade.
  if (isProtectedRoute && user) {
    const isAlwaysAllowed = ALWAYS_ALLOWED.some(p => request.nextUrl.pathname.startsWith(p))

    if (!isAlwaysAllowed) {
      const { data: profile } = await supabase
        .from('users')
        .select('plan, trial_ends_at')
        .eq('id', user.id)
        .single()

      const plan = profile?.plan ?? 'trial'
      const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null

      if (PAID_PLANS.includes(plan)) {
        // Full access — paid subscriber
      } else if (HARD_BLOCKED_PLANS.includes(plan)) {
        // Trial expired and was already downgraded — hard redirect
        return NextResponse.redirect(new URL('/billing?expired=true', request.url))
      } else if (plan === 'past_due') {
        // Subscription in past_due — redirect with flag for banner, still lets
        // them see billing page to resolve it
        return NextResponse.redirect(new URL('/billing?past_due=true', request.url))
      } else if (plan === 'trial') {
        // Active trial — check expiry date
        if (trialEndsAt && trialEndsAt < new Date()) {
          // Trial has expired but webhook hasn't updated plan yet (race / Stripe delay).
          // Treat the same as expired.
          return NextResponse.redirect(new URL('/billing?expired=true', request.url))
        }
        // Trial is still active — full access
      }
    }
  }

  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}
