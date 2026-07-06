'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, PauseCircle, PlayCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import { useSetupStatus } from '@/lib/useSetupStatus'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecoveryTable } from '@/components/dashboard/RecoveryTable'
import { SetupChecklist } from '@/components/dashboard/SetupChecklist'
import { TrialBanner } from '@/components/dashboard/TrialBanner'
import { RecoveryChart, type ChartEntry } from '@/components/dashboard/RecoveryChart'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { BusinessAnalysis } from './_components/BusinessAnalysis'

type Period = '7d' | '30d' | 'all'

const setupSteps = [
  { key: 'stripeConnected' as const,    label: 'Connect your Stripe account',  desc: 'Required to start recovering failed payments.',  href: '/connect' },
  { key: 'businessNameSet' as const,    label: 'Add your business name',        desc: 'Shown in the email sender name.',                href: '/settings' },
  { key: 'businessTypeSet' as const,    label: 'Set your business type',        desc: 'Helps tailor recovery emails to your industry.', href: '/settings' },
  { key: 'replyToSet' as const,         label: 'Set a reply-to email',          desc: 'So customers can reach you directly.',           href: '/settings' },
  { key: 'brandingConfigured' as const, label: 'Customize email branding',      desc: 'Set your tone, colors, and logo.',               href: '/settings/email-branding' },
]

