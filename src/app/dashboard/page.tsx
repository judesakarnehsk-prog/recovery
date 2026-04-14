'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  TrendingUp,
  DollarSign,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { AuthenticatedNav } from '@/components/AuthenticatedNav'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface RecoveryStats {
  total_recoveries: number
  recovered_count: number
  pending_count: number
  failed_count: number
  total_recovered_amount: number
  total_attempted_amount: number
  recovery_rate: number
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'accent'; icon: typeof CheckCircle2 }> = {
  recovered: { label: 'Recovered', variant: 'success', icon: CheckCircle2 },
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  failed: { label: 'Failed', variant: 'error', icon: XCircle },
  email_sent: { label: 'Email Sent', variant: 'accent', icon: Mail },
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [stats, setStats] = useState<RecoveryStats | null>(null)
  const [recoveries, setRecoveries] = useState<any[]>([])
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const [profileRes, statsRes, recoveriesRes, stripeRes] = await Promise.all([
      supabase.from('users').select('full_name, email, plan').eq('id', user.id).single(),
      supabase.from('user_recovery_stats').select('*').eq('user_id', user.id).single(),
      supabase.from('recoveries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('stripe_accounts').select('stripe_account_id').eq('user_id', user.id).single(),
    ])

    if (profileRes.data) {
      setUserName(profileRes.data.full_name || '')
      setUserEmail(profileRes.data.email || user.email || '')
    }
    if (statsRes.data) setStats(statsRes.data)
    if (recoveriesRes.data) setRecoveries(recoveriesRes.data)
    if (stripeRes.data) setStripeAccountId(stripeRes.data.stripe_account_id)

    setLoading(false)
  }, [router])

  useEffect(() => { loadData() }, [loadData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const recoveredAmount = ((stats?.total_recovered_amount || 0) / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
  const recoveryRate = stats?.recovery_rate ? `${Math.round(stats.recovery_rate)}%` : '0%'

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedNav userName={userName} userEmail={userEmail} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Your payment recovery overview</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <Badge variant="success">Revenue</Badge>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-text-primary">{recoveredAmount}</p>
            <p className="text-sm text-text-secondary mt-1">Total recovered</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="default">{stats?.total_recoveries || 0}</Badge>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-text-primary">{stats?.total_recoveries || 0}</p>
            <p className="text-sm text-text-secondary mt-1">Failed payments tracked</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <Badge variant="accent">{recoveryRate}</Badge>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-text-primary">{recoveryRate}</p>
            <p className="text-sm text-text-secondary mt-1">Recovery rate</p>
          </Card>
        </div>

        {/* Recent Recoveries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Recoveries</CardTitle>
              {stripeAccountId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => window.open(`https://dashboard.stripe.com/connect/accounts/${stripeAccountId}`, '_blank')}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View in Stripe
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recoveries.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-10 h-10 text-text-secondary/30 mx-auto mb-3" />
                <p className="text-sm text-text-secondary">No recovery attempts yet.</p>
                <p className="text-xs text-text-secondary/60 mt-1">
                  Failed payments from Stripe will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-6 font-medium text-text-secondary">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Reason</th>
                      <th className="text-right py-3 px-6 font-medium text-text-secondary">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recoveries.map((r) => {
                      const cfg = statusConfig[r.status] || statusConfig.pending
                      const StatusIcon = cfg.icon
                      return (
                        <tr key={r.id} className="border-b border-border/50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-6">
                            <p className="font-medium text-text-primary">{r.customer_email || 'Unknown'}</p>
                          </td>
                          <td className="py-3 px-4 font-semibold text-text-primary">
                            ${((r.amount || 0) / 100).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={cfg.variant} className="gap-1">
                              <StatusIcon className="w-3 h-3" />
                              {cfg.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-text-secondary">
                            {r.failure_reason?.replace(/_/g, ' ') || '—'}
                          </td>
                          <td className="py-3 px-6 text-right text-text-secondary">
                            {r.created_at ? format(new Date(r.created_at), 'MMM d, yyyy') : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
