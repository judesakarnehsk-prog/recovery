'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

const REVORVA_COST = 79 // Growth plan monthly cost

export default function MrrImpactCalculatorPage() {
  const [mrr, setMrr] = useState(20000)
  const [failureRate, setFailureRate] = useState(6)
  const [currentRecovery, setCurrentRecovery] = useState(30)
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')

  const monthlyFailed = mrr * (failureRate / 100)
  const currentMonthlyLoss = monthlyFailed * (1 - currentRecovery / 100)
  const withRevorvaLoss = monthlyFailed * (1 - 0.7)
  const monthlyUpside = currentMonthlyLoss - withRevorvaLoss
  const annualUpside = monthlyUpside * 12
  const roiMultiple = Math.max(0, monthlyUpside / REVORVA_COST)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    trackEvent('lead_captured', { source: 'mrr_impact_calculator' })
    await fetch('/api/lead-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'mrr_impact_calculator' }),
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
            Revorva ROI Calculator
          </h1>
          <p className="text-lg text-muted">
            How much would Revorva recover for your business specifically?
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-8 mb-8">
          {/* Inputs */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Current MRR</label>
              <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent/30 bg-white">
                <span className="px-3 py-2.5 text-muted font-medium bg-cream border-r border-border select-none">$</span>
                <input
                  type="number"
                  min={0}
                  value={mrr}
                  onChange={(e) => { setMrr(Math.max(0, Number(e.target.value))); trackEvent('calculator_used', { tool: 'roi' }) }}
                  className="flex-1 px-3 py-2.5 text-ink font-semibold focus:outline-none bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Failed payment rate (%)</label>
              <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent/30 bg-white">
                <input
                  type="number"
                  min={1}
                  max={30}
                  step={0.5}
                  value={failureRate}
                  onChange={(e) => setFailureRate(Number(e.target.value))}
                  className="flex-1 px-3 py-2.5 text-ink font-semibold focus:outline-none bg-white"
                />
                <span className="px-3 py-2.5 text-muted font-medium bg-cream border-l border-border select-none">%</span>
              </div>
              <p className="text-xs text-muted mt-1">Industry avg: 6%</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Current recovery rate (%)</label>
              <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent/30 bg-white">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={currentRecovery}
                  onChange={(e) => setCurrentRecovery(Number(e.target.value))}
                  className="flex-1 px-3 py-2.5 text-ink font-semibold focus:outline-none bg-white"
                />
                <span className="px-3 py-2.5 text-muted font-medium bg-cream border-l border-border select-none">%</span>
              </div>
              <p className="text-xs text-muted mt-1">Stripe default: ~30%</p>
            </div>
          </div>

          {/* Results */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">Current monthly loss</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(currentMonthlyLoss)}</p>
              <p className="text-xs text-red-400 mt-1">with {currentRecovery}% recovery rate</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Loss with Revorva (70% recovery)</p>
              <p className="text-3xl font-bold text-amber-700">{formatCurrency(withRevorvaLoss)}</p>
              <p className="text-xs text-amber-600 mt-1">unrecoverable remainder</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Monthly upside</p>
              <p className="text-3xl font-bold" style={{ color: '#1a7a40' }}>{formatCurrency(monthlyUpside)}</p>
              <p className="text-xs text-green-600 mt-1">additional recovery per month</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Annual upside</p>
              <p className="text-3xl font-bold" style={{ color: '#1a7a40' }}>{formatCurrency(annualUpside)}</p>
              <p className="text-xs text-green-600 mt-1">over 12 months</p>
            </div>
          </div>

          {/* ROI callout */}
          <div className="bg-ink rounded-xl p-6 text-center">
            <p className="text-white/60 text-sm mb-1">Revorva Growth plan costs $79/month. At your MRR, you&apos;d recover</p>
            <p className="font-display text-4xl text-white mb-1">{formatCurrency(monthlyUpside)}</p>
            <p className="text-white/60 text-sm">
              {roiMultiple >= 1
                ? `— making Revorva pay for itself ${roiMultiple.toFixed(1)}× over`
                : '— Revorva pays for itself as your MRR grows'}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-8">
          <Link href="/signup" onClick={() => trackEvent('cta_clicked', { location: 'mrr_impact_calculator' })}>
            <Button variant="accent" size="lg" className="group mx-auto">
              Start recovering {formatCurrency(monthlyUpside)} per month
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <p className="text-xs text-muted mt-3">14-day free trial · No credit card · Cancel anytime</p>
        </div>

        {/* Email capture */}
        <div className="bg-cream border border-border rounded-2xl p-8">
          <h3 className="font-semibold text-ink mb-1">Get the free recovery playbook</h3>
          <p className="text-sm text-muted mb-4">The retry timing, email templates, and measurement framework that recovers 70% of failed payments.</p>
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
