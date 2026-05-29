'use client'

import { motion } from 'framer-motion'

const stats = [
  {
    value: '4–9%',
    label: 'of subscription payments fail every month',
  },
  {
    value: '70%',
    label: 'of failed payments are recoverable',
  },
  {
    value: '$1,200+',
    label: 'average monthly loss at $20k MRR',
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
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-xs text-muted"
        >
          Industry data from Stripe and payment processors
        </motion.p>
      </div>
    </section>
  )
}
