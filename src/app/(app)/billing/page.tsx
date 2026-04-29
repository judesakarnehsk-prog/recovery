'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CreditCard, ArrowUpRight, CheckCircle2, AlertTriangle, X, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'

const PRICE_IDS = {
  starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || '',
  growth: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID || '',
  scale: process.env.NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID || '',
}

const planDetails: Record<string, { name: string; price: string; features: string[] }> = {
  starter: {
    name: 'Starter',
    price: '$29/mo',
    features: ['Up to $10k MRR', 'Unlimited recovery emails', 'Smart retry schedule'],
  },
  growth: {
    name: 'Growth',
    price: '$79/mo',
    features: ['Up to $50k MRR', 'AI-personalized email content', 'Custom email domain (billing@yourdomain.com)'],
  },
  scale: {
    name: 'Scale',
    price: '$149/mo',
    features: ['Unlimited MRR', 'Everything in Growth', 'Unlimited custom domains', 'Dedicated account manager'],
  },
  trial: {
    name: 'Free Trial',
    price: '$0',
    features: ['14-day trial', 'Full Growth feature access'],
  },
  expired: {
    name: 'Trial Ended',
    price: '$0',
    features: ['Trial has ended', 'Subscribe to restore access'],
  },
  past_due: {
    name: 'Past Due',
    price: '—',
    features: ['Payment failed', 'Update payment method to continue'],
  },
  free: {
    name: 'No Plan',
    price: '$0',
    features: ['Subscribe to start recovering revenue'],
  },
}

