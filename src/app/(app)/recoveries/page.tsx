'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, X, SkipForward } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'

type StatusFilter = 'all' | 'pending' | 'email_sent' | 'recovered' | 'failed' | 'cancelled' | 'skipped'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'email_sent',label: 'In Progress' },
  { value: 'recovered', label: 'Recovered' },
  { value: 'failed',    label: 'Failed' },
  { value: 'skipped',   label: 'Skipped' },
]

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  recovered:  { label: 'Recovered',   bg: 'var(--green-dim)',  color: 'var(--green)',  border: 'var(--green-border)' },
  email_sent: { label: 'In Progress', bg: 'var(--blue-dim)',   color: 'var(--blue)',   border: 'var(--blue-border)' },
  pending:    { label: 'Pending',     bg: 'var(--amber-dim)',  color: 'var(--amber)',  border: 'rgba(245,158,11,0.20)' },
  failed:     { label: 'Failed',      bg: 'var(--red-dim)',    color: 'var(--red)',    border: 'var(--red-border)' },
  cancelled:  { label: 'Cancelled',   bg: 'var(--red-dim)',    color: 'var(--red)',    border: 'var(--red-border)' },
  skipped:    { label: 'Skipped',     bg: 'var(--surface-3)',  color: 'var(--text-2)', border: 'var(--border)' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.skipped
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 100,
      fontSize: 11, fontWeight: 500,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  )
}

