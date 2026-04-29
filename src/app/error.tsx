'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <Link href="/" className="text-base font-bold text-white font-sans">
          Revorva<span className="text-accent">.</span>
        </Link>
      </div>

      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-6">
        <span className="text-accent text-xl font-bold">!</span>
      </div>

      <h1 className="text-3xl font-semibold text-white mb-3">Something went wrong</h1>
      <p className="text-muted text-sm max-w-sm leading-relaxed mb-8">
        Something went wrong on our end. We've been notified and are looking into it.
        {error.digest && (
          <span className="block mt-2 font-mono text-xs opacity-50">Error ID: {error.digest}</span>
        )}
      </p>

      <div className="flex items-center gap-3">
        <Button variant="accent" size="md" onClick={reset}>
          Try again
        </Button>
        <Link href="/">
          <Button variant="ghost" size="md" className="text-white/70 hover:text-white hover:bg-white/10">
            Go home
          </Button>
        </Link>
      </div>
    </div>
  )
}
