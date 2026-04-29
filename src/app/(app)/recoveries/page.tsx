'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, X, SkipForward } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusFilter = 'all' | 'pending' | 'email_sent' | 'recovered' | 'failed' | 'cancelled' | 'skipped'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'email_sent', label: 'In Progress' },
  { value: 'recovered', label: 'Recovered' },
  { value: 'failed', label: 'Failed' },
  { value: 'skipped', label: 'Skipped' },
]

const statusMap: Record<string, { label: string; variant: 'recovered' | 'in-progress' | 'failed' | 'pending' | 'skipped' }> = {
  recovered: { label: 'Recovered', variant: 'recovered' },
  email_sent: { label: 'In Progress', variant: 'in-progress' },
  pending: { label: 'Pending', variant: 'pending' },
  failed: { label: 'Failed', variant: 'failed' },
  cancelled: { label: 'Cancelled', variant: 'failed' },
  skipped: { label: 'Skipped', variant: 'skipped' },
}

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
}

interface Recovery {
  id: string
  customer_email: string
  customer_name: string | null
  amount: number
  currency: string
  status: string
  email_step: number | null
  failure_reason: string | null
  created_at: string
  recovered_at: string | null
  next_retry_at: string | null
}

const PAGE_SIZE = 20

export default function RecoveriesPage() {
  const [recoveries, setRecoveries] = useState<Recovery[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Recovery | null>(null)
  const [skippingId, setSkippingId] = useState<string | null>(null)
  const [skipConfirmId, setSkipConfirmId] = useState<string | null>(null)

  const loadRecoveries = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase
      .from('recoveries')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, count } = await query
    setRecoveries(data ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [page, statusFilter])

  useEffect(() => {
    loadRecoveries()
  }, [loadRecoveries])

  // Reset page when filter changes
  useEffect(() => {
    setPage(0)
  }, [statusFilter])

  const handleSkip = async (id: string) => {
    setSkippingId(id)
    const res = await fetch('/api/recovery/skip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recoveryId: id }),
    })
    if (res.ok) {
      setRecoveries(prev => prev.map(r => r.id === id ? { ...r, status: 'skipped', next_retry_at: null } : r))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'skipped', next_retry_at: null } : null)
      trackEvent('recovery_skipped')
    }
    setSkippingId(null)
    setSkipConfirmId(null)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Recoveries</h1>
        <p className="text-sm text-muted mt-1">All recovery jobs across your Stripe account.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-150',
              statusFilter === opt.value
                ? 'bg-ink text-white'
                : 'bg-white border border-border text-muted hover:text-ink'
            )}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted">{total} total</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-cream rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recoveries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-medium text-ink mb-1">No recoveries found</p>
            <p className="text-sm text-muted">Try changing the filter above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-cream">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Customer</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Amount</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Status</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5 hidden md:table-cell">Step</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5 hidden lg:table-cell">Created</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5 hidden lg:table-cell">Recovered at</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recoveries.map((r) => {
                  const status = statusMap[r.status] ?? { label: r.status, variant: 'pending' as const }
                  return (
                    <tr
                      key={r.id}
                      onClick={() => { setSelected(r); trackEvent('recovery_viewed') }}
                      className="hover:bg-cream/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-ink">{r.customer_name || r.customer_email || '—'}</p>
                        {r.customer_name && r.customer_email && (
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
                          {r.email_step ? `${r.email_step} of 4` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-sm text-muted">
                          {format(new Date(r.created_at), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-sm text-muted">
                          {r.recovered_at ? format(new Date(r.recovered_at), 'MMM d, yyyy') : '—'}
                        </span>
                      </td>
                      <td className="px-2 py-3.5" onClick={e => e.stopPropagation()}>
                        {['pending', 'email_sent'].includes(r.status) && (
                          skipConfirmId === r.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleSkip(r.id)}
                                disabled={skippingId === r.id}
                                className="text-xs text-red-600 font-medium hover:underline disabled:opacity-50"
                              >
                                {skippingId === r.id ? '…' : 'Skip'}
                              </button>
                              <span className="text-muted text-xs">/</span>
                              <button onClick={() => setSkipConfirmId(null)} className="text-xs text-muted hover:text-ink">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSkipConfirmId(r.id)}
                              className="p-1 text-muted hover:text-ink transition-colors"
                              title="Skip this recovery"
                            >
                              <SkipForward className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg border border-border text-muted hover:text-ink disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg border border-border text-muted hover:text-ink disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/20" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-white shadow-elevated overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-base font-semibold text-ink">Recovery details</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-muted hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Customer */}
              <div>
                <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-2">Customer</p>
                <p className="text-sm font-medium text-ink">{selected.customer_name || '—'}</p>
                <p className="text-sm text-muted">{selected.customer_email || '—'}</p>
              </div>

              {/* Amount + status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Amount</p>
                  <p className="text-lg font-bold text-ink">{formatAmount(selected.amount, selected.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Status</p>
                  <Badge variant={statusMap[selected.status]?.variant ?? 'pending'}>
                    {statusMap[selected.status]?.label ?? selected.status}
                  </Badge>
                </div>
              </div>

              {/* Email history */}
              <div>
                <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-3">Email history</p>
                <div className="space-y-2">
                  {selected.email_step && selected.email_step >= 1 ? (
                    [
                      { step: 1, label: 'Email 1', day: 'Day 0',  isRetryOnly: false },
                      { step: 2, label: 'Email 2', day: 'Day 3',  isRetryOnly: false },
                      { step: 3, label: 'Email 3', day: 'Day 7',  isRetryOnly: false },
                      { step: 4, label: 'Final retry', day: 'Day 14', isRetryOnly: true },
                    ].map(({ step, label, day, isRetryOnly }) => {
                      const done = (selected.email_step ?? 0) >= step
                      const isFinalFailed = isRetryOnly && done && selected.status === 'failed'
                      const isFinalRecovered = isRetryOnly && done && selected.status === 'recovered'
                      return (
                        <div
                          key={step}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border',
                            isFinalRecovered ? 'border-green-200 bg-green-50'
                            : isFinalFailed  ? 'border-red-200 bg-red-50'
                            : done && !isRetryOnly ? 'border-green-200 bg-green-50'
                            : done && isRetryOnly  ? 'border-amber-200 bg-amber-50'
                            : 'border-border bg-cream/50'
                          )}
                        >
                          <div className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
                            isFinalRecovered ? 'bg-green-500 text-white'
                            : isFinalFailed  ? 'bg-red-500 text-white'
                            : done && !isRetryOnly ? 'bg-green-500 text-white'
                            : done && isRetryOnly  ? 'bg-amber-500 text-white'
                            : 'bg-border text-muted'
                          )}>
                            {done ? '✓' : step}
                          </div>
                          <div>
                            <p className={cn('text-sm font-medium', done ? 'text-ink' : 'text-muted')}>
                              {label} — {day}
                            </p>
                            <p className="text-xs text-muted">
                              {!done ? 'Pending'
                               : isFinalRecovered ? 'Recovered'
                               : isFinalFailed    ? 'Failed'
                               : isRetryOnly      ? 'Retried'
                               : 'Sent'}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-muted">No emails sent yet.</p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Created</p>
                  <p className="text-ink">{format(new Date(selected.created_at), 'MMM d, yyyy HH:mm')}</p>
                </div>
                {selected.recovered_at && (
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Recovered</p>
                    <p className="text-green-700">{format(new Date(selected.recovered_at), 'MMM d, yyyy HH:mm')}</p>
                  </div>
                )}
                {selected.next_retry_at && selected.status === 'email_sent' && (
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Next retry</p>
                    <p className="text-ink">{format(new Date(selected.next_retry_at), 'MMM d, yyyy')}</p>
                  </div>
                )}
              </div>

              {/* Failure reason */}
              {selected.failure_reason && (
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Failure reason</p>
                  <p className="text-sm text-red-600 font-mono bg-red-50 px-3 py-2 rounded-lg">
                    {selected.failure_reason}
                  </p>
                </div>
              )}

              {/* Skip action */}
              {['pending', 'email_sent'].includes(selected.status) && (
                <div className="border-t border-border pt-4">
                  {skipConfirmId === selected.id ? (
                    <div className="space-y-2">
                      <p className="text-sm text-ink font-medium">Skip this recovery?</p>
                      <p className="text-xs text-muted">No more emails or retries will be sent for this customer.</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSkip(selected.id)}
                          disabled={skippingId === selected.id}
                          className="flex-1 text-sm font-medium text-white bg-ink hover:bg-ink/90 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {skippingId === selected.id ? 'Skipping…' : 'Skip recovery'}
                        </button>
                        <button
                          onClick={() => setSkipConfirmId(null)}
                          className="flex-1 text-sm font-medium text-ink border border-border px-3 py-2 rounded-lg hover:bg-cream transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSkipConfirmId(selected.id)}
                      className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
                    >
                      <SkipForward className="w-4 h-4" />
                      Skip this recovery
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
