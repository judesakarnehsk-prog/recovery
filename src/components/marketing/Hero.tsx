'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'
import { HeroParticles } from '@/components/marketing/HeroParticles'

const activityFeed = [
  { type: 'check', bg: 'bg-green-50', text: 'Payment recovered', amount: '$149', cardClass: 'hero-card-1', checkDelay: '1000ms' },
  { type: 'check', bg: 'bg-green-50', text: 'Payment recovered', amount: '$79',  cardClass: 'hero-card-2', checkDelay: '1300ms' },
  { type: 'retry', bg: 'bg-amber-50',  text: 'Retry scheduled',  amount: '$299', cardClass: 'hero-card-3', checkDelay: '' },
]

const chips = [
  { color: 'bg-green-500', text: 'Payment recovered $149', delay: 0.8 },
  { color: 'bg-amber-400', text: 'Email sent', delay: 1.1 },
  { color: 'bg-red-400', text: 'Retry scheduled', delay: 1.4 },
]

const trustItems = [
  'No credit card required',
  '14-day free trial',
  'Setup in 2 minutes',
  'Cancel anytime',
]

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
      {/* Particle canvas */}
      <HeroParticles />
      {/* Grid texture */}
      <div className="absolute inset-0 paper-grid" style={{ zIndex: 1 }} />
      {/* Radial fade from accent */}
      <div className="absolute inset-0 bg-hero-gradient" style={{ zIndex: 1 }} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-28 w-full" style={{ zIndex: 2 }}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm font-medium text-muted uppercase tracking-widest mb-6"
            >
              Revenue recovery for Stripe businesses
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl sm:text-6xl lg:text-[4rem] leading-[1.08] tracking-tight text-ink mb-6"
            >
              Recover the revenue{' '}
              <em className="text-accent not-italic" style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic' }}>
                Stripe can&apos;t reach
              </em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-lg text-muted leading-relaxed max-w-md mb-8"
            >
              Failed payments silently kill 4–9% of your MRR every month. Revorva recovers up to 70% of them automatically — turning lost revenue into recovered MRR while you focus on building.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6"
            >
              <Link href="/signup" onClick={() => trackEvent('cta_clicked', { location: 'hero' })}>
                <Button variant="accent" size="lg" className="group">
                  Start 14-day free trial
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </motion.div>

            {/* Trust bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="flex flex-wrap items-center gap-y-1"
            >
              {trustItems.map((item, i) => (
                <span key={item} className="flex items-center text-xs text-muted">
                  {item}
                  {i < trustItems.length - 1 && (
                    <span className="mx-2 text-border select-none">•</span>
                  )}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: dashboard card */}
          <div className="relative hidden lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white rounded-2xl border border-border shadow-elevated p-6"
            >
              {/* Dashboard header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Revenue Recovered This Month</p>
                  <p className="text-4xl font-bold text-ink">$4,280</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                    +23% vs last month
                  </span>
                  <span className="text-[10px] text-muted/50 font-medium uppercase tracking-wide">
                    Example data
                  </span>
                </div>
              </div>

              {/* Mini chart */}
              <div className="flex items-end gap-1 h-12 mb-5">
                {[35, 50, 42, 65, 55, 78, 62, 80, 70, 90, 75, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.4, delay: 0.8 + i * 0.04 }}
                    className="flex-1 rounded-sm"
                    style={{ background: i >= 9 ? '#c8401a' : '#ede9e0' }}
                  />
                ))}
              </div>

              {/* Activity feed */}
              <div className="space-y-2.5">
                {activityFeed.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 py-2 border-b border-border/50 last:border-0 ${item.cardClass}`}
                  >
                    <div className={`w-6 h-6 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0 ${item.type === 'retry' ? 'hero-ring-pulse' : ''}`}>
                      {item.type === 'check' ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="6" stroke="#16a34a" strokeWidth="1.5" fill="none" />
                          <path
                            d="M4 7l2 2 4-4"
                            stroke="#16a34a"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            className="hero-checkmark"
                            style={{ animationDelay: item.checkDelay }}
                          />
                        </svg>
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                    <span className="text-sm text-muted flex-1">{item.text}</span>
                    <span className="text-sm font-medium text-ink">{item.amount}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Floating chips */}
            <div className="absolute -right-6 top-8 space-y-2.5">
              {chips.map((chip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: chip.delay, duration: 0.4 }}
                >
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
                    className="flex items-center gap-2 bg-white border border-border rounded-full px-3 py-1.5 shadow-card text-xs font-medium text-ink whitespace-nowrap"
                  >
                    <span className={`w-2 h-2 rounded-full ${chip.color}`} />
                    {chip.text}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
