'use client'

import { useState } from 'react'
import { Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')

  const handleResend = async () => {
    setResending(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      setError('Could not find your email. Please try logging in again.')
      setResending(false)
      return
    }
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    })
    if (resendError) {
      setError(resendError.message)
    } else {
      setResent(true)
    }
    setResending(false)
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-border rounded-2xl p-8 shadow-card text-center">
        <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-accent" />
        </div>
        <h1 className="font-display text-2xl text-ink mb-2">Verify your email</h1>
        <p className="text-sm text-muted leading-relaxed mb-6">
          Please check your inbox and click the verification link we sent you before accessing your dashboard.
        </p>

        {resent ? (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 mb-4">
            <CheckCircle2 className="w-4 h-4" />
            Verification email resent. Check your inbox.
          </div>
        ) : (
          <>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 mb-4">
                {error}
              </p>
            )}
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={handleResend}
              loading={resending}
            >
              Resend verification email
            </Button>
          </>
        )}

        <p className="text-xs text-muted mt-5">
          Wrong account?{' '}
          <a
            href="/login"
            onClick={async (e) => {
              e.preventDefault()
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
            className="text-accent hover:underline"
          >
            Sign out
          </a>
        </p>
      </div>
    </div>
  )
}
