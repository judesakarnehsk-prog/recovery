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
  const [error, setError] = useState('')

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
          Don't have an account?{' '}
          <Link href="/signup" className="text-accent font-medium hover:underline">
            Start free trial
          </Link>
        </p>

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
