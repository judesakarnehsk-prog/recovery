'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogoLink } from '@/components/Logo'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/onboarding')
    || pathname?.startsWith('/billing') || pathname?.startsWith('/integrations')
    || pathname?.startsWith('/settings') || pathname?.startsWith('/admin')
  const isAuthPage = pathname === '/login' || pathname === '/signup'

  const showNavLinks = !isDashboard && !isAuthPage

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Hide navbar completely on dashboard, onboarding, and auth pages
  if (isDashboard || isAuthPage) return null

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-nav border-b border-border/50'
            : 'bg-transparent'
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <LogoLink size="md" />

            {showNavLinks && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                      pathname === link.href
                        ? 'text-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {link.label}
                    {pathname === link.href && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-primary/5 rounded-lg"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            )}

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-primary/5 transition-colors"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden"
          >
            <div className="bg-white/95 backdrop-blur-xl border-b border-border shadow-elevated mx-4 mt-2 rounded-2xl overflow-hidden">
              <div className="p-4 space-y-1">
                {showNavLinks && navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'bg-primary/5 text-primary'
                        : 'text-text-secondary hover:bg-gray-50'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {showNavLinks && <hr className="my-3 border-border" />}
                <Link href="/login" className="block px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-gray-50">
                  Log in
                </Link>
                <div className="pt-2">
                  <Link href="/signup" className="block">
                    <Button variant="primary" size="lg" className="w-full">
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
