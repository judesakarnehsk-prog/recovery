'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Settings, CreditCard, LogOut, Link2, RefreshCw, Palette, User, HelpCircle } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useSetupStatus } from '@/lib/useSetupStatus'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  needsAttention?: (status: ReturnType<typeof useSetupStatus>) => boolean
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/recoveries', icon: RefreshCw, label: 'Recoveries' },
  {
    href: '/connect',
    icon: Link2,
    label: 'Stripe Connect',
    needsAttention: (s) => !s.loading && !s.stripeConnected,
  },
  {
    href: '/settings/email-branding',
    icon: Palette,
    label: 'Email Branding',
    needsAttention: (s) => !s.loading && !s.brandingConfigured,
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'Settings',
    needsAttention: (s) => !s.loading && (!s.businessNameSet || !s.businessTypeSet || !s.replyToSet),
  },
  { href: '/billing', icon: CreditCard, label: 'Billing' },
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

  return (
    <aside className="w-56 h-screen flex-shrink-0 bg-cream border-r border-border flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/" className="text-base font-bold text-ink font-sans">
          Revorva<span className="text-accent">.</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href ||
            (item.href !== '/dashboard' && item.href !== '/settings' && pathname.startsWith(item.href)) ||
            (item.href === '/settings' && pathname === '/settings')
          const hasAlert = item.needsAttention ? item.needsAttention(setupStatus) : false

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150',
                active
                  ? 'bg-white text-accent font-medium shadow-card'
                  : 'text-muted hover:text-ink hover:bg-white/60'
              )}
            >
              <item.icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-accent')} />
              <span className="flex-1">{item.label}</span>
              {hasAlert && !active && (
                <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Help */}
      <div className="px-3 pb-2">
        <Link
          href="/help"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-ink hover:bg-white/60 transition-colors"
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          Help &amp; Docs
        </Link>
      </div>

      {/* User + logout */}
      <div className="p-3 border-t border-border space-y-0.5">
        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors w-full',
            pathname === '/profile'
              ? 'bg-white shadow-card'
              : 'hover:bg-white/60'
          )}
        >
          <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-accent/20 relative">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-accent-light flex items-center justify-center">
                <User className={cn('w-3 h-3', pathname === '/profile' ? 'text-accent' : 'text-muted')} />
              </div>
            )}
          </div>
          {userEmail && (
            <span className={cn('text-xs truncate flex-1', pathname === '/profile' ? 'text-accent font-medium' : 'text-muted')}>
              {userEmail}
            </span>
          )}
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 w-full text-sm text-muted hover:text-ink hover:bg-white/60 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  )
}
