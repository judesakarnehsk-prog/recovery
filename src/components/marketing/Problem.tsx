'use client'

import { motion } from 'framer-motion'

const stats = [
  { value: '$1,000+', label: 'Average monthly loss for a $20k MRR business' },
  { value: '4–9%', label: 'Of payments fail every month' },
  { value: '70%', label: 'Of failed payments are recoverable' },
  { value: '2 min', label: 'Time to set up Revorva' },
]

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
              Stripe's built-in dunning is basic. It doesn't send smart emails, doesn't personalize outreach, and doesn't show you what you're losing.
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
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
