import { DollarSign, TrendingUp, Mail, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      accent: true,
    },
    {
      label: 'Recovery Rate',
      value: stats ? `${Math.round(stats.recovery_rate)}%` : '0%',
      icon: TrendingUp,
      accent: false,
    },
    {
      label: 'Emails Sent',
      value: stats ? String(stats.total_recoveries) : '0',
      icon: Mail,
      accent: false,
    },
    {
      label: 'Pending Recovery',
      value: stats ? String(stats.pending_count) : '0',
      icon: Clock,
      accent: false,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted font-medium">{card.label}</p>
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', card.accent ? 'bg-accent-light' : 'bg-cream')}>
              <card.icon className={cn('w-4 h-4', card.accent ? 'text-accent' : 'text-muted')} />
            </div>
          </div>
          <p className={cn('text-2xl font-bold', card.accent ? 'text-accent' : 'text-ink')}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}
