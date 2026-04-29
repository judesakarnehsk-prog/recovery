'use client'

import { motion } from 'framer-motion'

const features = [
  {
    title: 'AI-Personalized Emails',
    body: "Every recovery email is written by AI using your customer's name, the exact amount owed, and your business name. Feels human, converts better.",
  },
  {
    title: 'Smart Retry Schedule',
    body: 'We retry payments on Day 0, 3, 7, and 14 — timed to when banks are most likely to approve. Not the same time every day like Stripe does.',
  },
  {
    title: 'One-Click Stripe Connect',
    body: 'No API keys to copy. No webhooks to configure. Just click Connect and we handle the rest via Stripe OAuth.',
  },
  {
    title: 'Custom Email Domain (Scale)',
    body: 'Send recovery emails from billing@yourcompany.com instead of billing@revorva.com. Add 2 DNS records and you\'re done.',
  },
]

export function Features() {
  return (
    <section className="bg-cream py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink">Everything you need. Nothing you don't.</h2>
        </motion.div>

        {/* 2×2 feature grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white border border-border rounded-2xl p-6"
            >
              <h3 className="text-base font-semibold text-ink mb-2">{feature.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{feature.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Wide accent card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="bg-accent-light border border-accent/20 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="flex-shrink-0 text-center sm:text-left">
            <p className="font-display text-6xl text-accent leading-none">Up to 70%</p>
          </div>
          <div className="w-px bg-accent/20 self-stretch hidden sm:block" />
          <p className="text-ink/80 text-lg leading-relaxed text-center sm:text-left">
            Of failed payments recovered automatically — with zero manual work from you.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
