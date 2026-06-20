'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

export default function RecoveryCalculatorPage() {
  const [mrr, setMrr] = useState(20000)
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')

  const monthlyLoss = mrr * 0.06
  const yearlyLoss = monthlyLoss * 12
  const recoverable = monthlyLoss * 0.7

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    trackEvent('lead_captured', { source: 'recovery_calculator' })
    await fetch('/api/lead-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'recovery_calculator' }),
    })
    setSubmitted(true)
  }

  return (
    <div className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link href="/tools" className="text-sm text-muted hover:text-ink transition-colors">← All tools</Link>
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mt-6 mb-3">Free Tool</p>
          <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight mb-3">
            MRR Loss Calculator
          </h1>
          <p className="text-lg text-muted">
            See exactly how much failed payments are costing your business every month.
          </p>
        </div>

        {/* Methodology */}
        <div className="bg-cream border border-border rounded-xl p-5 mb-6 text-sm text-muted leading-relaxed">
          <p>
            This calculator uses industry data from{' '}
            <strong className="text-ink">Recurly</strong>,{' '}
            <strong className="text-ink">Stripe</strong>, and{' '}
            <strong className="text-ink">Profitwell</strong>{' '}
            to estimate your payment recovery potential. The 6% failure rate and 70% recoverability figure are based on benchmarks across thousands of SaaS businesses. Results are approximations — your actual numbers may vary.
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-8 mb-8">
          <div className="mb-8">
            <label className="block text-sm font-medium text-ink mb-2">Monthly Recurring Revenue (MRR)</label>
            <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent/30 bg-white max-w-xs">
              <span className="px-4 py-3 text-muted font-medium bg-cream border-r border-border select-none">$</span>
              <input
                type="number"
                min={0}
                value={mrr}
                onChange={(e) => { setMrr(Math.max(0, Number(e.target.value))); trackEvent('calculator_used', { tool: 'recovery' }) }}
                className="flex-1 px-4 py-3 text-ink text-lg font-semibold focus:outline-none bg-white"
                placeholder="20,000"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">Monthly loss</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(monthlyLoss)}</p>
              <p className="text-xs text-red-400 mt-1">~6% of MRR fails</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">Yearly loss</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(yearlyLoss)}</p>
              <p className="text-xs text-red-400 mt-1">if nothing changes</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Recoverable</p>
              <p className="text-3xl font-bold" style={{ color: '#1a7a40' }}>{formatCurrency(recoverable)}</p>
              <p className="text-xs text-green-600 mt-1">per month with smart dunning</p>
            </div>
          </div>

          <div className="bg-cream border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">How this is calculated</h3>
            <div className="space-y-1.5 text-xs text-muted">
              <div className="flex justify-between"><span>Failure rate (industry average)</span><span className="font-medium text-ink">6% of MRR</span></div>
              <div className="flex justify-between"><span>Monthly failed amount</span><span className="font-medium text-ink">{formatCurrency(monthlyLoss)}</span></div>
              <div className="flex justify-between"><span>Recoverability rate (with smart dunning)</span><span className="font-medium text-ink">70%</span></div>
              <div className="flex justify-between border-t border-border pt-1.5 mt-1.5"><span className="font-medium text-ink">Recoverable per month</span><span className="font-bold" style={{ color: '#1a7a40' }}>{formatCurrency(recoverable)}</span></div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-8 space-y-4">
          <h2 className="font-display text-2xl text-ink">Frequently asked questions</h2>
          {[
            { q: 'Why 6%?', a: 'The 4–9% failure rate is an industry-wide benchmark. 6% is the median across SaaS businesses. Your actual rate depends on your customer base, card types, and average age of subscriptions. Newer businesses with newer customers often have lower rates; older businesses with aging card data often have higher rates.' },
            { q: 'Why 70% recoverable?', a: 'Most failed payments fail for temporary reasons — insufficient funds that clear after payday, expired cards that customers have since replaced, temporary bank holds. With smart retry timing and personalised emails, 70% of these failures can be recovered. Stripe\'s built-in dunning recovers 30–40%.' },
            { q: 'Is this the same calculator from the Revorva homepage?', a: 'Yes. This standalone page includes the calculation methodology and FAQs for founders who want to understand the numbers before acting on them.' },
          ].map((faq) => (
            <div key={faq.q} className="bg-white border border-border rounded-xl p-5">
              <p className="font-semibold text-ink mb-2">{faq.q}</p>
              <p className="text-sm text-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-ink rounded-2xl p-8 text-center mb-8">
          <h2 className="font-display text-2xl text-white mb-2">
            Stop losing {formatCurrency(monthlyLoss)} every month
          </h2>
          <p className="text-white/60 text-sm mb-6">14-day free trial. Setup in 2 minutes. No credit card required.</p>
          <Link href="/signup" onClick={() => trackEvent('cta_clicked', { location: 'recovery_calculator' })}>
            <Button variant="accent" size="lg" className="group mx-auto">
              Connect Stripe — Start Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>

        {/* Email capture */}
        <div className="bg-cream border border-border rounded-2xl p-8">
          <h3 className="font-semibold text-ink mb-1">Get the free recovery playbook</h3>
          <p className="text-sm text-muted mb-4">The retry timing, email templates, and framework that turns 70% of failures into recoveries.</p>
          {submitted ? (
            <p className="text-sm" style={{ color: '#1a7a40' }}>Check your inbox — guide is on its way.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white" />
              <button type="submit" className="px-5 py-2.5 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90 transition-colors whitespace-nowrap">Send me the guide</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
