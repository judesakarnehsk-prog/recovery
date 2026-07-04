'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useSetupStatus } from '@/lib/useSetupStatus'

// Inline SVG nav icons — no lucide dependency
const IconDashboard = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const IconRecoveries = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const IconLink = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
const IconBilling = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)
const IconHelp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IconLogOut = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
interface NavItem {
  href: string
  Icon: React.ComponentType
  label: string
  needsAttention?: (status: ReturnType<typeof useSetupStatus>) => boolean
}

const navItems: NavItem[] = [
  { href: '/dashboard',               Icon: IconDashboard,   label: 'Dashboard' },
  { href: '/recoveries',              Icon: IconRecoveries,  label: 'Recoveries' },
  { href: '/connect',                 Icon: IconLink,        label: 'Stripe Connect',   needsAttention: (s) => !s.loading && !s.stripeConnected },
  { href: '/settings/email-branding', Icon: IconMail,        label: 'Email Branding',   needsAttention: (s) => !s.loading && !s.brandingConfigured },
  { href: '/settings',                Icon: IconSettings,    label: 'Settings',         needsAttention: (s) => !s.loading && (!s.businessNameSet || !s.businessTypeSet || !s.replyToSet) },
  { href: '/billing',                 Icon: IconBilling,     label: 'Billing' },
]

interface SidebarProps {
  userEmail?: string
  avatarUrl?: string
}

export function Sidebar({ userEmail, avatarUrl }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const setupStatus = useSetupStatus()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'RV'

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: 220,
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 100,
        background: 'var(--surface, #111111)',
        borderRight: '1px solid var(--border, #1E1E1E)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-5 py-5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border, #1E1E1E)' }}
      >
        <span style={{ color: '#C94A1F', fontSize: 13, lineHeight: 1 }}>✦</span>
        <span style={{
          fontFamily: 'var(--font-sora), system-ui, sans-serif',
          fontSize: 17, fontWeight: 700,
          color: 'var(--text-1, #F2F2F2)',
        }}>
          Revorva<span style={{ color: '#C94A1F' }}>.</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 pt-3 pb-2">
        {navItems.map(({ href, Icon, label, needsAttention }) => {
          const active =
            pathname === href ||
            (href !== '/dashboard' && href !== '/settings' && pathname.startsWith(href)) ||
            (href === '/settings' && pathname === '/settings')
          const hasAlert = needsAttention ? needsAttention(setupStatus) : false

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 mx-2 mb-0.5 rounded-lg transition-all duration-150"
              style={{
                padding: '9px 14px',
                color: active ? '#C94A1F' : 'var(--text-3, #666)',
                background: active ? 'rgba(201,74,31,0.10)' : 'transparent',
                border: active ? '1px solid rgba(201,74,31,0.20)' : '1px solid transparent',
                textDecoration: 'none',
                fontSize: 13, fontWeight: active ? 500 : 400,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--surface-2, #161616)'
                  e.currentTarget.style.color = 'var(--text-1, #F2F2F2)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-3, #666)'
                }
              }}
            >
              <span style={{ flexShrink: 0, opacity: active ? 1 : 0.6 }}><Icon /></span>
              <span className="flex-1">{label}</span>
              {hasAlert && !active && (
                <span className="flex-shrink-0 rounded-full" style={{ width: 6, height: 6, background: '#C94A1F' }} />
              )}
            </Link>
          )
        })}

      </nav>

      {/* Help */}
      <div className="px-2 pb-1 flex-shrink-0">
        <Link
          href="/help"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-lg transition-colors"
          style={{ padding: '8px 14px', color: 'var(--text-3, #444)', fontSize: 13, textDecoration: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-2, #888)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3, #444)' }}
        >
          <span style={{ opacity: 0.6 }}><IconHelp /></span>
          Help &amp; Docs
        </Link>
      </div>

      {/* Footer — user + logout */}
      <div
        className="flex flex-col gap-0.5 p-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border, #1E1E1E)' }}
      >
        <Link
          href="/profile"
          className="flex items-center gap-2.5 rounded-lg transition-colors"
          style={{ padding: '8px 10px', textDecoration: 'none' }}
        >
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-full overflow-hidden"
            style={{
              width: 28, height: 28,
              background: 'linear-gradient(135deg, #C94A1F, #A83818)',
              fontSize: 11, fontWeight: 700, color: '#fff',
            }}
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" width={28} height={28} className="object-cover" />
            ) : (
              initials
            )}
          </div>
          {userEmail && (
            <span className="truncate flex-1" style={{ fontSize: 12, color: 'var(--text-3, #555)' }}>
              {userEmail}
            </span>
          )}
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 rounded-lg w-full text-left transition-colors"
          style={{ padding: '8px 10px', fontSize: 13, color: 'var(--text-3, #444)', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-2, #888)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3, #444)' }}
        >
          <span style={{ opacity: 0.6 }}><IconLogOut /></span>
          Log out
        </button>
      </div>
    </aside>
  )
}
