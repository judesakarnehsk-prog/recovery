'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function MrrCalculator() {
  const [mrr, setMrr] = useState(20000)

  const monthlyLoss = mrr * 0.06
  const yearlyLoss = mrr * 0.06 * 12
  const recoverable = mrr * 0.06 * 0.7

  return (
    <section className="py-24 lg:py-32 bg-paper">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink mb-3">
            How much are you losing right now?
          </h2>
          <p className="text-muted">Enter your MRR and see the impact of failed payments in real time.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white border border-border rounded-2xl p-8"
        >
          {/* MRR input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-ink mb-2">
              Monthly Recurring Revenue (MRR)
            </label>
            <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent/30 bg-white max-w-xs">
              <span className="px-4 py-3 text-muted font-medium bg-cream border-r border-border select-none">$</span>
              <input
                type="number"
                min={0}
                value={mrr}
                onChange={(e) => setMrr(Math.max(0, Number(e.target.value)))}
                className="flex-1 px-4 py-3 text-ink text-lg font-semibold focus:outline-none bg-white"
                placeholder="20,000"
              />
            </div>
          </div>

          {/* Result cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <motion.div
              key={`monthly-${monthlyLoss}`}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-100 rounded-xl p-5"
            >
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">Monthly loss</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(monthlyLoss)}</p>
              <p className="text-xs text-red-400 mt-1">~6% of MRR</p>
            </motion.div>

            <motion.div
              key={`yearly-${yearlyLoss}`}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-100 rounded-xl p-5"
            >
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">Yearly loss</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(yearlyLoss)}</p>
              <p className="text-xs text-red-400 mt-1">if nothing changes</p>
            </motion.div>

            <motion.div
              key={`recoverable-${recoverable}`}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              className="bg-green-50 border border-green-100 rounded-xl p-5"
            >
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Recoverable with Revorva</p>
              <p className="text-3xl font-bold" style={{ color: '#1a7a40' }}>{formatCurrency(recoverable)}</p>
              <p className="text-xs text-green-600 mt-1">per month, automatically</p>
            </motion.div>
          </div>

          <div className="text-center">
            <Link href="/signup">
              <Button variant="accent" size="lg" className="group">
                Start recovering this revenue
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <p className="text-xs text-muted mt-3">14-day free trial · No credit card required</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
