'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, PauseCircle, PlayCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import { useSetupStatus } from '@/lib/useSetupStatus'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecoveryTable } from '@/components/dashboard/RecoveryTable'
import { SetupChecklist } from '@/components/dashboard/SetupChecklist'
import { TrialBanner } from '@/components/dashboard/TrialBanner'

const setupSteps = [
  {
    key: 'stripeConnected' as const,
    label: 'Connect your Stripe account',
    desc: 'Required to start recovering failed payments.',
    href: '/connect',
  },
  {
    key: 'businessNameSet' as const,
    label: 'Add your business name',
    desc: 'Shown in the email sender name.',
    href: '/settings',
  },
  {
    key: 'businessTypeSet' as const,
    label: 'Set your business type',
    desc: 'Helps tailor recovery emails to your industry.',
    href: '/settings',
  },
  {
    key: 'replyToSet' as const,
    label: 'Set a reply-to email',
    desc: 'So customers can reach you directly.',
    href: '/settings',
  },
  {
    key: 'brandingConfigured' as const,
    label: 'Customize email branding',
    desc: 'Set your tone, colors, and logo.',
    href: '/settings/email-branding',
  },
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [recoveries, setRecoveries] = useState<any[]>([])
  const [stripeConnected, setStripeConnected] = useState(false)
  const [hasStripeRow, setHasStripeRow] = useState(false)
  const [checklistOpen, setChecklistOpen] = useState(true)
  const [checklistDismissed, setChecklistDismissed] = useState(false)
  const [recoveryPaused, setRecoveryPaused] = useState(false)
  const [pausedBy, setPausedBy] = useState<string | null>(null)
  const [togglingPause, setTogglingPause] = useState(false)
  const [userPlan, setUserPlan] = useState<string>('')
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)

  const setupStatus = useSetupStatus()

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, statsRes, recoveriesRes, stripeRes] = await Promise.all([
      supabase.from('users').select('full_name, company_name, onboarding_step, created_at, plan, trial_ends_at').eq('id', user.id).single(),
      supabase.from('user_recovery_stats').select('*').eq('user_id', user.id).single(),
      supabase
        .from('recoveries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase.from('stripe_accounts').select('id, stripe_account_id, config_json').eq('user_id', user.id).single(),
    ])

    const profile = profileRes.data
    setUserName(profile?.company_name || profile?.full_name || user.email?.split('@')[0] || 'there')
    setUserPlan(profile?.plan ?? 'trial')
    setTrialEndsAt(profile?.trial_ends_at ?? null)
    setStats(statsRes.data)
    setRecoveries(recoveriesRes.data ?? [])
    // stripeConnected = Stripe OAuth tokens are present (stripe_account_id is non-null)
    // hasStripeRow = row exists (needed to show the pause banner even after disconnect)
    const rowExists = !!stripeRes.data?.id
    const stripeAccountIdPresent = !!stripeRes.data?.stripe_account_id
    setHasStripeRow(rowExists)
    setStripeConnected(rowExists && stripeAccountIdPresent)
    setRecoveryPaused(stripeRes.data?.config_json?.recoveryPaused === true)
    setPausedBy(stripeRes.data?.config_json?.pausedBy ?? null)

    const dismissed = typeof window !== 'undefined'
      ? localStorage.getItem('setup_checklist_dismissed') === 'true'
      : false
    setChecklistDismissed(dismissed)

    // Redirect to checkout if a plan was selected before signup
    const pendingPlan = typeof window !== 'undefined' ? localStorage.getItem('pending_plan') : null
    if (pendingPlan && ['starter', 'growth', 'scale'].includes(pendingPlan)) {
      localStorage.removeItem('pending_plan')
      const priceEnvMap: Record<string, string | undefined> = {
        starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
        growth: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID,
        scale: process.env.NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID,
      }
      const priceId = priceEnvMap[pendingPlan]
      if (priceId) {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId }),
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
          return
        }
      }
    }

    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const dismissChecklist = () => {
    localStorage.setItem('setup_checklist_dismissed', 'true')
    setChecklistDismissed(true)
  }

  const handleResume = async () => {
    setTogglingPause(true)
    const res = await fetch('/api/recovery/resume', { method: 'POST' })
    if (res.ok) {
      setRecoveryPaused(false)
      setPausedBy(null)
      trackEvent('recovery_resumed')
    }
    setTogglingPause(false)
  }

  const handlePause = async () => {
    setTogglingPause(true)
    const res = await fetch('/api/recovery/pause', { method: 'POST' })
    if (res.ok) {
      setRecoveryPaused(true)
      trackEvent('recovery_paused')
    }
    setTogglingPause(false)
  }

  const completedCount = setupSteps.filter(s => setupStatus[s.key]).length
  const allComplete = completedCount === setupSteps.length
  const showChecklist = !checklistDismissed && !setupStatus.loading && !allComplete

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-64 bg-cream rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-cream rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-cream rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      {/* Recovery pause/active banner — shown whenever a stripe_accounts row exists */}
      {hasStripeRow && (
        recoveryPaused ? (
          pausedBy === 'stripe_disconnect' ? (
            // Stripe disconnected — show Reconnect button
            <div className="flex items-center justify-between gap-4 px-5 py-4 bg-amber-50 border border-amber-300 rounded-2xl">
              <div className="flex items-center gap-3">
                <PauseCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Recovery paused — Stripe is disconnected</p>
                  <p className="text-xs text-amber-700 mt-0.5">Reconnect your Stripe account, then click Resume to restart recovery.</p>
                </div>
              </div>
              <a
                href="/api/stripe/connect/start"
                className="flex items-center gap-1.5 text-sm font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
              >
                <PlayCircle className="w-4 h-4" />
                Reconnect Stripe
              </a>
            </div>
          ) : (
            // Manually paused — show Resume button
            <div className="flex items-center justify-between gap-4 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <PauseCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Recovery Paused</p>
                  <p className="text-xs text-amber-700 mt-0.5">New failures won&apos;t trigger recovery. Existing jobs are on hold.</p>
                </div>
              </div>
              <button
                onClick={handleResume}
                disabled={togglingPause}
                className="flex items-center gap-1.5 text-sm font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <PlayCircle className="w-4 h-4" />
                {togglingPause ? 'Resuming…' : 'Resume'}
              </button>
            </div>
          )
        ) : (
          // Active — show Pause button
          <div className="flex items-center justify-between gap-4 px-5 py-4 bg-green-50 border border-green-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-900">Recovery Active</p>
                <p className="text-xs text-green-700 mt-0.5">Watching for failed payments.</p>
              </div>
            </div>
            <button
              onClick={handlePause}
              disabled={togglingPause}
              className="flex items-center gap-1.5 text-sm font-medium text-green-900 hover:bg-green-100 border border-green-200 px-3.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <PauseCircle className="w-4 h-4" />
              {togglingPause ? 'Pausing…' : 'Pause'}
            </button>
          </div>
        )
      )}

      {/* Trial countdown */}
      {userPlan === 'trial' && <TrialBanner trialEndsAt={trialEndsAt} />}

      {/* Post-onboarding checklist */}
      <SetupChecklist />

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-ink">
          {getGreeting()}, {userName}.
        </h1>
        <p className="text-sm text-muted mt-0.5">Here&apos;s your recovery overview.</p>
      </div>

      {/* Setup checklist */}
      {showChecklist && (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <button
            onClick={() => setChecklistOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-cream/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {setupSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-5 rounded-full transition-colors ${
                      i < completedCount ? 'bg-accent' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-ink">
                Get set up — {completedCount}/{setupSteps.length} complete
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); dismissChecklist() }}
                className="text-xs text-muted hover:text-ink transition-colors"
              >
                Dismiss
              </button>
              {checklistOpen
                ? <ChevronUp className="w-4 h-4 text-muted" />
                : <ChevronDown className="w-4 h-4 text-muted" />
              }
            </div>
          </button>

          {checklistOpen && (
            <div className="border-t border-border divide-y divide-border">
              {setupSteps.map((step) => {
                const done = setupStatus[step.key]
                return (
                  <Link
                    key={step.key}
                    href={done ? '#' : step.href}
                    onClick={done ? (e) => e.preventDefault() : undefined}
                    className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                      done ? 'opacity-50 cursor-default' : 'hover:bg-cream/40'
                    }`}
                  >
                    {done
                      ? <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      : <Circle className="w-4 h-4 text-accent flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${done ? 'line-through text-muted' : 'text-ink'}`}>
                        {step.label}
                      </p>
                      {!done && (
                        <p className="text-xs text-muted mt-0.5">{step.desc}</p>
                      )}
                    </div>
                    {!done && (
                      <span className="text-xs text-accent font-medium flex-shrink-0">Set up →</span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Recovery table or empty state */}
      <div>
        <h2 className="text-base font-semibold text-ink mb-3">Recovery Jobs</h2>
        {recoveries.length === 0 && !stripeConnected ? (
          <div className="bg-white border border-border rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-ink mb-2">Revorva is watching</h3>
            <p className="text-sm text-muted max-w-sm mx-auto mb-5">
              When a payment fails on your Stripe account, recovery starts automatically here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/connect"
                className="text-sm font-medium text-white bg-accent hover:bg-accent/90 px-4 py-2 rounded-lg transition-colors"
              >
                Connect Stripe →
              </Link>
              <Link
                href="/features"
                className="text-sm text-muted hover:text-ink transition-colors"
              >
                Learn how it works →
              </Link>
            </div>
          </div>
        ) : (
          <RecoveryTable recoveries={recoveries} />
        )}
      </div>
    </div>
  )
}
