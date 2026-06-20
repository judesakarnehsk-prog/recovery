'use client'

import { motion } from 'framer-motion'

const stats = [
  {
    value: '4–9%',
    label: 'of subscription payments fail every month',
    source: 'Recurly, 2024 SaaS Payment Recovery Report',
  },
  {
    value: '70%',
    label: 'of failed payments are recoverable',
    source: 'Stripe Subscription Best Practices, 2023',
  },
  {
    value: '$1,200+',
    label: 'average monthly loss at $20k MRR',
    source: 'Calculated from industry-wide failure rates',
  },
]

export function IndustryStats() {
  return (
    <section className="bg-cream py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink">The problem is bigger than you think</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-border rounded-2xl p-8 text-center"
            >
              <p className="font-display text-5xl text-accent mb-3">{stat.value}</p>
              <p className="text-sm text-muted leading-snug">{stat.label}</p>
              <p className="text-[11px] italic mt-2 leading-snug" style={{ color: '#6B7280' }}>
                Source: {stat.source}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
