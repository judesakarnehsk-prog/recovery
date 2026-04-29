'use client'

import Link from 'next/link'
import { Clock, AlertTriangle, AlertOctagon } from 'lucide-react'

interface TrialBannerProps {
  trialEndsAt: string | null
}

export function TrialBanner({ trialEndsAt }: TrialBannerProps) {
  if (!trialEndsAt) return null

  const daysRemaining = Math.ceil(
    (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  // Middleware handles redirect at 0 or below — nothing to show here
  if (daysRemaining <= 0) return null

  if (daysRemaining > 3) {
    // Subtle informational banner
    return (
      <div className="flex items-center justify-between gap-4 px-5 py-3 bg-cream border border-border rounded-2xl">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-muted flex-shrink-0" />
          <p className="text-sm text-muted">
            Trial: <span className="font-medium text-ink">{daysRemaining} days remaining</span>
          </p>
        </div>
        <Link
          href="/billing"
          className="text-xs font-medium text-accent hover:underline flex-shrink-0"
        >
          Upgrade now →
        </Link>
      </div>
    )
  }

  if (daysRemaining <= 1) {
    // Critical — 1 day left
    return (
      <div className="flex items-center justify-between gap-4 px-5 py-4 bg-red-50 border border-red-300 rounded-2xl">
        <div className="flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-900">Your trial ends tomorrow</p>
            <p className="text-xs text-red-700 mt-0.5">Add a payment method now to avoid losing access.</p>
          </div>
        </div>
        <Link
          href="/billing"
          className="flex-shrink-0 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-3.5 py-1.5 rounded-lg transition-colors"
        >
          Add payment method →
        </Link>
      </div>
    )
  }

  // Urgent — 2–3 days left
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 bg-amber-50 border border-amber-300 rounded-2xl">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-900">
            Your trial ends in {daysRemaining} days
          </p>
          <p className="text-xs text-amber-700 mt-0.5">Keep recovering revenue — upgrade before it expires.</p>
        </div>
      </div>
      <Link
        href="/billing"
        className="flex-shrink-0 text-sm font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3.5 py-1.5 rounded-lg transition-colors"
      >
        Choose a plan →
      </Link>
    </div>
  )
}
