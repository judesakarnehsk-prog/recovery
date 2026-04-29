'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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