function toLabel(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function generateChartData(from: Date, to: Date, recoveries: any[]): ChartEntry[] {
  // Build a lookup of real data by date label
  const realMap: Record<string, ChartEntry> = {}
  for (const r of recoveries) {
    const dateStr = r.created_at?.slice(0, 10)
    if (!dateStr) continue
    const label = toLabel(new Date(dateStr))
    if (!realMap[label]) realMap[label] = { date: label, recovered: 0, emails: 0 }
    if (r.status === 'recovered') realMap[label].recovered += (r.amount || 0) / 100
    if (r.status === 'email_sent' || r.email_step > 0) realMap[label].emails += 1
  }

  // Walk day by day from → to
  const result: ChartEntry[] = []
  const cur = new Date(from)
  cur.setHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setHours(0, 0, 0, 0)
  while (cur <= end) {
    const label = toLabel(cur)
    result.push(realMap[label] ?? { date: label, recovered: 0, emails: 0 })
    cur.setDate(cur.getDate() + 1)
  }
  return result
}

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
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('30d')
  const [missingBusinessName, setMissingBusinessName] = useState(false)
  const [businessNameInput, setBusinessNameInput] = useState('')
  const [savingBusinessName, setSavingBusinessName] = useState(false)
  const [analyzerTrigger, setAnalyzerTrigger] = useState(0)
  const [hasCompanyUrl, setHasCompanyUrl] = useState(false)

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
      supabase.from('users').select('full_name, company_name, company_url, onboarding_step, created_at, plan, trial_ends_at').eq('id', user.id).single(),
      supabase.from('user_recovery_stats').select('*').eq('user_id', user.id).single(),
      supabase.from('recoveries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
      supabase.from('stripe_accounts').select('id, stripe_account_id, config_json').eq('user_id', user.id).single(),
    ])

    const profile = profileRes.data
    const emailFallback = user.email?.split('@')[0] || 'there'
    setUserName(profile?.company_name || profile?.full_name || emailFallback)
    // Google OAuth users won't have a business name — prompt them to add one
    if (!profile?.company_name && !profile?.full_name) {
      setMissingBusinessName(true)
    }
    setUserPlan(profile?.plan ?? 'trial')
    setTrialEndsAt(profile?.trial_ends_at ?? null)
    setUserCreatedAt(profile?.created_at ?? user.created_at ?? null)
    setStats(statsRes.data)
    setRecoveries(recoveriesRes.data ?? [])
    const rowExists = !!stripeRes.data?.id
    const stripeAccountIdPresent = !!stripeRes.data?.stripe_account_id
    setHasStripeRow(rowExists)
    setStripeConnected(rowExists && stripeAccountIdPresent)
    setHasCompanyUrl(!!(profile as any)?.company_url)
    setRecoveryPaused(stripeRes.data?.config_json?.recoveryPaused === true)
    setPausedBy(stripeRes.data?.config_json?.pausedBy ?? null)
    const dismissed = typeof window !== 'undefined' ? localStorage.getItem('setup_checklist_dismissed') === 'true' : false
    setChecklistDismissed(dismissed)

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
        const res = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ priceId }) })
        const data = await res.json()
        if (data.url) { window.location.href = data.url; return }
      }
    }

    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const dismissChecklist = () => {
    localStorage.setItem('setup_checklist_dismissed', 'true')
    setChecklistDismissed(true)
  }

  const saveBusinessName = async () => {
    if (!businessNameInput.trim()) return
    setSavingBusinessName(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users').update({ company_name: businessNameInput.trim() }).eq('id', user.id)
      setUserName(businessNameInput.trim())
      setMissingBusinessName(false)
    }
    setSavingBusinessName(false)
  }

  const handleResume = async () => {
    setTogglingPause(true)
    const res = await fetch('/api/recovery/resume', { method: 'POST' })
    if (res.ok) { setRecoveryPaused(false); setPausedBy(null); trackEvent('recovery_resumed') }
    setTogglingPause(false)
  }

  const handlePause = async () => {
    setTogglingPause(true)
    const res = await fetch('/api/recovery/pause', { method: 'POST' })
    if (res.ok) { setRecoveryPaused(true); trackEvent('recovery_paused') }
    setTogglingPause(false)
  }

  const completedCount = setupSteps.filter(s => setupStatus[s.key]).length
  const allComplete = completedCount === setupSteps.length
  const showChecklist = !checklistDismissed && !setupStatus.loading && !allComplete

  const emailsSent = stats?.total_recoveries ?? 0
  const totalRecovered = stats?.total_recovered_amount ?? 0
  const showOnboardingBanner = emailsSent > 0 && totalRecovered === 0

  // Period-filtered recoveries for the table
  const filteredRecoveries = useMemo(() => {
    if (period === 'all') return recoveries
    const days = period === '7d' ? 7 : 30
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return recoveries.filter((r) => new Date(r.created_at) >= cutoff)
  }, [recoveries, period])

  // Chart data: contiguous day-by-day grid merged with real data
  const chartData = useMemo((): ChartEntry[] => {
    const now = new Date()
    if (period === 'all') {
      const from = userCreatedAt ? new Date(userCreatedAt) : new Date(Date.now() - 90 * 86400000)
      return generateChartData(from, now, recoveries)
    }
    const days = period === '7d' ? 7 : 30
    const from = new Date(Date.now() - (days - 1) * 86400000)
    return generateChartData(from, now, filteredRecoveries)
  }, [recoveries, filteredRecoveries, period, userCreatedAt])

  if (loading) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ height: 32, width: 256, background: 'var(--surface-3, #1C1C1C)', borderRadius: 8, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 100, background: 'var(--surface-3, #1C1C1C)', borderRadius: 12 }} />
          ))}
        </div>
        <div style={{ height: 256, background: 'var(--surface-3, #1C1C1C)', borderRadius: 12 }} />
      </div>
    )
  }

  const periods: { key: Period; label: string }[] = [
    { key: '7d', label: '7d' },
    { key: '30d', label: '30d' },
    { key: 'all', label: 'All time' },
  ]

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '32px 32px 0', marginBottom: 28 }}
      >
        <div>
          <h1 style={{
            fontFamily: 'var(--font-sora), system-ui, sans-serif',
            fontSize: 22, fontWeight: 700, color: 'var(--text-1, #F2F2F2)', marginBottom: 3,
          }}>
            {getGreeting()}, {userName}.
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-2, #555)', margin: 0 }}>Here&apos;s your recovery overview.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Analyzer icon button */}
          {hasCompanyUrl && (
            <button
              onClick={() => setAnalyzerTrigger(n => n + 1)}
              title="View recovery analysis"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-mid, #282828)',
                borderRadius: 8, padding: '7px 10px',
                color: 'var(--text-3, #555)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-mid, #282828)'; e.currentTarget.style.color = 'var(--text-3, #555)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
          )}

          {/* Period selector */}
          <div className="flex items-center" style={{
            background: 'var(--surface, #111)',
            border: '1px solid var(--border, #1E1E1E)',
            borderRadius: 8, padding: 3, gap: 2,
          }}>
            {periods.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                style={{
                  padding: '5px 12px',
                  border: period === key ? '1px solid var(--border-mid, #282828)' : '1px solid transparent',
                  background: period === key ? 'var(--surface-3, #1C1C1C)' : 'transparent',
                  borderRadius: 6, fontSize: 12, fontWeight: 500,
                  color: period === key ? 'var(--text-1, #F2F2F2)' : 'var(--text-3, #555)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Pause / Resume */}
          {hasStripeRow && (
            recoveryPaused ? (
              <button
                onClick={handleResume}
                disabled={togglingPause}
                style={{
                  background: 'transparent', border: '1px solid var(--green-border, rgba(34,197,94,0.20))',
                  borderRadius: 8, padding: '7px 14px', fontSize: 13,
                  color: 'var(--green, #22C55E)', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <PlayCircle style={{ width: 14, height: 14 }} />
                {togglingPause ? 'Resuming…' : 'Resume recovery'}
              </button>
            ) : (
              <button
                onClick={handlePause}
                disabled={togglingPause}
                style={{
                  background: 'transparent', border: '1px solid var(--border-mid, #282828)',
                  borderRadius: 8, padding: '7px 14px', fontSize: 13,
                  color: 'var(--text-2, #888)', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--red-border, rgba(239,68,68,0.20))'; e.currentTarget.style.color = 'var(--red, #EF4444)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-mid, #282828)'; e.currentTarget.style.color = 'var(--text-2, #888)' }}
              >
                <PauseCircle style={{ width: 14, height: 14 }} />
                {togglingPause ? 'Pausing…' : 'Pause recovery'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Stripe disconnect banner */}
      {hasStripeRow && recoveryPaused && pausedBy === 'stripe_disconnect' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          margin: '0 32px 20px',
          background: 'var(--accent-dim, rgba(201,74,31,0.06))',
          border: '1px solid var(--accent-border, rgba(201,74,31,0.20))',
          borderRadius: 12, padding: '16px 20px',
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1, #F2F2F2)', marginBottom: 3 }}>Recovery paused — Stripe is disconnected</p>
            <p style={{ fontSize: 13, color: 'var(--text-2, #888)', margin: 0 }}>Reconnect your Stripe account, then click Resume to restart recovery.</p>
          </div>
          <a
            href="/api/stripe/connect/start"
            style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              fontSize: 13, fontWeight: 500, color: '#C94A1F',
              background: 'var(--accent-dim, rgba(201,74,31,0.10))',
              border: '1px solid var(--accent-border, rgba(201,74,31,0.20))',
              borderRadius: 8, padding: '7px 14px', textDecoration: 'none',
            }}
          >
            <PlayCircle style={{ width: 14, height: 14 }} />
            Reconnect Stripe
          </a>
        </div>
      )}

      {/* Trial banner */}
      {userPlan === 'trial' && <div style={{ margin: '0 32px 20px' }}><TrialBanner trialEndsAt={trialEndsAt} /></div>}

      {/* Business name prompt for Google OAuth users */}
      {missingBusinessName && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          margin: '0 32px 20px',
          background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
          borderRadius: 12, padding: '14px 18px',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', margin: 0, flexShrink: 0 }}>
            What&apos;s your business name?
          </p>
          <input
            type="text"
            value={businessNameInput}
            onChange={(e) => setBusinessNameInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveBusinessName() }}
            placeholder="Acme Inc."
            style={{
              flex: 1, padding: '8px 12px',
              background: 'var(--surface)', border: '1px solid var(--border-mid)',
              borderRadius: 7, fontSize: 13, color: 'var(--text-1)',
              outline: 'none', fontFamily: 'inherit',
              minWidth: 0,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-mid)' }}
          />
          <button
            onClick={saveBusinessName}
            disabled={savingBusinessName || !businessNameInput.trim()}
            style={{
              flexShrink: 0, padding: '8px 16px',
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 7,
              fontSize: 13, fontWeight: 600,
              cursor: savingBusinessName || !businessNameInput.trim() ? 'not-allowed' : 'pointer',
              opacity: !businessNameInput.trim() ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { if (businessNameInput.trim()) e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = businessNameInput.trim() ? '1' : '0.5' }}
          >
            {savingBusinessName ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      {/* Business analysis CTA */}
      <BusinessAnalysis forceOpen={analyzerTrigger > 0} key={analyzerTrigger} />

      {/* Setup checklist (new version) */}
      <SetupChecklist />

      {/* Legacy inline checklist */}
      {showChecklist && (
        <div style={{
          background: 'var(--surface, #111)',
          border: '1px solid var(--border, #1E1E1E)',
          borderRadius: 12, margin: '0 32px 24px', overflow: 'hidden',
        }}>
          <button
            onClick={() => setChecklistOpen(o => !o)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {setupSteps.map((_, i) => (
                  <div key={i} style={{
                    height: 4, width: 20, borderRadius: 2,
                    background: i < completedCount ? '#C94A1F' : 'var(--border, #1E1E1E)',
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1, #F2F2F2)' }}>
                Get set up — {completedCount}/{setupSteps.length} complete
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); dismissChecklist() }}
                style={{ fontSize: 12, color: 'var(--text-3, #444)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Dismiss
              </button>
              {checklistOpen
                ? <ChevronUp style={{ width: 16, height: 16, color: 'var(--text-3, #444)' }} />
                : <ChevronDown style={{ width: 16, height: 16, color: 'var(--text-3, #444)' }} />
              }
            </div>
          </button>

          {checklistOpen && (
            <div style={{ borderTop: '1px solid var(--border, #1E1E1E)' }}>
              {setupSteps.map((step) => {
                const done = setupStatus[step.key]
                return (
                  <Link
                    key={step.key}
                    href={done ? '#' : step.href}
                    onClick={done ? (e) => e.preventDefault() : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 20px', borderBottom: '1px solid var(--border, #1E1E1E)',
                      textDecoration: 'none', opacity: done ? 0.4 : 1,
                      transition: 'background 0.15s',
                    }}
                  >
                    {done
                      ? <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--green, #22C55E)', flexShrink: 0 }} />
                      : <Circle style={{ width: 16, height: 16, color: '#C94A1F', flexShrink: 0 }} />
                    }
                    <div className="flex-1">
                      <p style={{
                        fontSize: 13, fontWeight: 500, margin: 0,
                        color: done ? 'var(--text-2, #555)' : 'var(--text-1, #F2F2F2)',
                        textDecoration: done ? 'line-through' : 'none',
                      }}>
                        {step.label}
                      </p>
                      {!done && <p style={{ fontSize: 12, color: 'var(--text-3, #444)', margin: '2px 0 0' }}>{step.desc}</p>}
                    </div>
                    {!done && (
                      <span style={{ fontSize: 12, color: '#C94A1F', fontWeight: 500, flexShrink: 0 }}>Set up →</span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Onboarding / status banner */}
      {showOnboardingBanner && !recoveryPaused && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 16,
          background: 'var(--accent-dim, rgba(201,74,31,0.06))',
          border: '1px solid var(--accent-border, rgba(201,74,31,0.15))',
          borderRadius: 12, padding: '18px 20px', margin: '0 32px 24px',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C94A1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
          </svg>
          <div className="flex-1">
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 4px' }}>Recovery emails are sending</p>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
              Revorva has sent {emailsSent} email{emailsSent !== 1 ? 's' : ''}. Recovery happens when your customer updates their payment method. Most recoveries happen within 7 days of the first email.
            </p>
          </div>
        </div>
      )}

      {recoveryPaused && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'var(--red-dim, rgba(239,68,68,0.08))',
          border: '1px solid var(--red-border, rgba(239,68,68,0.20))',
          borderRadius: 12, padding: '18px 20px', margin: '0 32px 24px',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red, #EF4444)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
          <div className="flex-1">
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 4px' }}>Recovery is paused</p>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
              No new recovery emails will be sent while recovery is paused. Resume recovery to continue processing failed payments.
            </p>
          </div>
          <button
            onClick={handleResume}
            disabled={togglingPause}
            style={{
              flexShrink: 0, background: '#C94A1F', color: '#fff', border: 'none',
              borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 500,
              cursor: togglingPause ? 'wait' : 'pointer', whiteSpace: 'nowrap',
              opacity: togglingPause ? 0.7 : 1, transition: 'opacity 0.15s',
            }}
          >
            {togglingPause ? 'Resuming…' : 'Resume recovery'}
          </button>
        </div>
      )}

      {/* Stat cards */}
      <StatsCards stats={stats} />

      {/* Chart */}
      <RecoveryChart data={chartData} period={period} />

      {/* Quick actions */}
      <QuickActions />

      {/* Recovery table */}
      {filteredRecoveries.length === 0 && !stripeConnected ? (
        <div style={{
          background: 'var(--surface, #111)',
          border: '1px solid var(--border, #1E1E1E)',
          borderRadius: 12, margin: '0 32px', padding: '48px 24px', textAlign: 'center',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
            style={{ margin: '0 auto 12px', display: 'block', opacity: 0.15, color: 'var(--text-1)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-3, #444)', marginBottom: 8 }}>Revorva is watching</h3>
          <p style={{ fontSize: 13, color: 'var(--text-3, #444)', maxWidth: 320, margin: '0 auto 20px' }}>
            When a payment fails on your Stripe account, recovery starts automatically here.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/connect" style={{
              fontSize: 13, fontWeight: 500, color: '#fff',
              background: '#C94A1F', borderRadius: 8, padding: '8px 16px', textDecoration: 'none',
            }}>
              Connect Stripe →
            </Link>
            <Link href="/features" style={{ fontSize: 13, color: 'var(--text-3, #444)', textDecoration: 'none' }}>
              Learn how it works →
            </Link>
          </div>
        </div>
      ) : (
        <RecoveryTable recoveries={filteredRecoveries} />
      )}
    </div>
  )
}


