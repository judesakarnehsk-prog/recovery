import { DollarSign, TrendingUp, Mail, Clock } from 'lucide-react'

interface Stats {
  total_recovered_amount: number
  recovery_rate: number
  total_recoveries: number
  pending_count: number
}

function formatCurrency(cents: number) {
  const dollars = cents / 100
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`
  return `$${dollars.toFixed(0)}`
}

export function StatsCards({ stats }: { stats: Stats | null }) {
  const cards = [
    {
      label: 'Recovered This Month',
      value: stats ? formatCurrency(stats.total_recovered_amount) : '$0',
      icon: DollarSign,
      iconBg: 'var(--accent-dim, rgba(201,74,31,0.10))',
      iconColor: '#C94A1F',
      trend: stats?.total_recovered_amount ? null : 'No recoveries yet',
      trendType: 'neutral' as const,
    },
    {
      label: 'Recovery Rate',
      value: stats ? `${Math.round(stats.recovery_rate)}%` : '0%',
      icon: TrendingUp,
      iconBg: 'var(--blue-dim, rgba(96,165,250,0.10))',
      iconColor: 'var(--blue, #60A5FA)',
      trend: stats?.total_recoveries ? `${stats.total_recoveries} emails sent` : 'Emails sent: 0',
      trendType: 'neutral' as const,
    },
    {
      label: 'Emails Sent',
      value: stats ? String(stats.total_recoveries) : '0',
      icon: Mail,
      iconBg: 'var(--green-dim, rgba(34,197,94,0.10))',
      iconColor: 'var(--green, #22C55E)',
      trend: stats?.total_recoveries ? 'Active sequences running' : 'Waiting for failures',
      trendType: (stats?.total_recoveries ? 'up' : 'neutral') as 'up' | 'down' | 'neutral',
    },
    {
      label: 'Pending Recovery',
      value: stats ? String(stats.pending_count) : '0',
      icon: Clock,
      iconBg: 'var(--accent-dim, rgba(201,74,31,0.10))',
      iconColor: '#C94A1F',
      trend: 'Awaiting next retry',
      trendType: 'neutral' as const,
    },
  ]

  const trendColor: Record<string, string> = {
    up: 'var(--green, #22C55E)',
    down: 'var(--red, #EF4444)',
    neutral: 'var(--text-3, #444)',
  }

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      style={{ padding: '0 32px', marginBottom: 24 }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl transition-all duration-200"
          style={{
            background: 'var(--surface, #111)',
            border: '1px solid var(--border, #1E1E1E)',
            padding: 20,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = 'var(--border-mid, #282828)'
            el.style.transform = 'translateY(-2px)'
            el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = 'var(--border, #1E1E1E)'
            el.style.transform = 'translateY(0)'
            el.style.boxShadow = 'none'
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
            <span style={{
              fontSize: 11, fontWeight: 500,
              color: 'var(--text-3, #444)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {card.label}
            </span>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 32, height: 32, background: card.iconBg, color: card.iconColor }}
            >
              <card.icon style={{ width: 15, height: 15 }} />
            </div>
          </div>

          <div style={{
            fontFamily: 'var(--font-jetbrains-mono), "Courier New", monospace',
            fontSize: 30, fontWeight: 500,
            color: 'var(--text-1, #F2F2F2)',
            letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 10,
          }}>
            {card.value}
          </div>

          <div className="flex items-center gap-1" style={{ fontSize: 12, color: trendColor[card.trendType] }}>
            {card.trendType === 'up' && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
              </svg>
            )}
            {card.trendType === 'down' && <span style={{ fontSize: 11 }}>↓</span>}
            <span>{card.trend}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
