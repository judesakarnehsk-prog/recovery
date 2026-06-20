'use client'

import { motion } from 'framer-motion'

type CellValue = { text: string; type: 'yes' | 'no' | 'neutral' | 'highlight' }

interface Row {
  feature: string
  nothing: CellValue
  stripe: CellValue
  churnkey: CellValue
  revorva: CellValue
}

const rows: Row[] = [
  {
    feature: 'Smart retry schedule',
    nothing: { text: '❌ None', type: 'no' },
    stripe: { text: '❌ Basic only', type: 'no' },
    churnkey: { text: '✅ Yes', type: 'yes' },
    revorva: { text: '✅ Day 0, 3, 7, 14', type: 'highlight' },
  },
  {
    feature: 'AI-personalized emails',
    nothing: { text: '❌ None', type: 'no' },
    stripe: { text: '❌ Generic template', type: 'no' },
    churnkey: { text: '✅ Yes', type: 'yes' },
    revorva: { text: '✅ Name, amount, tone', type: 'highlight' },
  },
  {
    feature: 'Custom email domain',
    nothing: { text: '❌ None', type: 'no' },
    stripe: { text: '❌ Not available', type: 'no' },
    churnkey: { text: '✅ Yes', type: 'yes' },
    revorva: { text: '✅ Growth+ plans', type: 'highlight' },
  },
  {
    feature: 'Recovery dashboard',
    nothing: { text: '❌ None', type: 'no' },
    stripe: { text: '❌ Not included', type: 'no' },
    churnkey: { text: '✅ Yes', type: 'yes' },
    revorva: { text: '✅ Real-time tracking', type: 'highlight' },
  },
  {
    feature: 'Per-customer control',
    nothing: { text: '❌ None', type: 'no' },
    stripe: { text: '❌ Not available', type: 'no' },
    churnkey: { text: '✅ Yes', type: 'yes' },
    revorva: { text: '✅ Skip/pause per customer', type: 'highlight' },
  },
  {
    feature: 'Retries timed to bank cycles',
    nothing: { text: '❌ None', type: 'no' },
    stripe: { text: '❌ Fixed schedule', type: 'no' },
    churnkey: { text: '✅ Yes', type: 'yes' },
    revorva: { text: '✅ Optimised timing', type: 'highlight' },
  },
  {
    feature: 'Custom sender domain',
    nothing: { text: '❌ None', type: 'no' },
    stripe: { text: '❌ Not available', type: 'no' },
    churnkey: { text: '✅ Yes', type: 'yes' },
    revorva: { text: '✅ billing@yourdomain.com', type: 'highlight' },
  },
  {
    feature: 'Tone customisation per customer',
    nothing: { text: '❌ None', type: 'no' },
    stripe: { text: '❌ Not available', type: 'no' },
    churnkey: { text: '❌ Limited', type: 'no' },
    revorva: { text: '✅ Friendly / Professional / Empathetic', type: 'highlight' },
  },
  {
    feature: 'Pause recovery temporarily',
    nothing: { text: 'N/A', type: 'neutral' },
    stripe: { text: '❌ Not available', type: 'no' },
    churnkey: { text: '✅ Yes', type: 'yes' },
    revorva: { text: '✅ Per customer or global', type: 'highlight' },
  },
  {
    feature: 'Skip recovery for specific customers',
    nothing: { text: 'N/A', type: 'neutral' },
    stripe: { text: '❌ Not available', type: 'no' },
    churnkey: { text: '✅ Yes', type: 'yes' },
    revorva: { text: '✅ One click', type: 'highlight' },
  },
  {
    feature: 'Detailed recovery analytics',
    nothing: { text: '❌ None', type: 'no' },
    stripe: { text: '❌ Basic only', type: 'no' },
    churnkey: { text: '✅ Yes', type: 'yes' },
    revorva: { text: '✅ Real-time dashboard', type: 'highlight' },
  },
  {
    feature: 'Setup time',
    nothing: { text: 'N/A', type: 'neutral' },
    stripe: { text: 'Minimal', type: 'neutral' },
    churnkey: { text: 'Hours (dev needed)', type: 'neutral' },
    revorva: { text: '✅ 2 minutes', type: 'highlight' },
  },
  {
    feature: 'Starting price',
    nothing: { text: '$0 (losing 4–9% MRR)', type: 'no' },
    stripe: { text: '$0 (limited)', type: 'neutral' },
    churnkey: { text: '$250+/mo', type: 'no' },
    revorva: { text: '$29/mo', type: 'highlight' },
  },
  {
    feature: '14-day free trial',
    nothing: { text: 'N/A', type: 'neutral' },
    stripe: { text: 'N/A', type: 'neutral' },
    churnkey: { text: '❌', type: 'no' },
    revorva: { text: '✅', type: 'highlight' },
  },
  {
    feature: 'Made for early-stage SaaS',
    nothing: { text: 'N/A', type: 'neutral' },
    stripe: { text: 'Generic', type: 'neutral' },
    churnkey: { text: '❌ Enterprise focus', type: 'no' },
    revorva: { text: '✅', type: 'highlight' },
  },
]

function Cell({ cell }: { cell: CellValue }) {
  if (cell.type === 'yes') return <span style={{ color: '#1a7a40' }}>{cell.text}</span>
  if (cell.type === 'no') return <span className="text-red-500">{cell.text}</span>
  if (cell.type === 'highlight') return <span style={{ color: '#1a7a40' }} className="font-medium">{cell.text}</span>
  return <span className="text-muted">{cell.text}</span>
}

export function ComparisonTable() {
  return (
    <section className="bg-cream py-24 lg:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
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
          className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0"
        >
          <table className="w-full min-w-[680px] bg-white border border-border rounded-2xl overflow-hidden shadow-card">
            <thead>
              <tr className="border-b border-border bg-cream">
                <th className="px-5 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wide">
                  Feature
                </th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wide">
                  Doing Nothing
                </th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wide">
                  Stripe Built-in
                </th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wide">
                  Churnkey
                </th>
                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide border-l-2 border-[#C94A1F] text-[#C94A1F]">
                  Revorva
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className={i < rows.length - 1 ? 'border-b border-border' : ''}
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-ink">{row.feature}</td>
                  <td className="px-5 py-3.5 text-sm text-center"><Cell cell={row.nothing} /></td>
                  <td className="px-5 py-3.5 text-sm text-center"><Cell cell={row.stripe} /></td>
                  <td className="px-5 py-3.5 text-sm text-center"><Cell cell={row.churnkey} /></td>
                  <td className="px-5 py-3.5 text-sm text-center border-l-2 border-[#C94A1F] bg-orange-50/30">
                    <Cell cell={row.revorva} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 space-y-4"
        >
          <p className="text-sm text-muted leading-relaxed">
            Stripe&rsquo;s built-in dunning handles the basics — but treats every failed payment the same. It retries on a fixed schedule with generic emails. Revorva builds on top of Stripe with smart timing, personalised emails, and granular control that customers expect in 2026.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-900 leading-relaxed">
            <span className="font-semibold">Important:</span> Revorva works <em>alongside</em> Stripe&rsquo;s built-in dunning, not against it. We add the smart layer that makes Stripe&rsquo;s basic retries dramatically more effective.
          </div>
        </motion.div>
      </div>
    </section>
  )
}
