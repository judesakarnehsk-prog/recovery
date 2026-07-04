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

  if (daysRemaining <= 0) return null

  if (daysRemaining > 3) {
    return (
      <div
        className="flex items-center justify-between gap-4"
        style={{
          padding: '12px 18px',
          background: '#111',
          border: '1px solid #1F1F1F',
          borderRadius: 10,
        }}
      >
        <div className="flex items-center gap-2.5">
          <Clock style={{ width: 15, height: 15, color: '#555', flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: '#555', margin: 0 }}>
            Trial: <span style={{ fontWeight: 500, color: '#F2F2F2' }}>{daysRemaining} days remaining</span>
          </p>
        </div>
        <Link
          href="/billing"
          style={{ fontSize: 12, fontWeight: 500, color: '#F5780A', textDecoration: 'none', flexShrink: 0 }}
        >
          Upgrade now →
        </Link>
      </div>
    )
  }

  if (daysRemaining <= 1) {
    return (
      <div
        className="flex items-center justify-between gap-4"
        style={{
          padding: '14px 18px',
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.20)',
          borderRadius: 10,
        }}
      >
        <div className="flex items-center gap-3">
          <AlertOctagon style={{ width: 16, height: 16, color: '#EF4444', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#F2F2F2', margin: '0 0 2px' }}>Your trial ends tomorrow</p>
            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Add a payment method now to avoid losing access.</p>
          </div>
        </div>
        <Link
          href="/billing"
          style={{
            flexShrink: 0, fontSize: 13, fontWeight: 600, color: '#fff',
            background: '#EF4444', borderRadius: 8, padding: '7px 14px', textDecoration: 'none',
          }}
        >
          Add payment method →
        </Link>
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-between gap-4"
      style={{
        padding: '14px 18px',
        background: 'rgba(245,120,10,0.06)',
        border: '1px solid rgba(245,120,10,0.20)',
        borderRadius: 10,
      }}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle style={{ width: 16, height: 16, color: '#F5780A', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#F2F2F2', margin: '0 0 2px' }}>
            Your trial ends in {daysRemaining} days
          </p>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Keep recovering revenue — upgrade before it expires.</p>
        </div>
      </div>
      <Link
        href="/billing"
        style={{
          flexShrink: 0, fontSize: 13, fontWeight: 500, color: '#F5780A',
          background: 'rgba(245,120,10,0.10)', border: '1px solid rgba(245,120,10,0.20)',
          borderRadius: 8, padding: '7px 14px', textDecoration: 'none',
        }}
      >
        Choose a plan →
      </Link>
    </div>
  )
}
