'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

type CellVal = 'yes' | 'no' | 'partial' | string

interface Feature {
  name: string
  revorva: CellVal
  typical: CellVal
  tooltip?: string
}

const features: Feature[] = [
  {
    name: 'Personalized dunning emails',
    revorva: 'yes',
    typical: 'no',
    tooltip: 'Most tools use static templates; Revorva generates personalized copy for each customer.',
  },
  {
    name: 'Customizable email tone',
    revorva: 'yes',
    typical: 'partial',
    tooltip: 'Some tools allow template editing. Revorva lets you set a tone (friendly, direct, etc.) and adapts every email.',
  },
  {
    name: 'Smart auto-retry logic',
    revorva: 'yes',
    typical: 'yes',
  },
  {
    name: 'One-click payment update page',
    revorva: 'yes',
    typical: 'partial',
    tooltip: 'Available in some tools; not universal across all recovery platforms.',
  },
  {
    name: 'Stripe Connect (OAuth)',
    revorva: 'yes',
    typical: 'yes',
  },
  {
    name: 'Custom email branding',
    revorva: 'yes',
    typical: 'yes',
  },
  {
    name: 'Send from your own domain',
    revorva: 'yes',
    typical: 'partial',
    tooltip: 'Some tools require higher-tier plans for custom sending domains.',
  },
  {
    name: 'Real-time recovery dashboard',
    revorva: 'yes',
    typical: 'yes',
  },
  {
    name: 'Setup time',
    revorva: '~5 minutes',
    typical: '30 min – 2 hrs',
  },
  {
    name: 'Free trial without credit card',
    revorva: 'yes',
    typical: 'partial',
    tooltip: 'Some competitors offer trials; others require a credit card or annual commitment.',
  },
  {
    name: 'Starting price',
    revorva: '$29/mo',
    typical: '$49–$149/mo',
  },
]

function CellValue({ value, highlight }: { value: CellVal; highlight?: boolean }) {
  if (value === 'yes') {
    return <CheckCircle2 className={cn('w-5 h-5 mx-auto', highlight ? 'text-success' : 'text-success/70')} />
  }
  if (value === 'no') {
    return <Minus className="w-5 h-5 text-text-secondary/30 mx-auto" />
  }
  if (value === 'partial') {
    return <span className="text-xs font-medium text-amber-500 mx-auto block">Varies</span>
  }
  // String value (price, time, etc.)
  return <span className={cn('text-sm font-semibold', highlight ? 'text-text-primary' : 'text-text-secondary')}>{value}</span>
}

export function ComparisonTable() {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr>
              <th className="text-left py-4 px-4 font-medium text-text-secondary w-[240px]">Feature</th>
              <th className="py-4 px-6 text-center font-bold text-primary bg-primary/5 rounded-t-xl w-[160px]">
                Revorva
              </th>
              <th className="py-4 px-6 text-center font-medium text-text-secondary w-[160px]">
                Typical Recovery Tools
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, i) => (
              <motion.tr
                key={feature.name}
                initial={{ opacity: 0, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="border-t border-border/50"
              >
                <td className="py-3.5 px-4 text-text-primary font-medium">
                  {feature.name}
                  {feature.tooltip && (
                    <span className="block text-[11px] text-text-secondary/70 font-normal leading-snug mt-0.5">
                      {feature.tooltip}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-6 text-center bg-primary/5">
                  <CellValue value={feature.revorva} highlight />
                </td>
                <td className="py-3.5 px-6 text-center">
                  <CellValue value={feature.typical} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-text-secondary/60 leading-relaxed max-w-2xl">
        Comparison based on publicly available information as of February 2026. &ldquo;Typical Recovery Tools&rdquo; reflects common patterns across leading dunning and payment recovery platforms. Features and pricing can change. Always verify directly on competitor websites before making a purchasing decision.
      </p>
    </div>
  )
}
