'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'

export function FinalCTA() {
  return (
    <section className="py-24 lg:py-32 bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-ink rounded-3xl overflow-hidden px-8 py-16 text-center"
        >
          {/* Accent glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-accent/20 blur-3xl rounded-full" />

          <div className="relative">
            <h2 className="font-display text-4xl lg:text-5xl text-white mb-4">
              You're losing money{' '}
              <em style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic', color: '#f0ded8' }}>
                right now
              </em>
            </h2>
            <p className="text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
              Every day without smart dunning is revenue you never get back. Connect Stripe and see your exact recovery potential in 2 minutes — free.
            </p>
            <Link href="/signup" onClick={() => trackEvent('cta_clicked', { location: 'footer' })}>
              <Button variant="accent" size="lg" className="group mx-auto">
                Connect Stripe — Start Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <p className="text-white/40 text-sm mt-4">
              Questions? Email us at{' '}
              <a href="mailto:support@revorva.com" className="underline hover:text-white/60 transition-colors">
                support@revorva.com
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
