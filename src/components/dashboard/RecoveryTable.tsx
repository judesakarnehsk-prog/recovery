import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

interface Recovery {
  id: string
  customer_email: string
  customer_name: string | null
  amount: number
  currency: string
  status: string
  email_step: number | null
  created_at: string
  recovered_at: string | null
  next_retry_at: string | null
}

const statusMap: Record<string, { label: string; variant: 'recovered' | 'in-progress' | 'failed' | 'pending' }> = {
  recovered: { label: 'Recovered', variant: 'recovered' },
  email_sent: { label: 'In Progress', variant: 'in-progress' },
  pending: { label: 'Pending', variant: 'pending' },
  failed: { label: 'Failed', variant: 'failed' },
}

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
}

export function RecoveryTable({ recoveries }: { recoveries: Recovery[] }) {
  if (recoveries.length === 0) {
    return (
      <div className="bg-white border border-border rounded-2xl p-12 text-center">
        <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <p className="text-base font-medium text-ink mb-1">No failed payments detected yet</p>
        <p className="text-sm text-muted max-w-sm mx-auto">
          That's a good sign! When a payment fails on your Stripe account, we'll handle it automatically and show results here.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-cream">
              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Customer</th>
              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Amount</th>
              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Status</th>
              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5 hidden md:table-cell">Last Action</th>
              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5 hidden lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recoveries.map((r) => {
              const status = statusMap[r.status] ?? { label: r.status, variant: 'pending' as const }
              return (
                <tr key={r.id} className="hover:bg-cream/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-ink">{r.customer_name || r.customer_email}</p>
                    {r.customer_name && (
                      <p className="text-xs text-muted">{r.customer_email}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-ink">
                      {formatAmount(r.amount, r.currency)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-muted">
                      {r.email_step ? `Email ${r.email_step} sent` : 'Queued'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-sm text-muted">
                      {format(new Date(r.created_at), 'MMM d, yyyy')}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
