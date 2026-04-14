'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, CheckCircle2, ExternalLink, Unplug, Loader2 } from 'lucide-react'
import { AuthenticatedNav } from '@/components/AuthenticatedNav'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function IntegrationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const [profileRes, stripeRes] = await Promise.all([
      supabase.from('users').select('full_name, email').eq('id', user.id).single(),
      supabase.from('stripe_accounts').select('stripe_account_id').eq('user_id', user.id).single(),
    ])

    if (profileRes.data) {
      setUserName(profileRes.data.full_name || '')
      setUserEmail(profileRes.data.email || user.email || '')
    }
    if (stripeRes.data) setStripeAccountId(stripeRes.data.stripe_account_id)
    setLoading(false)
  }, [router])

  useEffect(() => { loadData() }, [loadData])

  const handleConnect = () => {
    window.location.href = '/api/stripe/connect/start'
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Stripe account?')) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('stripe_accounts').delete().eq('user_id', user.id)
    setStripeAccountId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedNav userName={userName} userEmail={userEmail} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Integrations</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your connected services</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Stripe</CardTitle>
                  <CardDescription>Payment processing and subscription data</CardDescription>
                </div>
              </div>
              <Badge variant={stripeAccountId ? 'success' : 'error'} className="gap-1">
                {stripeAccountId ? <><CheckCircle2 className="w-3 h-3" /> Connected</> : 'Not Connected'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {stripeAccountId ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-text-secondary mb-1">Account ID</p>
                  <p className="text-sm font-mono text-text-primary">{stripeAccountId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => window.open(`https://dashboard.stripe.com/connect/accounts/${stripeAccountId}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View in Stripe
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-red-500 hover:text-red-600"
                    onClick={handleDisconnect}
                  >
                    <Unplug className="w-4 h-4" />
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Link2 className="w-10 h-10 text-text-secondary/30 mx-auto mb-3" />
                <p className="text-sm text-text-secondary mb-4">Connect your Stripe account to start recovering failed payments.</p>
                <Button variant="primary" size="md" onClick={handleConnect}>
                  Connect Stripe Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
