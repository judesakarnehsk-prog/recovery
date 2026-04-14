'use client'

import Link from 'next/link'
import { Shield, Lock, Globe, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { Logo } from '@/components/Logo'
import { AnimatedSection, staggerContainer, staggerItem } from '@/lib/motion'

const footerLinks = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/faq' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
  ],
  Contact: [
    { label: 'hello@revorva.com', href: 'mailto:hello@revorva.com' },
    { label: 'support@revorva.com', href: 'mailto:support@revorva.com' },
    { label: 'billing@revorva.com', href: 'mailto:billing@revorva.com' },
  ],
}

const trustBadges = [
  { icon: Shield, label: 'SOC 2 Ready' },
  { icon: Lock, label: '256-bit SSL' },
  { icon: Globe, label: 'GDPR Compliant' },
]

export function Footer() {
  return (
    <footer className="relative bg-white border-t border-border overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-30" />
      {/* Faded watermark */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none"
        aria-hidden="true"
      >
        <span
          className="font-black italic whitespace-nowrap"
          style={{
            fontSize: 'clamp(130px, 18vw, 260px)',
            background: 'linear-gradient(70deg, #6D28D9 0%, #A78BFA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            opacity: 0.09,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            paddingRight: '0.12em',
          }}
        >
          revorva
        </span>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 lg:py-20">
          <AnimatedSection>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12"
            >
              <motion.div variants={staggerItem} className="col-span-2 md:col-span-1">
                <Link href="/" className="inline-flex mb-4">
                  <Logo size="md" />
                </Link>
                <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
                  Recover failed subscription payments automatically with smart dunning sequences.
                </p>
              </motion.div>

              {Object.entries(footerLinks).map(([category, links]) => (
                <motion.div key={category} variants={staggerItem}>
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
                    {category}
                  </h3>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.href}>
                        {link.href.startsWith('mailto:') ? (
                          <a
                            href={link.href}
                            className="text-sm text-text-secondary hover:text-primary transition-colors duration-200"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-sm text-text-secondary hover:text-primary transition-colors duration-200"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}

              <motion.div variants={staggerItem}>
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
                  Trust & Security
                </h3>
                <div className="space-y-3">
                  {trustBadges.map((badge) => (
                    <div key={badge.label} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                        <badge.icon className="w-4 h-4 text-success" />
                      </div>
                      <span className="text-sm text-text-secondary">{badge.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-text-secondary/50 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary/70 leading-relaxed">
                    167-169 Great Portland Street<br />
                    5th Floor, London, W1W 5PF<br />
                    United Kingdom
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatedSection>
        </div>

        <div className="border-t border-border py-8 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} Revorva. All rights reserved.
          </p>
          <p className="text-xs text-text-secondary/40">
            Powered by <span className="text-text-secondary/60">Humanaira</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
