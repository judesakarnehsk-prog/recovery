'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
      },
    })
    // Browser will redirect — no need to reset loading state
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Rate limit check
    const rl = await fetch('/api/auth/login', { method: 'POST' })
    if (rl.status === 429) {
      const data = await rl.json()
      setError(data.error)
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    trackEvent('login')
    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-border rounded-2xl p-8 shadow-card">
        <h1 className="font-display text-3xl text-ink mb-1">Welcome back</h1>
        <p className="text-sm text-muted mb-7">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-accent font-medium hover:underline">
            Start free trial
          </Link>
        </p>

        {/* Google sign in */}
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

        <form onSubmit={handleLogin} className="space-y-4">
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
          <div className="space-y-1.5">
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <div className="text-right">
              <Link href="/forgot-password" className="text-xs text-muted hover:text-ink transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          <Button type="submit" variant="accent" size="lg" className="w-full group" loading={loading}>
            Log in
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </form>
      </div>

    </div>
  )
}
