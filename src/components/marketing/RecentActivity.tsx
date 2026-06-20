import { createClient } from '@supabase/supabase-js'

// ISR: revalidate every 60 seconds so numbers feel fresh
export const revalidate = 60

async function getStats() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [recoveredRes, businessesRes, avgTimeRes] = await Promise.all([
      // Total amount recovered in last 30 days + count
      supabase
        .from('recoveries')
        .select('amount')
        .eq('status', 'recovered')
        .gte('recovered_at', thirtyDaysAgo),

      // Count of distinct businesses (stripe_accounts)
      supabase
        .from('stripe_accounts')
        .select('user_id', { count: 'exact', head: true }),

      // Average recovery time in days
      supabase
        .from('recoveries')
        .select('created_at, recovered_at')
        .eq('status', 'recovered')
        .not('recovered_at', 'is', null)
        .limit(500),
    ])

    const recoveries = recoveredRes.data ?? []
    const totalAmount = recoveries.reduce((sum, r) => sum + (r.amount ?? 0), 0)
    const recoveryCount = recoveries.length
    const businessCount = businessesRes.count ?? 0

    let avgDays = 0
    if (avgTimeRes.data && avgTimeRes.data.length > 0) {
      const diffs = avgTimeRes.data
        .filter((r) => r.recovered_at && r.created_at)
        .map((r) => {
          const ms = new Date(r.recovered_at).getTime() - new Date(r.created_at).getTime()
          return ms / (1000 * 60 * 60 * 24)
        })
      if (diffs.length > 0) {
        avgDays = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length)
      }
    }

    return { totalAmount, recoveryCount, businessCount, avgDays, hasData: recoveryCount > 0 || businessCount > 0 }
  } catch {
    return { totalAmount: 0, recoveryCount: 0, businessCount: 0, avgDays: 0, hasData: false }
  }
}

function formatCurrency(cents: number): string {
  // amounts are stored in cents in the recoveries table
  const dollars = cents / 100
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}k`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(dollars)
}

export async function RecentActivity() {
  // Feature flag — hidden until real data exists
  if (process.env.NEXT_PUBLIC_SHOW_RECENT_ACTIVITY !== 'true') return null

  const { totalAmount, recoveryCount, businessCount, avgDays, hasData } = await getStats()

  if (!hasData) return null

  const stats = [
    {
      label: 'Total recovered this month',
      value: formatCurrency(totalAmount),
      subtext: `Across ${recoveryCount} ${recoveryCount === 1 ? 'recovery' : 'recoveries'}`,
    },
    {
      label: 'Active SaaS businesses',
      value: `${businessCount}+`,
      subtext: 'Using Revorva right now',
    },
    {
      label: 'Average recovery time',
      value: `${avgDays} day${avgDays !== 1 ? 's' : ''}`,
      subtext: 'From failure to recovered',
    },
  ]

  return (
    <section className="bg-cream py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl lg:text-5xl text-ink">Revorva in action</h2>
          <p className="text-muted mt-3">Real recovery activity from the last 30 days</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-border rounded-2xl p-8 text-center"
            >
              <p className="font-display text-5xl text-accent mb-3">{stat.value}</p>
              <p className="text-sm font-semibold text-ink mb-1">{stat.label}</p>
              <p className="text-xs text-muted">{stat.subtext}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
