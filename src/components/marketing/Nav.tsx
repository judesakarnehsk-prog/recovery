'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
]

const ISLAND_THRESHOLD = 72

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const tickingRef = useRef(false)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    function updateNav() {
      const isScrolled = window.scrollY > ISLAND_THRESHOLD
      nav!.classList.toggle('scrolled', isScrolled)
      setScrolled(isScrolled)
      tickingRef.current = false
    }

    function onScroll() {
      if (!tickingRef.current) {
        tickingRef.current = true
        requestAnimationFrame(updateNav)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    updateNav()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      <header ref={navRef} className="nav-bar">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl mx-auto px-4 sm:px-6 w-full"
        >
          <div className="flex items-center justify-between" style={{ height: 64 }}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 group">
              <span className="text-accent text-sm leading-none">✦</span>
              <span className={cn(
                'font-bold tracking-tight font-sans transition-colors duration-400',
                scrolled ? 'text-xl text-white' : 'text-xl text-ink'
              )}>
                Revorva<span className="text-accent">.</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition-colors duration-150 rounded-lg',
                    scrolled
                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                      : 'text-muted hover:text-ink hover:bg-cream'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={scrolled ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}
                >
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="accent" size="sm">Start free trial</Button>
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                'md:hidden p-2 rounded-lg transition-colors',
                scrolled ? 'text-white hover:bg-white/10' : 'text-ink hover:bg-cream'
              )}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-4 top-20 z-40 md:hidden bg-white border border-border rounded-2xl shadow-elevated overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-sm text-ink/80 hover:text-ink hover:bg-cream rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 space-y-2 border-t border-border mt-3">
                <Link href="/login" className="block">
                  <Button variant="outline" size="md" className="w-full">Log in</Button>
                </Link>
                <Link href="/signup" className="block">
                  <Button variant="accent" size="md" className="w-full">Start free trial</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