function StepDots({ step, max = 4 }: { step: number; max?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: max }, (_, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: i < step ? '#C94A1F' : 'var(--border-mid, #282828)',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{step} of {max}</span>
    </div>
  )
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

interface EmailLog {
  id: string
  recovery_id: string
  user_id: string
  to_email: string
  subject: string
  body_html?: string | null
  step: number
  resend_id: string
  status: string
  sent_at: string
  noLog?: boolean
}

const PAGE_SIZE = 20

const EMAIL_STEPS = [
  { step: 1, label: 'Email 1',     day: 'Day 0',  isRetryOnly: false },
  { step: 2, label: 'Email 2',     day: 'Day 3',  isRetryOnly: false },
  { step: 3, label: 'Email 3',     day: 'Day 7',  isRetryOnly: false },
  { step: 4, label: 'Final retry', day: 'Day 14', isRetryOnly: true },
]

export default function RecoveriesPage() {
  const [recoveries, setRecoveries] = useState<Recovery[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Recovery | null>(null)
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [emailLogsLoading, setEmailLogsLoading] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null)
  const [copiedResendId, setCopiedResendId] = useState(false)
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

  useEffect(() => { loadRecoveries() }, [loadRecoveries])
  useEffect(() => { setPage(0) }, [statusFilter])

  // Fetch email logs when detail panel opens
  useEffect(() => {
    if (!selected) { setEmailLogs([]); return }
    setEmailLogsLoading(true)
    const supabase = createClient()
    supabase
      .from('email_log')
      .select('*')
      .eq('recovery_id', selected.id)
      .order('step', { ascending: true })
      .then(({ data }) => {
        setEmailLogs(data ?? [])
        setEmailLogsLoading(false)
      })
  }, [selected])

  // Close email modal on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedEmail(null)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

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

  const labelFor = (opt: StatusFilter) => STATUS_OPTIONS.find(o => o.value === opt)?.label ?? opt

  return (
    <div style={{ padding: '32px 32px 40px', maxWidth: 1100 }}>
      {/* Heading */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: 'var(--font-sora), system-ui, sans-serif',
          fontSize: 22, fontWeight: 700,
          color: 'var(--text-1)', marginBottom: 4,
        }}>
          Recoveries
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
          All recovery jobs across your Stripe account.
        </p>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_OPTIONS.map((opt) => {
          const active = statusFilter === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              style={{
                padding: '5px 14px',
                borderRadius: 100,
                fontSize: 12, fontWeight: 500,
                border: active ? '1px solid #C94A1F' : '1px solid var(--border-mid, #282828)',
                background: active ? '#C94A1F' : 'transparent',
                color: active ? '#fff' : 'var(--text-2)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = 'var(--border-bright, #333)'
                  e.currentTarget.style.color = 'var(--text-1)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = 'var(--border-mid, #282828)'
                  e.currentTarget.style.color = 'var(--text-2)'
                }
              }}
            >
              {opt.label}
            </button>
          )
        })}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>
          {total} total
        </span>
      </div>

      {/* Table card */}
      <div style={{
        background: 'var(--surface, #111)',
        border: '1px solid var(--border, #1E1E1E)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 44, background: 'var(--surface-3)', borderRadius: 8, opacity: 0.6 }} />
            ))}
          </div>
        ) : recoveries.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-3)', margin: '0 0 6px' }}>
              {statusFilter === 'all'
                ? 'No recoveries yet'
                : `No ${labelFor(statusFilter).toLowerCase()} recoveries found`}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
              {statusFilter === 'all'
                ? 'When a payment fails on your Stripe account, it will appear here.'
                : 'Try a different filter above.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg, #080808)', borderBottom: '1px solid var(--border, #1E1E1E)' }}>
                  {['Customer', 'Amount', 'Status', 'Step', 'Created', 'Recovered at', ''].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: '10px 20px',
                        textAlign: 'left',
                        fontSize: 11, fontWeight: 600,
                        color: 'var(--text-3)',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                        ...(i === 3 ? { display: 'none' } : {}),
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recoveries.map((r, idx) => (
                  <tr
                    key={r.id}
                    onClick={() => { setSelected(r); trackEvent('recovery_viewed') }}
                    style={{
                      borderBottom: idx < recoveries.length - 1 ? '1px solid var(--border, #1E1E1E)' : 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      Array.from(e.currentTarget.querySelectorAll('td')).forEach(
                        (td) => ((td as HTMLElement).style.background = 'var(--surface-2, #161616)')
                      )
                    }}
                    onMouseLeave={(e) => {
                      Array.from(e.currentTarget.querySelectorAll('td')).forEach(
                        (td) => ((td as HTMLElement).style.background = 'transparent')
                      )
                    }}
                  >
                    {/* Customer */}
                    <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                      {r.customer_name || r.customer_email ? (
                        <>
                          <p style={{
                            fontFamily: 'var(--font-jetbrains-mono), monospace',
                            fontSize: 12, color: 'var(--text-1)', margin: 0,
                          }}>
                            {r.customer_name || r.customer_email}
                          </p>
                          {r.customer_name && r.customer_email && (
                            <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '2px 0 0' }}>
                              {r.customer_email}
                            </p>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>
                          Unknown customer
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                      <span style={{
                        fontFamily: 'var(--font-jetbrains-mono), monospace',
                        fontSize: 14, fontWeight: 500, color: 'var(--text-1)',
                      }}>
                        {formatAmount(r.amount, r.currency)}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                      <StatusBadge status={r.status} />
                    </td>

                    {/* Step */}
                    <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                      {r.email_step ? (
                        <StepDots step={r.email_step} />
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>—</span>
                      )}
                    </td>

                    {/* Created */}
                    <td style={{
                      padding: '14px 20px', verticalAlign: 'middle',
                      fontFamily: 'var(--font-jetbrains-mono), monospace',
                      fontSize: 12, color: 'var(--text-3)',
                    }}>
                      {format(new Date(r.created_at), 'MMM d, yyyy')}
                    </td>

                    {/* Recovered at */}
                    <td style={{
                      padding: '14px 20px', verticalAlign: 'middle',
                      fontFamily: 'var(--font-jetbrains-mono), monospace',
                      fontSize: 12, color: 'var(--text-3)',
                    }}>
                      {r.recovered_at ? format(new Date(r.recovered_at), 'MMM d, yyyy') : '—'}
                    </td>

                    {/* Skip action */}
                    <td style={{ padding: '14px 12px 14px 0', width: 40, verticalAlign: 'middle' }} onClick={(e) => e.stopPropagation()}>
                      {['pending', 'email_sent'].includes(r.status) && (
                        skipConfirmId === r.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <button
                              onClick={() => handleSkip(r.id)}
                              disabled={skippingId === r.id}
                              style={{
                                fontSize: 11, fontWeight: 500, color: 'var(--red)',
                                background: 'none', border: 'none', cursor: 'pointer',
                                opacity: skippingId === r.id ? 0.5 : 1,
                              }}
                            >
                              {skippingId === r.id ? '…' : 'Skip'}
                            </button>
                            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>/</span>
                            <button
                              onClick={() => setSkipConfirmId(null)}
                              style={{ fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSkipConfirmId(r.id)}
                            title="Skip this recovery"
                            style={{
                              padding: 4, color: 'var(--text-3)', background: 'none',
                              border: 'none', cursor: 'pointer', opacity: 0,
                              transition: 'opacity 0.15s, color 0.15s',
                            }}
                            className="row-skip-btn"
                          >
                            <SkipForward style={{ width: 14, height: 14 }} />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Page {page + 1} of {totalPages}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                padding: '6px 10px',
                background: 'transparent',
                border: '1px solid var(--border-mid)',
                borderRadius: 8,
                color: 'var(--text-2)',
                cursor: page === 0 ? 'not-allowed' : 'pointer',
                opacity: page === 0 ? 0.4 : 1,
              }}
            >
              <ChevronLeft style={{ width: 14, height: 14 }} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                padding: '6px 10px',
                background: 'transparent',
                border: '1px solid var(--border-mid)',
                borderRadius: 8,
                color: 'var(--text-2)',
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                opacity: page >= totalPages - 1 ? 0.4 : 1,
              }}
            >
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        .row-skip-btn { opacity: 0 !important; }
        tr:hover .row-skip-btn { opacity: 1 !important; }
      `}</style>

      {/* Email detail modal */}
      {selectedEmail && (
        <div
          onClick={() => setSelectedEmail(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-mid)',
              borderRadius: 14,
              width: 520,
              maxWidth: 'calc(100vw - 48px)',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              animation: 'slideUp 0.2s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 20px',
              borderBottom: '1px solid var(--border)',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-sora), system-ui, sans-serif',
                fontSize: 15, fontWeight: 600, color: 'var(--text-1)', margin: 0,
              }}>
                Email details
              </h3>
              <button
                onClick={() => setSelectedEmail(null)}
                style={{
                  width: 28, height: 28,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-2)', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text-1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-2)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Step — always shown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Step</p>
                <p style={{ fontSize: 14, color: 'var(--text-1)', margin: 0 }}>
                  {EMAIL_STEPS.find((s) => s.step === selectedEmail.step)
                    ? `${EMAIL_STEPS.find((s) => s.step === selectedEmail.step)!.label} — ${EMAIL_STEPS.find((s) => s.step === selectedEmail.step)!.day}`
                    : `Email ${selectedEmail.step}`}
                </p>
              </div>

              {selectedEmail.noLog ? (
                /* No log found state */
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-3)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>
                    No log found for this email
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5, margin: 0 }}>
                    This email may not have been sent, or was sent before logging was enabled.
                  </p>
                </div>
              ) : (
                <>
                  {/* To */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>To</p>
                    <p style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 13, color: 'var(--text-1)', margin: 0 }}>
                      {selectedEmail.to_email}
                    </p>
                  </div>

                  {/* Subject */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Subject</p>
                    <p style={{
                      fontFamily: 'inherit', fontSize: 14, color: 'var(--text-1)',
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '10px 14px', fontStyle: 'italic', margin: 0,
                    }}>
                      "{selectedEmail.subject}"
                    </p>
                  </div>

                  {/* Status + Sent At */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Status</p>
                      {(() => {
                        const cfg = statusConfig[selectedEmail.status] ?? {
                          label: selectedEmail.status,
                          bg: 'var(--surface-3)', color: 'var(--text-2)', border: 'var(--border)',
                        }
                        return (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '3px 10px', borderRadius: 100,
                            fontSize: 11, fontWeight: 500,
                            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                            alignSelf: 'flex-start',
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />
                            {selectedEmail.status === 'email_sent' ? 'Sent'
                              : selectedEmail.status === 'failed' ? 'Failed'
                              : selectedEmail.status}
                          </span>
                        )
                      })()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Sent at</p>
                      <p style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 13, color: 'var(--text-1)', margin: 0 }}>
                        {format(new Date(selectedEmail.sent_at), 'MMM d, yyyy')}<br />
                        <span style={{ color: 'var(--text-3)' }}>{format(new Date(selectedEmail.sent_at), 'hh:mm a')}</span>
                      </p>
                    </div>
                  </div>

                  {/* Email ID */}
                  {selectedEmail.resend_id && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                        Email ID
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 12, color: 'var(--text-3)' }}>
                          {selectedEmail.resend_id.length > 22
                            ? selectedEmail.resend_id.slice(0, 22) + '…'
                            : selectedEmail.resend_id}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedEmail.resend_id)
                            setCopiedResendId(true)
                            setTimeout(() => setCopiedResendId(false), 1500)
                          }}
                          title="Copy email ID"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', fontSize: 11, fontWeight: 500,
                            background: copiedResendId ? 'var(--green-dim)' : 'var(--surface-2)',
                            color: copiedResendId ? 'var(--green)' : 'var(--text-2)',
                            border: `1px solid ${copiedResendId ? 'var(--green-border)' : 'var(--border)'}`,
                            borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
                          }}
                        >
                          {copiedResendId ? (
                            <>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                              </svg>
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Email preview section — only shown when we have real email content */}
            {!selectedEmail.noLog && (
              <div style={{ margin: '0 20px 20px' }}>
                <p style={{
                  fontSize: 10, fontWeight: 600, color: 'var(--text-3)',
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8,
                }}>
                  Email Preview
                </p>
                {selectedEmail.body_html ? (
                  <div style={{
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: 'white',
                  }}>
                    <iframe
                      srcDoc={selectedEmail.body_html}
                      style={{ width: '100%', height: 420, border: 'none', display: 'block' }}
                      title="Email preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: 20,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                  }}>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500, marginBottom: 4 }}>
                      Preview not available
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>
                      This email was sent before body logging was enabled. New emails will show a full preview here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div
            style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSelected(null)}
          />
          <div style={{
            width: '100%', maxWidth: 420,
            background: 'var(--surface, #111)',
            borderLeft: '1px solid var(--border, #1E1E1E)',
            overflowY: 'auto',
          }}>
            {/* Panel header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 20px',
              borderBottom: '1px solid var(--border)',
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>Recovery details</h2>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)' }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Customer */}
              <div>
                <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>Customer</p>
                {selected.customer_name || selected.customer_email ? (
                  <>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', margin: '0 0 2px' }}>
                      {selected.customer_name || selected.customer_email}
                    </p>
                    {selected.customer_name && selected.customer_email && (
                      <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>{selected.customer_email}</p>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--text-3)', fontStyle: 'italic', margin: 0 }}>Unknown customer</p>
                )}
              </div>

              {/* Amount + status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 6 }}>Amount</p>
                  <p style={{
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    fontSize: 20, fontWeight: 500, color: 'var(--text-1)', margin: 0,
                  }}>
                    {formatAmount(selected.amount, selected.currency)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 6 }}>Status</p>
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              {/* Recovery Sequence */}
              <div>
                <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 10 }}>Recovery Sequence</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { day: 0,  stepNum: 1, dayLabel: 'Day 0',  stripeAction: 'Payment failed — recovery started', emailAction: 'Email 1 sent', hasEmail: true,  hasRetry: false },
                    { day: 3,  stepNum: 2, dayLabel: 'Day 3',  stripeAction: 'Stripe charge attempted',           emailAction: 'Email 2 sent', hasEmail: true,  hasRetry: true  },
                    { day: 7,  stepNum: 3, dayLabel: 'Day 7',  stripeAction: 'Stripe charge attempted',           emailAction: 'Email 3 sent', hasEmail: true,  hasRetry: true  },
                    { day: 14, stepNum: 4, dayLabel: 'Day 14', stripeAction: 'Final Stripe charge attempt',       emailAction: 'No email — silent retry', hasEmail: false, hasRetry: true },
                  ].map((seqStep) => {
                    const currentEmailStep = selected.email_step ?? 0
                    const isComplete = currentEmailStep >= seqStep.stepNum
                    const isPending  = currentEmailStep < seqStep.stepNum
                    const emailLog   = emailLogs.find((l) => l.step === seqStep.stepNum)

                    const stripeStatusColor = isComplete ? 'var(--green)' : 'var(--text-3)'
                    const stripeStatusLabel = isPending ? '—' : 'Done'

                    return (
                      <div key={seqStep.day} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        {/* Day badge */}
                        <div style={{
                          fontFamily: 'var(--font-jetbrains-mono), monospace',
                          fontSize: 10, fontWeight: 500,
                          color: isComplete ? 'var(--accent)' : 'var(--text-3)',
                          background: isComplete ? 'var(--accent-dim)' : 'var(--surface-3)',
                          border: `1px solid ${isComplete ? 'var(--accent-border)' : 'var(--border)'}`,
                          borderRadius: 5, padding: '3px 7px',
                          whiteSpace: 'nowrap', flexShrink: 0, marginTop: 2,
                          transition: 'all 0.15s',
                        }}>
                          {seqStep.dayLabel}
                        </div>

                        {/* Action rows */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {/* Stripe row */}
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '6px 10px', borderRadius: 7,
                            background: 'var(--surface-2)', border: '1px solid var(--border)',
                          }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                              background: 'rgba(99,91,255,0.12)', color: '#635BFF',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="4" width="22" height="16" rx="2"/>
                                <line x1="1" y1="10" x2="23" y2="10"/>
                              </svg>
                            </div>
                            <span style={{ flex: 1, fontSize: 12, color: 'var(--text-2)' }}>{seqStep.stripeAction}</span>
                            <span style={{ fontSize: 11, color: stripeStatusColor, flexShrink: 0 }}>{stripeStatusLabel}</span>
                          </div>

                          {/* Email row — only for steps with an email */}
                          {seqStep.hasEmail && (
                            <div
                              onClick={() => {
                                if (!isComplete || emailLogsLoading) return
                                setSelectedEmail(emailLog ?? {
                                  id: '', recovery_id: selected.id, user_id: '', to_email: '',
                                  subject: '', step: seqStep.stepNum, resend_id: '', status: '', sent_at: '', noLog: true,
                                })
                              }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '6px 10px', borderRadius: 7,
                                background: 'var(--surface-2)', border: '1px solid var(--border)',
                                cursor: isComplete && !emailLogsLoading ? 'pointer' : 'default',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => {
                                if (isComplete && !emailLogsLoading) {
                                  e.currentTarget.style.borderColor = 'var(--accent-border)'
                                  e.currentTarget.style.background = 'var(--accent-dim)'
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border)'
                                e.currentTarget.style.background = 'var(--surface-2)'
                              }}
                            >
                              <div style={{
                                width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                                background: isComplete ? 'var(--accent-dim)' : 'var(--surface-3)',
                                color: isComplete ? 'var(--accent)' : 'var(--text-3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                  <polyline points="22,6 12,13 2,6"/>
                                </svg>
                              </div>
                              <span style={{ flex: 1, fontSize: 12, color: isPending ? 'var(--text-3)' : 'var(--text-2)' }}>
                                {seqStep.emailAction}
                              </span>
                              {emailLogsLoading && isComplete ? (
                                <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0, opacity: 0.5 }}>…</span>
                              ) : isComplete ? (
                                <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500, flexShrink: 0 }}>View →</span>
                              ) : (
                                <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>—</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 4 }}>Created</p>
                  <p style={{ color: 'var(--text-1)', margin: 0 }}>{format(new Date(selected.created_at), 'MMM d, yyyy HH:mm')}</p>
                </div>
                {selected.recovered_at && (
                  <div>
                    <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 4 }}>Recovered</p>
                    <p style={{ color: 'var(--green)', margin: 0 }}>{format(new Date(selected.recovered_at), 'MMM d, yyyy HH:mm')}</p>
                  </div>
                )}
                {selected.next_retry_at && selected.status === 'email_sent' && (
                  <div>
                    <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 4 }}>Next retry</p>
                    <p style={{ color: 'var(--text-1)', margin: 0 }}>{format(new Date(selected.next_retry_at), 'MMM d, yyyy')}</p>
                  </div>
                )}
              </div>

              {/* Failure reason */}
              {selected.failure_reason && (
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 6 }}>Failure reason</p>
                  <p style={{
                    fontSize: 12, color: 'var(--red)',
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    background: 'var(--red-dim)', border: '1px solid var(--red-border)',
                    borderRadius: 6, padding: '8px 12px', margin: 0,
                  }}>
                    {selected.failure_reason}
                  </p>
                </div>
              )}

              {/* Skip action */}
              {['pending', 'email_sent'].includes(selected.status) && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  {skipConfirmId === selected.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', margin: 0 }}>Skip this recovery?</p>
                      <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>No more emails or retries will be sent for this customer.</p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button
                          onClick={() => handleSkip(selected.id)}
                          disabled={skippingId === selected.id}
                          style={{
                            flex: 1, fontSize: 13, fontWeight: 500, color: '#fff',
                            background: '#C94A1F', border: 'none', borderRadius: 8,
                            padding: '9px 12px', cursor: skippingId === selected.id ? 'wait' : 'pointer',
                            opacity: skippingId === selected.id ? 0.6 : 1, transition: 'opacity 0.15s',
                          }}
                        >
                          {skippingId === selected.id ? 'Skipping…' : 'Skip recovery'}
                        </button>
                        <button
                          onClick={() => setSkipConfirmId(null)}
                          style={{
                            flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-1)',
                            background: 'transparent', border: '1px solid var(--border-mid)',
                            borderRadius: 8, padding: '9px 12px', cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSkipConfirmId(selected.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        fontSize: 13, color: 'var(--text-3)',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-1)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)' }}
                    >
                      <SkipForward style={{ width: 14, height: 14 }} />
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
