'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, DollarSign, TrendingUp, Activity, Loader2 } from 'lucide-react'
import { AuthenticatedNav } from '@/components/AuthenticatedNav'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface AdminStats {
  totalUsers: number
  totalRecoveredCents: number
  totalAttempts: number
  totalSuccess: number
  recoveryRate: number
  planBreakdown: Record<string, number>
}

export default function AdminPage() {
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
    if (!res.ok) {
      setError('Access denied or failed to load admin data.')
      setLoading(false)
      return
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthenticatedNav userName={userName} userEmail={userEmail} />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  const recoveredAmount = ((stats?.totalRecoveredCents || 0) / 100).toLocaleString('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedNav userName={userName} userEmail={userEmail} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Admin Overview</h1>
            <p className="text-sm text-text-secondary mt-1">System-wide metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/users" className="text-sm text-primary hover:underline font-medium">Users →</Link>
            <Link href="/admin/metrics" className="text-sm text-primary hover:underline font-medium">Metrics →</Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-text-primary">{stats?.totalUsers || 0}</p>
            <p className="text-sm text-text-secondary mt-1">Total users</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-text-primary">{recoveredAmount}</p>
            <p className="text-sm text-text-secondary mt-1">Total recovered</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-text-primary">{stats?.totalAttempts || 0}</p>
            <p className="text-sm text-text-secondary mt-1">Recovery attempts</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-text-primary">{stats?.recoveryRate || 0}%</p>
            <p className="text-sm text-text-secondary mt-1">Recovery rate</p>
          </Card>
        </div>

        {/* Plan breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats?.planBreakdown || {}).map(([plan, count]) => (
                <div key={plan} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-border">
                  <Badge variant={plan === 'scale' ? 'accent' : plan === 'growth' ? 'default' : 'success'}>
                    {plan}
                  </Badge>
                  <span className="text-sm font-semibold text-text-primary">{count} users</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
