'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'

const PRICE_IDS = {
  starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || '',
  growth:  process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID  || '',
  scale:   process.env.NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID   || '',
}

const PLAN_AMOUNTS: Record<string, number> = { starter: 29, growth: 79, scale: 149 }

const planDetails: Record<string, { name: string; priceNum: number | null; priceSuffix?: string; features: string[] }> = {
  starter: {
    name: 'Starter', priceNum: 29,
    features: ['Up to $10k MRR', 'Unlimited recovery emails', 'Smart retry schedule'],
  },
  growth: {
    name: 'Growth', priceNum: 79,
    features: ['Up to $50k MRR', 'AI-personalized email content', 'Custom email domain (billing@yourdomain.com)'],
  },
  scale: {
    name: 'Scale', priceNum: 149,
    features: ['Unlimited MRR', 'Everything in Growth', 'Unlimited custom domains', 'Dedicated account manager'],
  },
  trial: {
    name: 'Free Trial', priceNum: 0,
    features: ['14-day trial', 'Full Growth feature access', 'No credit card required'],
  },
  expired: {
    name: 'Trial Ended', priceNum: null,
    features: ['Trial has ended', 'Subscribe to restore access'],
  },
  past_due: {
    name: 'Past Due', priceNum: null,
    features: ['Payment failed', 'Update payment method to continue'],
  },
  free: {
    name: 'No Plan', priceNum: 0,
    features: ['Subscribe to start recovering revenue'],
  },
}

interface Invoice {
  id: string
  created: number
  amount_paid: number
  status: string | null
  hosted_invoice_url: string | null
  invoice_pdf: string | null
}

// ── Shared primitives ────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 12, padding: 24,
}

