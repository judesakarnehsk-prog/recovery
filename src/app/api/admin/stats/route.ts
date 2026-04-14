import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('users').select('email').eq('id', user.id).single()
    if (!profile || !isAdmin(profile.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const service = createServiceRoleClient()

    const [usersRes, recoveriesRes, statsRes] = await Promise.all([
      service.from('users').select('id, email, full_name, plan, created_at', { count: 'exact' }),
      service.from('recoveries').select('status, amount', { count: 'exact' }),
      service.from('user_recovery_stats').select('total_recovered_amount, total_recoveries, recovered_count'),
    ])

    const users = usersRes.data || []
    const recoveries = recoveriesRes.data || []
    const statsRows = statsRes.data || []

    const totalRecovered = statsRows.reduce((sum, r) => sum + (r.total_recovered_amount || 0), 0)
    const totalAttempts = statsRows.reduce((sum, r) => sum + (r.total_recoveries || 0), 0)
    const totalSuccess = statsRows.reduce((sum, r) => sum + (r.recovered_count || 0), 0)

    const planBreakdown: Record<string, number> = {}
    users.forEach((u) => {
      const p = u.plan || 'free'
      planBreakdown[p] = (planBreakdown[p] || 0) + 1
    })

    return NextResponse.json({
      totalUsers: usersRes.count ?? users.length,
      totalRecoveredCents: totalRecovered,
      totalAttempts,
      totalSuccess,
      recoveryRate: totalAttempts > 0 ? Math.round((totalSuccess / totalAttempts) * 100) : 0,
      planBreakdown,
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        plan: u.plan,
        created_at: u.created_at,
      })),
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
