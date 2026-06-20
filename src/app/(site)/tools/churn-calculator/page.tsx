'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'

function formatCurrency(val: number) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

export default function ChurnCalculatorPage() {
  const [price, setPrice] = useState(49)
  const [lifespan, setLifespan] = useState(18)
  const [cac, setCac] = useState(200)
  const [churnRate, setChurnRate] = useState(5)
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')

  const ltv = price * lifespan
  const profit = ltv - cac
  const customersLostPerMonth = 100 * (churnRate / 100)
  const annualRevenueLost = customersLostPerMonth * 12 * price
  const customersNeededToReplace = Math.ceil(customersLostPerMonth)
  const onePercentSaving = 100 * 0.01 * 12 * price

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    trackEvent('lead_captured', { source: 'churn_calculator' })
    await fetch('/api/lead-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'churn_calculator' }),
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
            Churn Cost Calculator
          </h1>
          <p className="text-lg text-muted">
            Most founders underestimate churn cost. Let&apos;s calculate yours.
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-8 mb-8">
          {/* Inputs */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {[
              { label: 'Monthly subscription price', value: price, setter: setPrice, prefix: '$', min: 1 },
              { label: 'Avg customer lifespan (months)', value: lifespan, setter: setLifespan, prefix: '', min: 1 },
              { label: 'Customer acquisition cost (CAC)', value: cac, setter: setCac, prefix: '$', min: 0 },
              { label: 'Current monthly churn rate (%)', value: churnRate, setter: setChurnRate, prefix: '', min: 0.1, step: 0.1 },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-sm font-medium text-ink mb-1.5">{field.label}</label>
                <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent/30 bg-white">
                  {field.prefix && (
                    <span className="px-3 py-2.5 text-muted font-medium bg-cream border-r border-border select-none">{field.prefix}</span>
                  )}
                  <input
                    type="number"
                    min={field.min}
                    step={field.step ?? 1}
                    value={field.value}
                    onChange={(e) => field.setter(Number(e.target.value))}
                    className="flex-1 px-3 py-2.5 text-ink font-semibold focus:outline-none bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Results */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-cream border border-border rounded-xl p-5">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Lifetime value per customer</p>
              <p className="text-3xl font-bold text-ink">{formatCurrency(ltv)}</p>
            </div>
            <div className={`border rounded-xl p-5 ${profit >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: profit >= 0 ? '#1a7a40' : '#DC2626' }}>
                Profit per customer (LTV − CAC)
              </p>
              <p className="text-3xl font-bold" style={{ color: profit >= 0 ? '#1a7a40' : '#DC2626' }}>
                {formatCurrency(profit)}
              </p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">Annual revenue lost to churn</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(annualRevenueLost)}</p>
              <p className="text-xs text-red-400 mt-1">per 100 active customers</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">New customers needed monthly</p>
              <p className="text-3xl font-bold text-amber-700">{customersNeededToReplace}</p>
              <p className="text-xs text-amber-600 mt-1">just to replace churned customers</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl">
            <p className="text-sm text-ink font-medium">
              Reducing churn by just 1% could save your business{' '}
              <span style={{ color: '#1a7a40' }} className="font-bold">{formatCurrency(onePercentSaving)}</span>{' '}
              per year (per 100 customers).
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-ink rounded-2xl p-8 text-center mb-8">
          <h2 className="font-display text-2xl text-white mb-2">
            A big chunk of your churn is involuntary
          </h2>
          <p className="text-white/60 text-sm mb-6 max-w-sm mx-auto">
            Failed payments cause 20–40% of all subscription churn. Revorva recovers them automatically.
          </p>
          <Link href="/signup" onClick={() => trackEvent('cta_clicked', { location: 'churn_calculator' })}>
            <Button variant="accent" size="lg" className="group mx-auto">
              Try Revorva free for 14 days
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>

        {/* Email capture */}
        <div className="bg-cream border border-border rounded-2xl p-8">
          <h3 className="font-semibold text-ink mb-1">Get the free recovery playbook</h3>
          <p className="text-sm text-muted mb-4">
            7 pages covering the retry timing, email templates, and measurement framework that recovers 70% of failed payments.
          </p>
          {submitted ? (
            <p className="text-sm" style={{ color: '#1a7a40' }}>Check your inbox — guide is on its way.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
              />
              <button type="submit" className="px-5 py-2.5 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90 transition-colors whitespace-nowrap">
                Send me the guide
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
