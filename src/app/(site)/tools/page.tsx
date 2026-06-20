import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, TrendingDown, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Free SaaS Tools',
  description: 'Free calculators for SaaS founders — MRR loss, churn cost, and recovery ROI. No signup required.',
  openGraph: {
    title: 'Free SaaS Tools for Founders — Revorva',
    description: 'Free calculators for SaaS founders — MRR loss, churn cost, and recovery ROI. No signup required.',
  },
}

const tools = [
  {
    icon: TrendingDown,
    title: 'MRR Loss Calculator',
    description: 'See exactly how much you\'re losing to failed payments every month — based on your actual MRR.',
    href: '/tools/recovery-calculator',
    cta: 'Calculate my loss',
    color: 'text-red-500',
    bg: 'bg-red-50',
  },
  {
    icon: BarChart3,
    title: 'Churn Cost Calculator',
    description: 'Calculate the true lifetime cost of every churned customer, including acquisition cost and LTV.',
    href: '/tools/churn-calculator',
    cta: 'Calculate churn cost',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Calculator,
    title: 'Recovery ROI Calculator',
    description: 'How much would Revorva recover for your business specifically? Enter your MRR and see the upside.',
    href: '/tools/mrr-impact-calculator',
    cta: 'Calculate ROI',
    color: 'text-[#1a7a40]',
    bg: 'bg-green-50',
  },
]

export default function ToolsPage() {
  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-4">Free Tools</p>
          <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight mb-4">
            Free tools for SaaS founders
          </h1>
          <p className="text-lg text-muted max-w-xl mx-auto">
            No signup required. Built for the SaaS community.
          </p>
        </div>

        {/* Tool cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group bg-white border border-border rounded-2xl p-6 hover:shadow-elevated transition-shadow duration-200"
            >
              <div className={`w-12 h-12 ${tool.bg} rounded-xl flex items-center justify-center mb-4`}>
                <tool.icon className={`w-6 h-6 ${tool.color}`} />
              </div>
              <h2 className="font-semibold text-ink text-lg mb-2">{tool.title}</h2>
              <p className="text-sm text-muted leading-relaxed mb-4">{tool.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all">
                {tool.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-muted mt-12">
          These calculators use industry benchmarks from Stripe, Recurly, and Profitwell.
          Results are estimates based on typical SaaS businesses.
        </p>
      </div>
    </div>
  )
}
