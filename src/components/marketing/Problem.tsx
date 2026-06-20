'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const stats = [
  {
    value: '$1,000+',
    label: 'Average monthly loss for a $20k MRR business',
    source: 'Calculated from industry-wide failure rates',
  },
  {
    value: '4–9%',
    label: 'Of payments fail every month',
    source: 'Recurly, 2024 SaaS Payment Recovery Report',
  },
  {
    value: '70%',
    label: 'Of failed payments are recoverable',
    source: 'Stripe Subscription Best Practices, 2023',
  },
  {
    value: '2 min',
    label: 'Time to set up Revorva',
    source: null,
  },
]

function DunningTerm() {
  const [visible, setVisible] = useState(false)
  return (
    <span className="relative inline-block">
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        className="border-b border-dashed border-muted/50 text-inherit cursor-help focus:outline-none"
        aria-describedby="dunning-tooltip"
      >
        dunning
      </button>
      <AnimatePresence>
        {visible && (
          <motion.div
            id="dunning-tooltip"
            role="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-64 bg-ink text-white text-xs leading-relaxed rounded-lg px-3 py-2 shadow-elevated pointer-events-none"
          >
            <strong>Dunning</strong> = the process of recovering failed payments through retries and customer outreach.
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

export function Problem() {
  return (
    <section className="bg-cream py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-4">The Problem</p>
            <h2 className="font-display text-4xl lg:text-5xl text-ink leading-tight mb-6">
              Every month, money disappears and you don't notice
            </h2>
            <p className="text-muted leading-relaxed mb-4">
              When a customer's card fails, most businesses either retry blindly or do nothing. The customer churns without ever meaning to. You lose revenue without a single cancellation.
            </p>
            <p className="text-muted leading-relaxed">
              Stripe&apos;s built-in <DunningTerm /> is basic. It doesn&apos;t send smart emails, doesn&apos;t personalize outreach, and doesn&apos;t show you what you&apos;re losing.
            </p>
          </motion.div>

          {/* Right stat cards */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white border border-border rounded-2xl p-5"
              >
                <p className="text-3xl font-bold text-ink mb-1.5">{stat.value}</p>
                <p className="text-sm text-muted leading-snug">{stat.label}</p>
                {stat.source && (
                  <p className="text-[11px] italic mt-2 leading-snug" style={{ color: '#6B7280' }}>
                    Source: {stat.source}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
