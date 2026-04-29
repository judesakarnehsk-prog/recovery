'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    emoji: '🔗',
    number: '01',
    title: 'Connect Stripe',
    body: 'Click connect, authorize Revorva in Stripe. That\'s the entire setup. We instantly start listening for failed payments on your account.',
  },
  {
    emoji: '⚡',
    number: '02',
    title: 'We handle everything',
    body: 'When a payment fails, Revorva automatically sends a personalized recovery email to your customer and schedules smart payment retries over 14 days.',
  },
  {
    emoji: '📈',
    number: '03',
    title: 'Watch revenue recover',
    body: 'See exactly how much revenue was recovered, which customers paid, and what\'s still pending — all in a clean, simple dashboard.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink">
            Set it up once. Recover revenue{' '}
            <em style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic' }}>forever.</em>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, i) => (
            <div key={step.number} className="relative flex flex-col">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-white border border-border rounded-2xl p-6 flex-1"
              >
                <div className="text-3xl mb-4">{step.emoji}</div>
                <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">{step.number}</p>
                <h3 className="text-lg font-semibold text-ink mb-3">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.body}</p>
              </motion.div>

              {/* Connector arrow (hidden on mobile) */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-10 h-10 bg-paper flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-border" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
