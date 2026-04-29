'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    quote: "I had no idea how much I was losing until Revorva showed me. First month it recovered $1,200 I would have just… lost.",
    name: 'James K.',
    role: 'Founder at Stackr',
    initials: 'JK',
  },
  {
    quote: "The setup was genuinely 2 minutes. Connected Stripe, done. Woke up the next day and it had already sent 3 recovery emails.",
    name: 'Maria L.',
    role: 'CEO at Notifi',
    initials: 'ML',
  },
  {
    quote: "We were using Stripe's built-in dunning and thought it was fine. Revorva recovers 3x more. Wish I'd switched sooner.",
    name: 'Dan P.',
    role: 'Founder at Pulseboard',
    initials: 'DP',
  },
]

export function Testimonials() {
  return (
    <section className="bg-cream py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink">What founders are saying</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-border rounded-2xl p-6 flex flex-col"
            >
              <p className="text-sm text-ink/80 leading-relaxed flex-1 mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cream border border-border flex items-center justify-center text-xs font-semibold text-ink flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
