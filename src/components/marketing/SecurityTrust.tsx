'use client'

import { motion } from 'framer-motion'
import { Shield, CreditCard, Lock, Building2 } from 'lucide-react'

const cards = [
  {
    icon: Shield,
    title: 'Official Stripe Connect OAuth',
    body: "We connect through Stripe's official OAuth — the same way you'd authorize any trusted Stripe app.",
  },
  {
    icon: CreditCard,
    title: 'We never store card details',
    body: "Revorva never touches your customers' card numbers. All payment data stays in Stripe.",
  },
  {
    icon: Lock,
    title: 'Read-only where possible',
    body: 'We only request the Stripe permissions we need to detect failed payments and send recovery emails.',
  },
  {
    icon: Building2,
    title: 'Operated by Humanaira Ltd',
    body: 'Revorva is operated by Humanaira Ltd, a registered company in England and Wales. London, UK.',
  },
]

export function SecurityTrust() {
  return (
    <section className="py-24 lg:py-32 bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink">Your data is completely safe</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-border rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center mb-4 flex-shrink-0">
                <card.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-ink mb-2">{card.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
