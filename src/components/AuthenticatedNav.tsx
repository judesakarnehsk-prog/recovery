'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, ChevronDown, User, LayoutDashboard, Link2, Settings, CreditCard } from 'lucide-react'
import { LogoLink } from '@/components/Logo'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/integrations', label: 'Integrations', icon: Link2 },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/billing', label: 'Billing', icon: CreditCard },
]

interface AuthenticatedNavProps {
  userName?: string
  userEmail?: string
}

export function AuthenticatedNav({ userName, userEmail }: AuthenticatedNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <LogoLink size="sm" />
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {item.label}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="auth-nav-indicator"
                      className="absolute inset-0 bg-primary/5 rounded-lg"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-gradient flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {userName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-text-primary">
                {userName || 'User'}
              </span>
              <ChevronDown className="w-4 h-4 text-text-secondary" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-elevated z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-text-primary">{userName || 'User'}</p>
                      <p className="text-xs text-text-secondary truncate">{userEmail}</p>
                    </div>
                    {/* Mobile nav items */}
                    <div className="md:hidden border-b border-border py-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setShowUserMenu(false)}
                          className={cn(
                            'flex items-center gap-2 px-4 py-2.5 text-sm transition-colors',
                            pathname === item.href
                              ? 'text-primary bg-primary/5'
                              : 'text-text-secondary hover:bg-gray-50'
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
