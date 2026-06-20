'use client'

import { useState } from 'react'
import { trackEvent } from '@/lib/analytics'

export function BlogEmailCapture({ source = 'blog_sidebar' }: { source?: string }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    trackEvent('lead_captured', { source })
    await fetch('/api/lead-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source }),
    })
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="bg-cream border border-border rounded-2xl p-6">
      <p className="font-semibold text-ink mb-1">Get the free recovery playbook</p>
      <p className="text-xs text-muted leading-relaxed mb-4">
        7-page guide: retry timing, email templates, and measurement framework. Free, no spam.
      </p>
      {submitted ? (
        <p className="text-sm" style={{ color: '#1a7a40' }}>Check your inbox — guide is on its way.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send me the guide'}
          </button>
        </form>
      )}
    </div>
  )
}
