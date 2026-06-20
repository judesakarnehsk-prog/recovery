'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'

export function FinalCTA() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'homepage_final_cta' }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      trackEvent('lead_captured', { source: 'homepage_final_cta' })
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-24 lg:py-32 bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-ink rounded-3xl overflow-hidden px-8 py-16 text-center"
        >
          {/* Accent glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-accent/20 blur-3xl rounded-full" />

          <div className="relative">
            <h2 className="font-display text-4xl lg:text-5xl text-white mb-4">
              You&apos;re losing money{' '}
              <em style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic', color: '#f0ded8' }}>
                right now
              </em>
            </h2>
            <p className="text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
              Every day without smart dunning is revenue you never get back. Connect Stripe and see your exact recovery potential in 2 minutes — free.
            </p>
            <Link href="/signup" onClick={() => trackEvent('cta_clicked', { location: 'footer' })}>
              <Button variant="accent" size="lg" className="group mx-auto">
                Connect Stripe — Start Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <p className="text-white/40 text-sm mt-4">
              Questions? Email us at{' '}
              <a href="mailto:support@revorva.com" className="underline hover:text-white/60 transition-colors">
                support@revorva.com
              </a>
            </p>

            {/* Divider */}
            <div className="relative my-10 max-w-xs mx-auto">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-ink px-4 text-xs text-white/30 font-medium uppercase tracking-widest">
                  or
                </span>
              </div>
            </div>

            {/* Lead capture */}
            <div className="max-w-md mx-auto">
              <p className="text-white font-semibold text-lg mb-1">Not ready yet?</p>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Get our free guide: &ldquo;The SaaS Founder&apos;s Playbook for Recovering Failed Payments&rdquo; — 5 pages, actionable, no fluff.
              </p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 text-white/70 text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Check your inbox. Guide on its way.
                </motion.div>
              ) : (
                <form onSubmit={handleLeadCapture} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-lg border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {submitting ? 'Sending…' : 'Send me the guide'}
                  </button>
                </form>
              )}
              {error && (
                <p className="text-red-400 text-xs mt-2">{error}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
