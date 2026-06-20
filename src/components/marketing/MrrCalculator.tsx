'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Twitter, Linkedin, Link2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'
import { cn } from '@/lib/utils'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function MrrCalculator() {
  const [mrr, setMrr] = useState(20000)
  const [copied, setCopied] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const monthlyLoss = mrr * 0.06
  const yearlyLoss = mrr * 0.06 * 12
  const recoverable = mrr * 0.06 * 0.7
  const dailyLoss = monthlyLoss / 30
  const perSecondLoss = dailyLoss / 86400

  // Reset elapsed when MRR changes
  useEffect(() => {
    setElapsed(0)
  }, [mrr])

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const shareText = `I just learned I'm losing ${formatCurrency(yearlyLoss)} to failed Stripe payments every year. Every SaaS founder should check this. revorva.com`
  const shareUrl = 'https://revorva.com'

  const handleTwitter = () => {
    trackEvent('calculator_shared', { platform: 'twitter' })
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleLinkedIn = () => {
    trackEvent('calculator_shared', { platform: 'linkedin' })
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      trackEvent('calculator_shared', { platform: 'copy' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: ignore
    }
  }

  return (
    <section className="py-24 lg:py-32 bg-paper">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink mb-3">
            How much are you losing right now?
          </h2>
          <p className="text-muted">Enter your MRR and see the impact of failed payments in real time.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white border border-border rounded-2xl p-8"
        >
          {/* MRR input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-ink mb-2">
              Monthly Recurring Revenue (MRR)
            </label>
            <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent/30 bg-white max-w-xs">
              <span className="px-4 py-3 text-muted font-medium bg-cream border-r border-border select-none">$</span>
              <input
                type="number"
                min={0}
                value={mrr}
                onChange={(e) => setMrr(Math.max(0, Number(e.target.value)))}
                className="flex-1 px-4 py-3 text-ink text-lg font-semibold focus:outline-none bg-white"
                placeholder="20,000"
              />
            </div>
          </div>

          {/* Real-time loss ticker */}
          {mrr > 0 && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-red-500 uppercase tracking-wide">
                Lost since you opened this page
              </p>
              <motion.p
                key={Math.floor(elapsed)}
                className="text-sm font-bold text-red-600 tabular-nums"
              >
                {formatCurrencyPrecise(perSecondLoss * elapsed)}
              </motion.p>
            </div>
          )}

          {/* Result cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">Monthly loss</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(monthlyLoss)}</p>
              <p className="text-xs text-red-400 mt-1">~6% of MRR</p>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">Yearly loss</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(yearlyLoss)}</p>
              <p className="text-xs text-red-400 mt-1">if nothing changes</p>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Recoverable with Revorva</p>
              <p className="text-3xl font-bold" style={{ color: '#1a7a40' }}>{formatCurrency(recoverable)}</p>
              <p className="text-xs text-green-600 mt-1">per month, automatically</p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/signup">
              <Button variant="accent" size="lg" className="group">
                Stop losing {formatCurrency(dailyLoss)} every day
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <p className="text-xs text-muted mt-3">14-day free trial · No credit card required</p>
          </div>

          {/* Share row */}
          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <p className="text-xs text-muted font-medium">Share this with a fellow founder</p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTwitter}
                title="Share on X / Twitter"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-[#C94A1F] hover:border-[#C94A1F] transition-colors"
              >
                <Twitter className="w-3.5 h-3.5" />
                X / Twitter
              </button>
              <button
                onClick={handleLinkedIn}
                title="Share on LinkedIn"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-[#C94A1F] hover:border-[#C94A1F] transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
                LinkedIn
              </button>
              <button
                onClick={handleCopy}
                title="Copy link"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors',
                  copied
                    ? 'border-green-300 text-green-700 bg-green-50'
                    : 'border-border text-muted hover:text-[#C94A1F] hover:border-[#C94A1F]'
                )}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span key="check" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </motion.span>
                  ) : (
                    <motion.span key="copy" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5" />
                      Copy link
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-muted">
            Calculate your potential recovery before your competitors do.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
