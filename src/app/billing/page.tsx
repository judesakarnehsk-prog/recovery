'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreditCard, ArrowUpRight, CheckCircle2, Loader2 } from 'lucide-react'
import { AuthenticatedNav } from '@/components/AuthenticatedNav'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const planDetails: Record<string, { name: string; price: string; features: string[] }> = {
  starter: {
    name: 'Starter',
    price: '$29/mo',
    features: ['100 recovery attempts/mo', '1 sending domain', '3-step dunning sequence'],
  },
  growth: {
    name: 'Growth',
    price: '$79/mo',
    features: ['1,000 recovery attempts/mo', '3 sending domains', '5-step dunning sequence'],
  },
  scale: {
    name: 'Scale',
    price: '$199/mo',
    features: ['Unlimited recovery attempts', 'Unlimited domains', 'Custom dunning flows'],
  },
  free: {
    name: 'Free Trial',
    price: '$0',
    features: ['14-day trial', 'Full feature access'],
  },
}

export default function BillingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [plan, setPlan] = useState('free')
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const profileRes = await supabase.from('users').select('full_name, email, plan, stripe_customer_id').eq('id', user.id).single()

    if (profileRes.data) {
      setUserName(profileRes.data.full_name || '')
      setUserEmail(profileRes.data.email || user.email || '')
      setPlan(profileRes.data.plan || 'free')
      setStripeCustomerId(profileRes.data.stripe_customer_id || null)
    }
    setLoading(false)
  }, [router])

  useEffect(() => { loadData() }, [loadData])

  const handleUpgrade = async () => {
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentPlan = planDetails[plan] || planDetails.free

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedNav userName={userName} userEmail={userEmail} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Billing</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your subscription and payment method</p>
        </div>

        <div className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Your active subscription</CardDescription>
                </div>
                <Badge variant={plan === 'free' ? 'default' : 'success'}>{currentPlan.name}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-extrabold text-text-primary">{currentPlan.price}</span>
                {plan !== 'free' && <span className="text-text-secondary">/month</span>}
              </div>
              <ul className="space-y-2 mb-6">
                {currentPlan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan === 'free' || plan === 'starter' ? (
                <Button variant="primary" size="md" onClick={handleUpgrade} className="gap-1.5">
                  <ArrowUpRight className="w-4 h-4" />
                  Upgrade Plan
                </Button>
              ) : (
                <Link href="/pricing">
                  <Button variant="outline" size="md">View All Plans</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Method
              </CardTitle>
              <CardDescription>Manage your payment details via Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              {stripeCustomerId ? (
                <div className="space-y-3">
                  <p className="text-sm text-text-secondary">
                    Your payment method is managed through Stripe. Click below to update your card or view invoices.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => window.open('https://billing.stripe.com', '_blank')}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Manage in Stripe
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-text-secondary">
                  No payment method on file. A payment method will be added when you subscribe to a paid plan.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
