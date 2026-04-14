'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo, LogoMark } from '@/components/Logo'
import { createClient } from '@/lib/supabase/client'
import { NoiseTexture } from '@/components/InteractiveBackground'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'password' | 'magic'>('password')

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setMagicLinkSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex relative">
      {/* Left decoration panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark-gradient relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-accent/15 blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        </div>
        <div className="absolute inset-0 grid-bg opacity-20" />
        <NoiseTexture opacity={0.05} />
        <div className="relative text-center max-w-md px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mx-auto mb-8">
              <LogoMark size="lg" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Welcome back
            </h2>
            <p className="text-white/60 leading-relaxed">
              Log in to your dashboard and see how much revenue Revorva has recovered for you.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>

          <h1 className="text-2xl font-extrabold text-text-primary mb-2">Log in to your account</h1>
          <p className="text-text-secondary mb-8">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up free
            </Link>
          </p>

          {magicLinkSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-8 bg-success/5 border border-success/20 rounded-2xl"
            >
              <Mail className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text-primary mb-2">Check your email</h3>
              <p className="text-sm text-text-secondary">
                We sent a magic link to <strong>{email}</strong>. Click it to log in.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Mode toggle */}
              <div className="flex gap-1 p-1 bg-white rounded-xl border border-border mb-6">
                <button
                  onClick={() => setMode('password')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    mode === 'password' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Password
                </button>
                <button
                  onClick={() => setMode('magic')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'magic' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Magic Link
                </button>
              </div>

              <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {mode === 'password' && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-cta bg-cta/5 px-4 py-2 rounded-lg"
                  >
                    {error}
                  </motion.p>
                )}

                <Button type="submit" variant="cta" size="lg" className="w-full group" loading={loading}>
                  {mode === 'password' ? 'Log in' : 'Send Magic Link'}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