export default function BillingPage() {
  const searchParams = useSearchParams()
  const isExpired = searchParams.get('expired') === 'true'
  const isPastDue = searchParams.get('past_due') === 'true'

  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState('trial')
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null)
  const [cancellingAt, setCancellingAt] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

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
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const PLAN_AMOUNTS: Record<string, number> = { starter: 29, growth: 79, scale: 149 }
  const PRICE_TO_PLAN: Record<string, string> = {
    [PRICE_IDS.starter]: 'starter',
    [PRICE_IDS.growth]: 'growth',
    [PRICE_IDS.scale]: 'scale',
  }

  const handleUpgrade = async (priceId: string) => {
    const targetPlan = PRICE_TO_PLAN[priceId] || 'starter'
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })
    const data = await res.json()
    if (data.url) {
      if (plan === 'trial') {
        trackEvent('subscription_started', { plan: targetPlan, amount: PLAN_AMOUNTS[targetPlan] })
      } else {
        trackEvent('plan_upgraded', { from: plan, to: targetPlan })
      }
      window.location.href = data.url
    } else {
      console.error('Checkout error:', data.error)
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
    if (res.ok) {
      setCancellingAt(null)
    }
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

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-32 bg-cream rounded animate-pulse" />
        <div className="h-48 bg-cream rounded-2xl animate-pulse" />
      </div>
    )
  }

  const current = planDetails[plan] || planDetails.trial
  const isPaidPlan = ['starter', 'growth', 'scale'].includes(plan)
  const cancelDate = cancellingAt
    ? new Date(cancellingAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Billing</h1>

      {/* Trial expired banner */}
      {(isExpired || plan === 'expired' || plan === 'free') && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl px-6 py-5">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Your free trial has ended</p>
              <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                Add a payment method to continue recovering revenue. Your data is safe — no recoveries were lost.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 ml-8">
            <Button variant="accent" size="sm" onClick={() => handleUpgrade(PRICE_IDS.growth)}>
              <ArrowUpRight className="w-4 h-4" />
              Subscribe to Growth — $79/mo
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleUpgrade(PRICE_IDS.starter)}>
              Starter — $29/mo
            </Button>
          </div>
        </div>
      )}

      {/* Past due banner */}
      {(isPastDue || plan === 'past_due') && !isExpired && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl px-6 py-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">Payment failed — action required</p>
              <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                Your last payment didn't go through. Update your payment method to keep Revorva running.
              </p>
              {stripeCustomerId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 text-amber-800 border-amber-300 hover:bg-amber-100"
                  onClick={handleManageStripe}
                  disabled={portalLoading}
                >
                  {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  Update payment method
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancellation notice */}
      {cancellingAt && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900">Subscription cancelling</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Your plan will end on <strong>{cancelDate}</strong>. You'll keep full access until then.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndoCancel}
            disabled={cancelLoading}
            className="flex-shrink-0 text-amber-700 border-amber-300 hover:bg-amber-100"
          >
            Undo cancellation
          </Button>
        </div>
      )}

      {/* Current plan */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">Current Plan</h2>
          <Badge variant={plan === 'trial' ? 'pending' : 'recovered'}>{current.name}</Badge>
        </div>

        <p className="text-3xl font-bold text-ink mb-4">{current.price}</p>

        <ul className="space-y-2 mb-5">
          {current.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-muted">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-2">
          {(plan === 'trial' || plan === 'expired' || plan === 'free' || plan === 'past_due') && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleUpgrade(PRICE_IDS.starter)}>
                <ArrowUpRight className="w-4 h-4" />
                Subscribe to Starter
              </Button>
              <Button variant="accent" size="sm" onClick={() => handleUpgrade(PRICE_IDS.growth)}>
                <ArrowUpRight className="w-4 h-4" />
                Subscribe to Growth
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleUpgrade(PRICE_IDS.scale)}>
                Subscribe to Scale
              </Button>
            </>
          )}
          {plan === 'starter' && (
            <>
              <Button variant="accent" size="sm" onClick={() => handleUpgrade(PRICE_IDS.growth)}>
                <ArrowUpRight className="w-4 h-4" />
                Upgrade to Growth
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleUpgrade(PRICE_IDS.scale)}>
                Upgrade to Scale
              </Button>
            </>
          )}
          {(plan === 'growth' || plan === 'scale') && (
            <Link href="/pricing">
              <Button variant="outline" size="sm">View all plans</Button>
            </Link>
          )}

          {isPaidPlan && !cancellingAt && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted hover:text-red-600 hover:bg-red-50 ml-auto"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel subscription
            </Button>
          )}
        </div>

        {plan === 'trial' && trialEndsAt && (() => {
          const endsAt = new Date(trialEndsAt)
          const daysLeft = Math.ceil((endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          const dateStr = endsAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          return (
            <p className="text-xs text-muted mt-4">
              Your free trial ends on <strong className="text-ink">{dateStr}</strong>
              {daysLeft > 0 && <span> ({daysLeft} day{daysLeft === 1 ? '' : 's'} remaining)</span>}
              {daysLeft <= 0 && <span className="text-amber-600"> (expired)</span>}
            </p>
          )
        })()}

        <p className="text-xs text-muted mt-1">
          Cancel anytime. Your data is retained for 30 days after cancellation.
        </p>
      </div>

      {/* Payment method */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-muted" />
          <h2 className="text-base font-semibold text-ink">Payment Method</h2>
        </div>

        {stripeCustomerId ? (
          <div>
            <p className="text-sm text-muted mb-3">
              Your payment method is managed through Stripe.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageStripe}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUpRight className="w-4 h-4" />
              )}
              Manage in Stripe
            </Button>
            {portalError && (
              <p className="text-xs text-red-600 mt-2 max-w-xs leading-relaxed">{portalError}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">
            No payment method on file. A payment method will be added when you subscribe to a paid plan.
          </p>
        )}
      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-ink">Cancel subscription?</h3>
              <button onClick={() => setShowCancelModal(false)} className="text-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Your subscription will cancel at the end of your current billing period. You'll keep full access to Revorva until then, and no further charges will be made.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 border border-border"
                onClick={() => setShowCancelModal(false)}
              >
                Keep subscription
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-red-600 hover:bg-red-50 border border-red-200"
                onClick={handleCancel}
                loading={cancelLoading}
              >
                Yes, cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
