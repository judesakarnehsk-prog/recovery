'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, TrendingUp, Users, DollarSign, Activity } from 'lucide-react'
import Link from 'next/link'
import { AuthenticatedNav } from '@/components/AuthenticatedNav'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface AdminStats {
  totalUsers: number
  totalRecoveredCents: number
  totalAttempts: number
  totalSuccess: number
  recoveryRate: number
  planBreakdown: Record<string, number>
}

const planColors: Record<string, string> = {
  free: 'bg-gray-400',
  starter: 'bg-success',
  growth: 'bg-primary',
  scale: 'bg-accent',
}

export default function AdminMetricsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const profileRes = await supabase.from('users').select('full_name, email').eq('id', user.id).single()
    if (profileRes.data) {
      setUserName(profileRes.data.full_name || '')
      setUserEmail(profileRes.data.email || user.email || '')
    }

    const res = await fetch('/api/admin/stats')
    if (!res.ok) { setError('Access denied.'); setLoading(false); return }
    const data = await res.json()
    setStats(data)
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

  const recoveredAmount = ((stats?.totalRecoveredCents || 0) / 100).toLocaleString('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0,
  })

  const planEntries = Object.entries(stats?.planBreakdown || {})
  const totalPlanUsers = planEntries.reduce((s, [, c]) => s + c, 0) || 1

  const metricCards = [
    { icon: Users, label: 'Total Users', value: String(stats?.totalUsers || 0), bg: 'bg-primary/10', color: 'text-primary' },
    { icon: DollarSign, label: 'Total Recovered', value: recoveredAmount, bg: 'bg-success/10', color: 'text-success' },
    { icon: Activity, label: 'Total Attempts', value: String(stats?.totalAttempts || 0), bg: 'bg-accent/10', color: 'text-accent' },
    { icon: TrendingUp, label: 'Recovery Rate', value: `${stats?.recoveryRate || 0}%`, bg: 'bg-success/10', color: 'text-success' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedNav userName={userName} userEmail={userEmail} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin" className="text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Metrics</h1>
            <p className="text-sm text-text-secondary mt-1">System-wide recovery analytics</p>
          </div>
        </div>

        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {metricCards.map((m) => (
                <Card key={m.label} className="p-6">
                  <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center mb-3`}>
                    <m.icon className={`w-5 h-5 ${m.color}`} />
                  </div>
                  <p className="text-2xl font-extrabold text-text-primary">{m.value}</p>
                  <p className="text-sm text-text-secondary mt-1">{m.label}</p>
                </Card>
              ))}
            </div>

            {/* Plan distribution bar */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {planEntries.map(([plan, count]) => {
                  const pct = Math.round((count / totalPlanUsers) * 100)
                  return (
                    <div key={plan}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-medium text-text-primary capitalize">{plan}</span>
                        <span className="text-text-secondary">{count} users ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${planColors[plan] || 'bg-primary'} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Success vs failure breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Recovery Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Successful recoveries</span>
                      <span className="font-semibold text-success">{stats?.totalSuccess || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Failed/pending</span>
                      <span className="font-semibold text-text-primary">
                        {(stats?.totalAttempts || 0) - (stats?.totalSuccess || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-border pt-3">
                      <span className="text-text-secondary font-medium">Total attempts</span>
                      <span className="font-bold text-text-primary">{stats?.totalAttempts || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-5xl font-extrabold text-primary">{stats?.recoveryRate || 0}%</p>
                      <p className="text-sm text-text-secondary mt-1">Overall recovery rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
