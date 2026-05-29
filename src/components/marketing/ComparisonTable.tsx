'use client'

import { motion } from 'framer-motion'

const rows = [
  { feature: 'Smart retry schedule', stripe: '❌ Basic only', revorva: '✅ Day 0, 3, 7, 14' },
  { feature: 'AI-personalized emails', stripe: '❌ Generic template', revorva: '✅ Name, amount, tone' },
  { feature: 'Custom email domain', stripe: '❌ Not available', revorva: '✅ Growth+ plans' },
  { feature: 'Recovery dashboard', stripe: '❌ Not included', revorva: '✅ Real-time tracking' },
  { feature: 'Per-customer control', stripe: '❌ Not available', revorva: '✅ Skip/pause per customer' },
  { feature: 'Setup time', stripe: 'N/A', revorva: '✅ 2 minutes' },
  { feature: 'Cost', stripe: 'Free', revorva: 'From $29/mo' },
]

export function ComparisonTable() {
  return (
    <section className="bg-cream py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink">How does Revorva compare?</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[520px] bg-white border border-border rounded-2xl overflow-hidden shadow-card">
            <thead>
              <tr className="border-b border-border bg-cream">
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wide w-1/2">
                  Feature
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wide">
                  Stripe Built-in
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide border-l-2 border-[#C94A1F] text-[#C94A1F]">
                  Revorva
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.feature}
                  className={i < rows.length - 1 ? 'border-b border-border' : ''}
                >
                  <td className="px-6 py-4 text-sm font-medium text-ink">{row.feature}</td>
                  <td className="px-6 py-4 text-sm text-center">
                    {row.stripe.startsWith('❌') ? (
                      <span className="text-red-500">{row.stripe}</span>
                    ) : (
                      <span className="text-muted">{row.stripe}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-center border-l-2 border-[#C94A1F] bg-orange-50/30">
                    {row.revorva.startsWith('✅') ? (
                      <span style={{ color: '#1a7a40' }}>{row.revorva}</span>
                    ) : (
                      <span className="text-ink font-medium">{row.revorva}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-sm text-muted mt-6"
        >
          Revorva pays for itself after recovering just one failed payment.
        </motion.p>
      </div>
    </section>
  )
}
