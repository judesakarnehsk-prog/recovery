'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, X, PartyPopper } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const DISMISSED_KEY = 'setup_checklist_v2_dismissed'

interface ChecklistData {
  stripeConnected: boolean
  brandingCustomized: boolean
  customDomainAdded: boolean
  firstRecoveryCreated: boolean
  firstEmailSent: boolean
  plan: string
  createdAt: string | null
}

interface ChecklistItem {
  key: keyof Omit<ChecklistData, 'plan' | 'createdAt'>
  label: string
  href?: string
  linkText?: string
  growthOnly?: boolean
}

const items: ChecklistItem[] = [
  { key: 'stripeConnected',       label: 'Connect your Stripe account',          href: '/connect',                 linkText: 'Connect →' },
  { key: 'brandingCustomized',    label: 'Customize your email branding',         href: '/settings/email-branding', linkText: 'Customize →' },
  { key: 'customDomainAdded',     label: 'Add a custom sending domain',           href: '/settings',                linkText: 'Add domain →', growthOnly: true },
  { key: 'firstRecoveryCreated',  label: 'First failed payment detected' },
  { key: 'firstEmailSent',        label: 'First recovery email sent' },
]

function isWithin7Days(createdAt: string | null): boolean {
  if (!createdAt) return true
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
}

export function SetupChecklist() {
  const [dismissed, setDismissed] = useState(true)
  const [data, setData] = useState<ChecklistData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isDismissed = localStorage.getItem(DISMISSED_KEY) === 'true'
    if (isDismissed) { setLoading(false); return }
    setDismissed(false)

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }

      const [profileRes, stripeRes, recoveriesRes, emailLogRes] = await Promise.all([
        supabase.from('users').select('plan, created_at, company_name').eq('id', user.id).single(),
        supabase.from('stripe_accounts').select('stripe_account_id, config_json').eq('user_id', user.id).single(),
        supabase.from('recoveries').select('id').eq('user_id', user.id).limit(1),
        supabase.from('email_log').select('id').eq('user_id', user.id).limit(1),
      ])

      const cfg = stripeRes.data?.config_json || {}
      setData({
        stripeConnected: !!stripeRes.data?.stripe_account_id,
        brandingCustomized: !!(profileRes.data?.company_name?.trim() && (cfg.dunningTone || cfg.brandColor)),
        customDomainAdded: !!(cfg.customDomain),
        firstRecoveryCreated: (recoveriesRes.data?.length ?? 0) > 0,
        firstEmailSent: (emailLogRes.data?.length ?? 0) > 0,
        plan: profileRes.data?.plan || 'trial',
        createdAt: profileRes.data?.created_at ?? null,
      })
      setLoading(false)
    })
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setDismissed(true)
  }

  if (loading || dismissed || !data) return null

  const isGrowthPlus = data.plan === 'growth' || data.plan === 'scale'
  const accountExpired = !isWithin7Days(data.createdAt)
  const relevantItems = items.filter((item) => !item.growthOnly || isGrowthPlus)
  const completedCount = relevantItems.filter((item) => data[item.key]).length
  const allComplete = completedCount === relevantItems.length
  if (accountExpired && allComplete) return null

  return (
    <div style={{
      background: '#111', border: '1px solid #1F1F1F', borderRadius: 12,
      margin: '0 32px 24px', overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '14px 20px', borderBottom: '1px solid #1A1A1A' }}
      >
        <div className="flex items-center gap-3">
          {allComplete ? (
            <PartyPopper style={{ width: 15, height: 15, color: '#F5780A', flexShrink: 0 }} />
          ) : (
            <div className="flex items-center gap-1">
              {relevantItems.map((item, i) => (
                <div key={i} style={{
                  height: 4, width: 20, borderRadius: 2,
                  background: data[item.key] ? '#F5780A' : '#1F1F1F',
                }} />
              ))}
            </div>
          )}
          <span style={{ fontSize: 13, fontWeight: 500, color: '#F2F2F2' }}>
            {allComplete
              ? 'Setup complete! Revorva is recovering revenue for you.'
              : `Get set up — ${completedCount}/${relevantItems.length} complete`}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#444' }}
          aria-label="Dismiss checklist"
        >
          <X style={{ width: 15, height: 15 }} />
        </button>
      </div>

      {/* Items */}
      {!allComplete && (
        <div>
          {relevantItems.map((item, idx) => {
            const done = data[item.key]
            return (
              <div
                key={item.key}
                className="flex items-center gap-3.5"
                style={{
                  padding: '11px 20px',
                  borderBottom: idx < relevantItems.length - 1 ? '1px solid #141414' : 'none',
                  opacity: done ? 0.4 : 1,
                }}
              >
                {done
                  ? <CheckCircle2 style={{ width: 15, height: 15, color: '#22C55E', flexShrink: 0 }} />
                  : <Circle style={{ width: 15, height: 15, color: '#333', flexShrink: 0 }} />
                }
                <span style={{
                  fontSize: 13, flex: 1,
                  color: done ? '#555' : '#F2F2F2',
                  textDecoration: done ? 'line-through' : 'none',
                }}>
                  {item.label}
                  {item.growthOnly && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: '#F5780A', fontWeight: 500 }}>Growth+</span>
                  )}
                </span>
                {!done && item.href && (
                  <Link href={item.href} style={{ fontSize: 12, color: '#F5780A', fontWeight: 500, textDecoration: 'none', flexShrink: 0 }}>
                    {item.linkText ?? 'Set up →'}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}

      {allComplete && (
        <div style={{ padding: '12px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#444', margin: 0 }}>
            All steps complete.{' '}
            <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}>
              Dismiss this checklist
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
