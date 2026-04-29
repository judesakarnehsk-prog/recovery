'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

const badges = [
  'AI-personalized',
  'Sent automatically',
  'Your brand name',
]

export function EmailPreview() {
  return (
    <section className="py-24 lg:py-32 bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink">
            The email your customers actually receive
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-xl mx-auto"
        >
          {/* Email mockup */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-card">
            {/* Email header bar */}
            <div className="bg-cream border-b border-border px-5 py-4">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs text-muted">From:</span>
                <span className="text-xs text-ink font-medium">Acme SaaS Billing &lt;billing@revorva.com&gt;</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted">Subject:</span>
                <span className="text-xs text-ink font-medium">Quick update on your Acme SaaS subscription</span>
              </div>
            </div>

            {/* Email body */}
            <div className="px-6 py-6 space-y-4">
              <p className="text-sm text-ink/80 leading-relaxed">Hi Sarah,</p>
              <p className="text-sm text-ink/80 leading-relaxed">
                We weren't able to process your payment of <strong>$79</strong> for your Acme SaaS subscription — this usually happens when a card expires or details have changed.
              </p>
              <p className="text-sm text-ink/80 leading-relaxed">
                No worries at all. It only takes a moment to fix:
              </p>
              <div>
                <a className="inline-flex items-center gap-2 bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer">
                  Update my payment details →
                </a>
              </div>
              <p className="text-sm text-ink/80 leading-relaxed">
                Your account is still active while we sort this out.
              </p>
              <p className="text-sm text-muted">— The Acme SaaS team</p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            {badges.map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 text-sm text-muted">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                {badge}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
