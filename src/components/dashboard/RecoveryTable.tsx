import { format } from 'date-fns'

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

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  recovered:  { label: 'Recovered',   bg: 'var(--green-dim)',  color: 'var(--green)',  border: 'var(--green-border)' },
  email_sent: { label: 'In Progress', bg: 'var(--blue-dim)',   color: 'var(--blue)',   border: 'var(--blue-border)' },
  pending:    { label: 'Pending',     bg: 'var(--accent-dim)', color: '#C94A1F',       border: 'var(--accent-border)' },
  failed:     { label: 'Failed',      bg: 'var(--red-dim)',    color: 'var(--red)',    border: 'var(--red-border)' },
}

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
}

export function RecoveryTable({ recoveries }: { recoveries: Recovery[] }) {
  if (recoveries.length === 0) {
    return (
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--surface, #111)',
          border: '1px solid var(--border, #1E1E1E)',
          margin: '0 32px 24px',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ opacity: 0.2, color: 'var(--text-1, #F2F2F2)', marginBottom: 12, display: 'block', margin: '0 auto 12px' }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-3, #444)', marginBottom: 6 }}>No failed payments detected yet</p>
        <p style={{ fontSize: 13, color: 'var(--text-3, #444)', maxWidth: 320, margin: '0 auto' }}>
          When a payment fails on your Stripe account, we&apos;ll handle it automatically and show results here.
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--surface, #111)',
        border: '1px solid var(--border, #1E1E1E)',
        margin: '0 32px 24px',
      }}
    >
      {/* Section header */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '18px 24px', borderBottom: '1px solid var(--border, #1E1E1E)' }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1, #F2F2F2)' }}>Recovery Jobs</span>
        <span style={{
          fontSize: 12, color: 'var(--text-3, #444)',
          background: 'var(--surface-2, #161616)',
          border: '1px solid var(--border-mid, #282828)',
          borderRadius: 100, padding: '2px 10px',
        }}>
          {recoveries.length} job{recoveries.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg, #080808)', borderBottom: '1px solid var(--border, #1E1E1E)' }}>
              {['Customer', 'Amount', 'Status', 'Last Action', 'Date', ''].map((h) => (
                <th key={h} style={{
                  padding: '10px 24px', textAlign: 'left',
                  fontSize: 11, fontWeight: 600,
                  color: 'var(--text-3, #444)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recoveries.map((r, idx) => {
              const s = statusConfig[r.status] ?? statusConfig.pending
              return (
                <tr
                  key={r.id}
                  style={{ borderBottom: idx < recoveries.length - 1 ? '1px solid var(--border, #1E1E1E)' : 'none' }}
                  onMouseEnter={(e) => {
                    Array.from(e.currentTarget.querySelectorAll('td')).forEach(
                      (td) => ((td as HTMLElement).style.background = 'var(--surface-2, #161616)')
                    )
                    const btn = e.currentTarget.querySelector('.row-action-btn') as HTMLElement | null
                    if (btn) btn.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    Array.from(e.currentTarget.querySelectorAll('td')).forEach(
                      (td) => ((td as HTMLElement).style.background = 'transparent')
                    )
                    const btn = e.currentTarget.querySelector('.row-action-btn') as HTMLElement | null
                    if (btn) btn.style.opacity = '0'
                  }}
                >
                  <td style={{ padding: '14px 24px', verticalAlign: 'middle' }}>
                    <p style={{
                      fontFamily: 'var(--font-jetbrains-mono), monospace',
                      fontSize: 12, color: 'var(--text-1, #F2F2F2)', margin: 0,
                    }}>
                      {r.customer_name || r.customer_email}
                    </p>
                    {r.customer_name && (
                      <p style={{ fontSize: 11, color: 'var(--text-3, #555)', margin: '2px 0 0' }}>{r.customer_email}</p>
                    )}
                  </td>
                  <td style={{ padding: '14px 24px', verticalAlign: 'middle' }}>
                    <span style={{
                      fontFamily: 'var(--font-jetbrains-mono), monospace',
                      fontSize: 14, fontWeight: 500, color: 'var(--text-1, #F2F2F2)',
                    }}>
                      {formatAmount(r.amount, r.currency)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px', verticalAlign: 'middle' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 100,
                      fontSize: 11, fontWeight: 500,
                      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                    }}>
                      {s.label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 12, color: 'var(--text-2, #555)', verticalAlign: 'middle' }}>
                    {r.email_step ? `Email ${r.email_step} sent` : 'Queued'}
                  </td>
                  <td style={{
                    padding: '14px 24px', verticalAlign: 'middle',
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    fontSize: 12, color: 'var(--text-3, #444)',
                  }}>
                    {format(new Date(r.created_at), 'MMM d, yyyy')}
                  </td>
                  <td style={{ padding: '14px 16px 14px 0', width: 40, textAlign: 'right', verticalAlign: 'middle' }}>
                    <button
                      className="row-action-btn"
                      style={{
                        opacity: 0,
                        background: 'var(--surface-2, #161616)',
                        border: '1px solid var(--border-mid, #282828)',
                        borderRadius: 6, color: 'var(--text-2, #888)',
                        padding: '3px 8px', fontSize: 14,
                        cursor: 'pointer', transition: 'opacity 0.15s',
                      }}
                    >
                      ···
                    </button>
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