const CheckIcon = ({ color = 'var(--green)' }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

// ── BillingContent ────────────────────────────────────────────────────────────

function BillingContent() {
  const searchParams = useSearchParams()
  const isExpired  = searchParams.get('expired')  === 'true'
  const isPastDue  = searchParams.get('past_due') === 'true'

  const [loading, setLoading]               = useState(true)
  const [plan, setPlan]                     = useState('trial')
  const [trialEndsAt, setTrialEndsAt]       = useState<string | null>(null)
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null)
  const [cancellingAt, setCancellingAt]     = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelLoading, setCancelLoading]   = useState(false)
  const [portalLoading, setPortalLoading]   = useState(false)
  const [portalError, setPortalError]       = useState<string | null>(null)
  const [invoices, setInvoices]             = useState<Invoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('users')
      .select('plan, stripe_customer_id, trial_ends_at')
      .eq('id', user.id)
      .single()

    if (data) {
      setPlan(data.plan || 'trial')
      setStripeCustomerId(data.stripe_customer_id || null)
      setTrialEndsAt(data.trial_ends_at || null)
    }
    setLoading(false)

    // Load invoices in background
    if (data?.stripe_customer_id) {
      setInvoicesLoading(true)
      fetch('/api/billing/invoices')
        .then(r => r.ok ? r.json() : [])
        .then(data => setInvoices(Array.isArray(data) ? data : []))
        .catch(() => setInvoices([]))
        .finally(() => setInvoicesLoading(false))
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleUpgrade = async (priceId: string) => {
    const targetPlan = Object.entries(PRICE_IDS).find(([, v]) => v === priceId)?.[0] || 'starter'
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })
    const data = await res.json()
    if (data.url) {
      trackEvent(plan === 'trial' ? 'subscription_started' : 'plan_upgraded', { plan: targetPlan, amount: PLAN_AMOUNTS[targetPlan] })
      window.location.href = data.url
    }
  }

  const handleCancel = async () => {
    setCancelLoading(true)
    const res = await fetch('/api/stripe/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ undo: false }),
    })
    const data = await res.json()
    if (res.ok) {
      setCancellingAt(data.currentPeriodEnd)
      setShowCancelModal(false)
      trackEvent('subscription_cancelled', { plan })
    }
    setCancelLoading(false)
  }

  const handleUndoCancel = async () => {
    setCancelLoading(true)
    const res = await fetch('/api/stripe/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ undo: true }),
    })
    if (res.ok) setCancellingAt(null)
    setCancelLoading(false)
  }

  const handleManageStripe = async () => {
    setPortalLoading(true)
    setPortalError(null)
    const res = await fetch('/api/billing/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else if (data.error === 'portal_not_configured') {
      setPortalError('The Stripe Customer Portal has not been configured yet. Please set it up in Stripe Dashboard → Settings → Billing → Customer portal.')
    } else {
      setPortalError(data.error || 'Could not open billing portal. Please try again or contact support.')
    }
    setPortalLoading(false)
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ padding: '32px 32px 64px', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[100, 280, 160].map((h, i) => (
          <div key={i} style={{ height: h, background: 'var(--surface-2)', borderRadius: 12, opacity: 0.5 }} />
        ))}
      </div>
    )
  }

  const current = planDetails[plan] || planDetails.trial
  const isPaidPlan = ['starter', 'growth', 'scale'].includes(plan)
  const isActiveTrial = plan === 'trial' && trialEndsAt && new Date(trialEndsAt) > new Date()
  const cancelDate = cancellingAt
    ? new Date(cancellingAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  // Days remaining on trial
  let trialDaysLeft = 0
  let trialDateStr = ''
  if (trialEndsAt) {
    const endsAt = new Date(trialEndsAt)
    trialDaysLeft = Math.ceil((endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    trialDateStr = endsAt.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Heading */}
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px' }}>
          Billing
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
          Manage your subscription and payment method.
        </p>
      </div>

      {/* ── Trial banner ─────────────────────────────────────────────────── */}
      {isActiveTrial && (
        <div style={{
          background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
          borderRadius: 12, padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C94A1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 3px' }}>
              You're on a free trial — {trialDaysLeft > 0 ? `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} remaining` : 'expiring today'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
              Add a payment method before your trial ends to keep recovery running uninterrupted.
            </p>
          </div>
          <button
            onClick={() => handleUpgrade(PRICE_IDS.growth)}
            style={{
              flexShrink: 0, padding: '9px 18px', fontSize: 13, fontWeight: 600,
              background: '#C94A1F', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Add payment method
          </button>
        </div>
      )}

      {/* ── Trial expired banner ──────────────────────────────────────────── */}
      {(isExpired || plan === 'expired' || plan === 'free') && (
        <div style={{
          background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)',
          borderRadius: 12, padding: '16px 20px',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#92400E', margin: '0 0 4px' }}>Your free trial has ended</p>
            <p style={{ fontSize: 13, color: '#B45309', margin: '0 0 12px' }}>
              Add a payment method to continue recovering revenue. Your data is safe — no recoveries were lost.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => handleUpgrade(PRICE_IDS.growth)}
                style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: '#C94A1F', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Subscribe to Growth — $79/mo
              </button>
              <button
                onClick={() => handleUpgrade(PRICE_IDS.starter)}
                style={{ padding: '8px 16px', fontSize: 13, fontWeight: 500, background: 'transparent', color: 'var(--text-1)', border: '1px solid var(--border-mid)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-bright)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-mid)'}
              >
                Starter — $29/mo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Past due banner ───────────────────────────────────────────────── */}
      {(isPastDue || plan === 'past_due') && !isExpired && (
        <div style={{
          background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)',
          borderRadius: 12, padding: '16px 20px',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#92400E', margin: '0 0 4px' }}>Payment failed — action required</p>
            <p style={{ fontSize: 13, color: '#B45309', margin: '0 0 12px' }}>
              Your last payment didn't go through. Update your payment method to keep Revorva running.
            </p>
            {stripeCustomerId && (
              <button
                onClick={handleManageStripe}
                disabled={portalLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13, fontWeight: 500, background: 'transparent', color: '#92400E', border: '1px solid rgba(217,119,6,0.4)', borderRadius: 8, cursor: 'pointer', opacity: portalLoading ? 0.6 : 1 }}
              >
                Update payment method
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Cancellation notice ───────────────────────────────────────────── */}
      {cancellingAt && (
        <div style={{
          background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)',
          borderRadius: 12, padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#92400E', margin: '0 0 2px' }}>Subscription cancelling</p>
            <p style={{ fontSize: 13, color: '#B45309', margin: 0 }}>
              Your plan will end on <strong>{cancelDate}</strong>. You'll keep full access until then.
            </p>
          </div>
          <button
            onClick={handleUndoCancel}
            disabled={cancelLoading}
            style={{ flexShrink: 0, padding: '7px 14px', fontSize: 12, fontWeight: 500, background: 'transparent', color: '#92400E', border: '1px solid rgba(217,119,6,0.4)', borderRadius: 7, cursor: 'pointer', opacity: cancelLoading ? 0.6 : 1 }}
          >
            Undo cancellation
          </button>
        </div>
      )}

      {/* ── Current Plan card ──────────────────────────────────────────────── */}
      <div style={card}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
            Current plan
          </p>
          <span style={{
            background: 'var(--accent-dim)', color: '#C94A1F',
            border: '1px solid var(--accent-border)',
            borderRadius: 100, fontSize: 11, fontWeight: 600, padding: '3px 10px',
          }}>
            {current.name}
          </span>
        </div>

        {/* Price */}
        {current.priceNum !== null ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif', fontSize: 40, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              ${current.priceNum}
            </span>
            <span style={{ fontSize: 18, fontWeight: 400, color: 'var(--text-2)' }}>/mo</span>
          </div>
        ) : (
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif', fontSize: 40, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              —
            </span>
          </div>
        )}

        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 20px' }}>
          {plan === 'trial' && trialEndsAt
            ? `Free trial · Ends ${trialDateStr}${trialDaysLeft > 0 ? ` (${trialDaysLeft}d left)` : ' (expiring today)'}`
            : isPaidPlan
            ? 'Billed monthly · Next billing: —'
            : 'No active subscription'
          }
        </p>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {current.features.map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckIcon />
              <span style={{ fontSize: 14, color: 'var(--text-1)' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', margin: '0 0 16px' }} />

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Trial / expired / free / past_due: show subscribe options */}
            {(plan === 'trial' || plan === 'expired' || plan === 'free' || plan === 'past_due') && (
              <>
                <button
                  onClick={() => handleUpgrade(PRICE_IDS.growth)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 13, fontWeight: 600, background: '#C94A1F', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Subscribe to Growth
                </button>
                <button
                  onClick={() => handleUpgrade(PRICE_IDS.starter)}
                  style={{ padding: '9px 16px', fontSize: 13, fontWeight: 500, background: 'var(--surface-2)', color: 'var(--text-1)', border: '1px solid var(--border-mid)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-bright)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-mid)'}
                >
                  Starter — $29/mo
                </button>
              </>
            )}

            {/* Starter: upgrade options */}
            {plan === 'starter' && (
              <>
                <button
                  onClick={() => handleUpgrade(PRICE_IDS.growth)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 13, fontWeight: 600, background: '#C94A1F', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Upgrade to Growth
                </button>
                <button
                  onClick={() => handleUpgrade(PRICE_IDS.scale)}
                  style={{ padding: '9px 16px', fontSize: 13, fontWeight: 500, background: 'var(--surface-2)', color: 'var(--text-1)', border: '1px solid var(--border-mid)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-bright)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-mid)'}
                >
                  Upgrade to Scale
                </button>
              </>
            )}

            {/* Growth / Scale: view all plans */}
            {(plan === 'growth' || plan === 'scale') && (
              <a
                href="/pricing"
                style={{ padding: '9px 18px', fontSize: 13, fontWeight: 500, background: 'var(--surface-2)', color: 'var(--text-1)', border: '1px solid var(--border-mid)', borderRadius: 8, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.15s', display: 'inline-block' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-bright)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-mid)'}
              >
                View all plans
              </a>
            )}
          </div>

          {/* Cancel link */}
          {isPaidPlan && !cancellingAt && (
            <button
              onClick={() => setShowCancelModal(true)}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: 13, color: 'var(--text-3)', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
            >
              Cancel subscription →
            </button>
          )}
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 12 }}>
          Cancel anytime. Your data is retained for 30 days after cancellation.
        </p>
      </div>

      {/* ── Payment Method card ────────────────────────────────────────────── */}
      <div style={card}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-2)', flexShrink: 0 }}>
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <h2 style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
            Payment Method
          </h2>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 16px' }}>
          Your payment method is managed securely through Stripe.
        </p>

        {stripeCustomerId ? (
          <div>
            <button
              onClick={handleManageStripe}
              disabled={portalLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', fontSize: 13, fontWeight: 600,
                background: '#635BFF', color: '#fff',
                border: 'none', borderRadius: 8, cursor: portalLoading ? 'wait' : 'pointer',
                opacity: portalLoading ? 0.7 : 1, transition: 'opacity 0.15s',
                marginBottom: 10,
              }}
              onMouseEnter={(e) => { if (!portalLoading) e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={(e) => e.currentTarget.style.opacity = portalLoading ? '0.7' : '1'}
            >
              {portalLoading ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                </svg>
              )}
              Manage in Stripe
            </button>
            {portalError && (
              <p style={{ fontSize: 12, color: 'var(--red)', maxWidth: 400, lineHeight: 1.5, marginTop: 6 }}>{portalError}</p>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
            No payment method on file. A payment method will be added when you subscribe to a paid plan.
          </p>
        )}

        {/* Trust note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>
            Revorva never stores your card details. All billing is handled by Stripe.
          </p>
        </div>
      </div>

      {/* ── Invoice History card ──────────────────────────────────────────── */}
      <div style={card}>
        <h2 style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px' }}>
          Invoice History
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 16px' }}>
          Your past invoices and receipts.
        </p>

        {invoicesLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 40, background: 'var(--surface-2)', borderRadius: 8, opacity: 0.5 }} />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
              No invoices yet — your first invoice will appear here after your trial ends.
            </p>
          </div>
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  {['Date', 'Amount', 'Status', 'Invoice'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr
                    key={inv.id}
                    style={{ borderBottom: i < invoices.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
                      {new Date(inv.created * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-1)', fontWeight: 500 }}>
                      ${(inv.amount_paid / 100).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        background: 'var(--green-dim)', color: 'var(--green)',
                        border: '1px solid var(--green-border)',
                        borderRadius: 100, fontSize: 11, fontWeight: 600, padding: '2px 8px',
                      }}>
                        Paid
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {inv.hosted_invoice_url ? (
                        <a
                          href={inv.hosted_invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 13, color: '#C94A1F', textDecoration: 'none', transition: 'text-decoration 0.15s' }}
                          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
                          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}
                        >
                          Download PDF
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-3)', fontSize: 13 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Cancel modal ──────────────────────────────────────────────────── */}
      {showCancelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, maxWidth: 420, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'var(--font-sora), system-ui, sans-serif', margin: 0 }}>
                Cancel subscription?
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, display: 'flex', transition: 'color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-1)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 20px' }}>
              Your subscription will cancel at the end of your current billing period. You'll keep full access to Revorva until then, and no further charges will be made.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{ flex: 1, padding: '9px 16px', fontSize: 13, fontWeight: 500, background: 'transparent', border: '1px solid var(--border-mid)', borderRadius: 8, color: 'var(--text-2)', cursor: 'pointer' }}
              >
                Keep subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                style={{ flex: 1, padding: '9px 16px', fontSize: 13, fontWeight: 500, background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red-border)', borderRadius: 8, cursor: cancelLoading ? 'wait' : 'pointer', opacity: cancelLoading ? 0.6 : 1, transition: 'all 0.15s' }}
                onMouseEnter={(e) => { if (!cancelLoading) e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--red-dim)'; e.currentTarget.style.color = 'var(--red)' }}
              >
                {cancelLoading ? 'Cancelling…' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  )
}

