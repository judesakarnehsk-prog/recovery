'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, X, PartyPopper } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

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
  {
    key: 'stripeConnected',
    label: 'Connect your Stripe account',
    href: '/connect',
    linkText: 'Connect →',
  },
  {
    key: 'brandingCustomized',
    label: 'Customize your email branding',
    href: '/settings/email-branding',
    linkText: 'Customize →',
  },
  {
    key: 'customDomainAdded',
    label: 'Add a custom sending domain',
    href: '/settings',
    linkText: 'Add domain →',
    growthOnly: true,
  },
  {
    key: 'firstRecoveryCreated',
    label: 'First failed payment detected',
  },
  {
    key: 'firstEmailSent',
    label: 'First recovery email sent',
  },
]

function isWithin7Days(createdAt: string | null): boolean {
  if (!createdAt) return true
  const created = new Date(createdAt).getTime()
  const now = Date.now()
  return now - created < 7 * 24 * 60 * 60 * 1000
}

export function SetupChecklist() {
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash
  const [data, setData] = useState<ChecklistData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isDismissed = localStorage.getItem(DISMISSED_KEY) === 'true'
    if (isDismissed) {
      setLoading(false)
      return
    }
    setDismissed(false)

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }

      const [profileRes, stripeRes, recoveriesRes, emailLogRes] = await Promise.all([
        supabase
          .from('users')
          .select('plan, created_at, company_name')
          .eq('id', user.id)
          .single(),
        supabase
          .from('stripe_accounts')
          .select('stripe_account_id, config_json')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('recoveries')
          .select('id')
          .eq('user_id', user.id)
          .limit(1),
        supabase
          .from('email_log')
          .select('id')
          .eq('user_id', user.id)
          .limit(1),
      ])

      const cfg = stripeRes.data?.config_json || {}
      const plan = profileRes.data?.plan || 'trial'

      setData({
        stripeConnected: !!stripeRes.data?.stripe_account_id,
        brandingCustomized: !!(profileRes.data?.company_name?.trim() && (cfg.dunningTone || cfg.brandColor)),
        customDomainAdded: !!(cfg.customDomain),
        firstRecoveryCreated: (recoveriesRes.data?.length ?? 0) > 0,
        firstEmailSent: (emailLogRes.data?.length ?? 0) > 0,
        plan,
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

  // Determine relevant items (exclude growth-only for non-growth users)
  const relevantItems = items.filter((item) => !item.growthOnly || isGrowthPlus)

  const completedCount = relevantItems.filter((item) => data[item.key]).length
  const allComplete = completedCount === relevantItems.length

  // Hide after 7 days if all complete, or just after 7 days regardless
  if (accountExpired && allComplete) return null

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          {allComplete ? (
            <PartyPopper className="w-4 h-4 text-accent flex-shrink-0" />
          ) : (
            <div className="flex items-center gap-1">
              {relevantItems.map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 w-5 rounded-full transition-colors',
                    data[item.key] ? 'bg-accent' : 'bg-border'
                  )}
                />
              ))}
            </div>
          )}
          <span className="text-sm font-medium text-ink">
            {allComplete
              ? 'Setup complete! Revorva is recovering revenue for you.'
              : `Get set up — ${completedCount}/${relevantItems.length} complete`}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted hover:text-ink transition-colors p-1 -mr-1 rounded"
          aria-label="Dismiss checklist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Items */}
      {!allComplete && (
        <div className="divide-y divide-border">
          {relevantItems.map((item) => {
            const done = data[item.key]
            return (
              <div
                key={item.key}
                className={cn(
                  'flex items-center gap-3.5 px-5 py-3',
                  done && 'opacity-50'
                )}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-border flex-shrink-0" />
                )}
                <span className={cn('text-sm flex-1', done ? 'line-through text-muted' : 'text-ink')}>
                  {item.label}
                  {item.growthOnly && (
                    <span className="ml-1.5 text-xs text-accent/70 font-medium">Growth+</span>
                  )}
                </span>
                {!done && item.href && (
                  <Link
                    href={item.href}
                    className="text-xs text-accent font-medium hover:underline flex-shrink-0"
                  >
                    {item.linkText ?? 'Set up →'}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* All-complete banner */}
      {allComplete && (
        <div className="px-5 py-3 bg-green-50/60 text-center">
          <p className="text-xs text-green-700">
            All steps complete.{' '}
            <button onClick={handleDismiss} className="underline hover:no-underline">
              Dismiss this checklist
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
