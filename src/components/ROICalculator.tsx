'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Calculator, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const sliderStops = [5, 10, 25, 50, 100, 250, 500]

export function ROICalculator() {
  const [mrrIndex, setMrrIndex] = useState(3) // $50k default
  const [churnRate, setChurnRate] = useState(5)

  const mrr = sliderStops[mrrIndex] * 1000

  const results = useMemo(() => {
    const monthlyChurnRevenue = mrr * (churnRate / 100)
    // ~40-60% of churn is involuntary (failed payments)
    const involuntaryChurn = monthlyChurnRevenue * 0.5
    // Revorva recovers ~40-73% of involuntary churn
    const recoveredMonthly = involuntaryChurn * 0.75
    const recoveredAnnual = recoveredMonthly * 12
    // ROI based on Growth plan ($79/mo)
    const planCost = 79
    const roi = Math.round((recoveredMonthly / planCost) * 100)

    return {
      monthlyChurnRevenue: Math.round(monthlyChurnRevenue),
      involuntaryChurn: Math.round(involuntaryChurn),
      recoveredMonthly: Math.round(recoveredMonthly),
      recoveredAnnual: Math.round(recoveredAnnual),
      roi,
    }
  }, [mrr, churnRate])

  const formatCurrency = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Inputs */}
      <div className="space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-text-primary">
            Monthly Recurring Revenue (MRR)
          </label>
          <div className="relative">
            <input
              type="range"
              min={0}
              max={sliderStops.length - 1}
              step={1}
              value={mrrIndex}
              onChange={(e) => setMrrIndex(Number(e.target.value))}
              className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
            />
            <div className="flex justify-between mt-2">
              {sliderStops.map((s) => (
                <span key={s} className="text-[10px] text-text-secondary">
                  ${s}k
                </span>
              ))}
            </div>
          </div>
          <p className="text-3xl font-extrabold text-text-primary">
            ${mrr.toLocaleString()}<span className="text-lg font-medium text-text-secondary">/mo</span>
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-text-primary">
            Monthly Churn Rate
          </label>
          <input
            type="range"
            min={1}
            max={15}
            step={0.5}
            value={churnRate}
            onChange={(e) => setChurnRate(Number(e.target.value))}
            className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
              [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
          />
          <p className="text-3xl font-extrabold text-text-primary">
            {churnRate}%<span className="text-lg font-medium text-text-secondary"> churn/mo</span>
          </p>
        </div>
      </div>

      {/* Results */}
      <motion.div
        key={`${mrr}-${churnRate}`}
        initial={{ opacity: 0.8, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-5"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary uppercase tracking-wider">
          <Calculator className="w-4 h-4" />
          Your estimated recovery
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-border/50">
            <span className="text-sm text-text-secondary">Monthly churn revenue</span>
            <span className="text-sm font-semibold text-text-primary">{formatCurrency(results.monthlyChurnRevenue)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border/50">
            <span className="text-sm text-text-secondary">Involuntary churn (~50%)</span>
            <span className="text-sm font-semibold text-red-500">{formatCurrency(results.involuntaryChurn)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border/50">
            <span className="text-sm text-text-secondary">Recovered by Revorva (~75%)</span>
            <span className="text-lg font-bold text-success">{formatCurrency(results.recoveredMonthly)}/mo</span>
          </div>
        </div>

        <div className="bg-success/5 border border-success/20 rounded-xl p-5 text-center">
          <p className="text-sm text-text-secondary mb-1">Annual revenue recovered</p>
          <p className="text-4xl font-extrabold text-success">{formatCurrency(results.recoveredAnnual)}</p>
          <p className="text-sm text-success/80 mt-1 font-medium">{results.roi}% ROI on Growth plan</p>
        </div>

        <Link href="/signup" className="block">
          <Button variant="cta" size="lg" className="w-full group">
            Start Recovering Revenue
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
