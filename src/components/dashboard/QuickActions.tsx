import Link from 'next/link'

const IconEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
)

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const actions = [
  {
    Icon: IconEdit,
    title: 'Customize emails',
    desc: 'Add your brand name and tone',
    href: '/settings/email-branding',
    type: 'link' as const,
  },
  {
    Icon: IconEye,
    title: 'View all recoveries',
    desc: 'See the full recovery timeline',
    href: '/recoveries',
    type: 'link' as const,
  },
  {
    Icon: IconCheck,
    title: 'Stripe connection',
    desc: 'Connected · OAuth active',
    href: '/connect',
    type: 'status' as const,
  },
]

export function QuickActions() {
  return (
    <div style={{ margin: '0 32px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {actions.map((action) => (
        <div
          key={action.title}
          className="flex items-center gap-3.5 rounded-xl transition-all duration-150"
          style={{ background: 'var(--surface, #111)', border: '1px solid var(--border, #1F1F1F)', padding: '14px 18px' }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = 'var(--border-mid, #282828)'
            el.style.background = 'var(--surface-2, #161616)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = 'var(--border, #1F1F1F)'
            el.style.background = 'var(--surface, #111)'
          }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0 rounded-lg"
            style={{ width: 36, height: 36, background: 'var(--surface-3, #1C1C1C)', color: 'var(--text-2, #888)' }}
          >
            <action.Icon />
          </div>
          <div className="flex-1">
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1, #F2F2F2)', margin: '0 0 2px' }}>{action.title}</p>
            <p style={{ fontSize: 12, color: 'var(--text-3, #444)', margin: 0 }}>{action.desc}</p>
          </div>
          {action.type === 'status' ? (
            <span style={{
              fontSize: 12, fontWeight: 500, color: 'var(--green, #22C55E)',
              background: 'var(--green-dim, rgba(34,197,94,0.10))',
              border: '1px solid var(--green-border, rgba(34,197,94,0.20))',
              borderRadius: 100, padding: '3px 10px', flexShrink: 0,
            }}>
              Active
            </span>
          ) : (
            <Link
              href={action.href}
              style={{ color: 'var(--text-3, #444)', fontSize: 16, textDecoration: 'none', flexShrink: 0, transition: 'color 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#C94A1F' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3, #444)' }}
            >
              →
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
