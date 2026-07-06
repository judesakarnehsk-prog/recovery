'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    // Persist any pending plan selection so the dashboard can redirect to checkout
    const plan = searchParams.get('plan')
    if (plan && ['starter', 'growth', 'scale'].includes(plan)) {
      localStorage.setItem('pending_plan', plan)
    }
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
      },
    })
    // Browser will redirect — no need to reset loading state
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')

    // Rate limit check
    const rl = await fetch('/api/auth/signup', { method: 'POST' })
    if (rl.status === 429) {
      const data = await rl.json()
      setError(data.error)
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { company_name: businessName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Persist plan choice so dashboard can redirect to checkout after email confirmation
    const plan = searchParams.get('plan')
    if (plan && ['starter', 'growth', 'scale'].includes(plan)) {
      localStorage.setItem('pending_plan', plan)
    }

    trackEvent('sign_up', { plan: searchParams.get('plan') || 'starter' })
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-white border border-border rounded-2xl p-8 shadow-card text-center">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="font-display text-2xl text-ink mb-2">Check your email</h2>
          <p className="text-sm text-muted leading-relaxed">
            We sent a confirmation link to <strong className="text-ink">{email}</strong>. Click it to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-border rounded-2xl p-8 shadow-card">
        <h1 className="font-display text-3xl text-ink mb-1">Start your free trial</h1>
        <p className="text-sm text-muted mb-7">
          14 days free. No credit card required.{' '}
          <Link href="/login" className="text-accent font-medium hover:underline">
            Already have an account?
          </Link>
        </p>

        {/* Google sign up */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="google-btn"
        >
          {googleLoading ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ animation: 'spin 0.8s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            id="business"
            type="text"
            label="Business name"
            placeholder="Acme Inc."
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            autoComplete="organization"
          />
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          <Button type="submit" variant="accent" size="lg" className="w-full group" loading={loading}>
            Create account
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </form>

        <p className="text-xs text-muted text-center mt-4 leading-relaxed">
          By signing up you agree to our{' '}
          <Link href="/terms" className="hover:text-ink underline">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="hover:text-ink underline">Privacy Policy</Link>.
        </p>

        <p className="text-xs text-center text-muted mt-2">
          Join 200+ founders recovering lost revenue
        </p>
      </div>

    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
