'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

function Serif({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('is-visible'); observer.disconnect() } },
      { threshold: 0.8 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <em
      ref={ref}
      className="serif-highlight text-ink not-italic font-medium"
      style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic' }}
    >
      {children}
    </em>
  )
}

export function FounderStory() {
  return (
    <section className="py-24 lg:py-32" style={{ backgroundColor: '#EFEBE3' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink">Why we built Revorva</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto space-y-6 text-ink/80 leading-relaxed"
        >
          <p>
            I kept watching SaaS founders lose money to failed payments{' '}
            <Serif>without ever knowing it</Serif>
            . Cards expire. Banks decline. Subscriptions quietly cancel. Revenue evaporates.
          </p>

          <p>
            The crazy part: most of these failed payments are{' '}
            <Serif>completely recoverable</Serif>
            . The customer didn&apos;t mean to churn. They just needed someone to ask them to update their card. Stripe wasn&apos;t doing it well enough.
          </p>

          <p>
            So we built Revorva. Smart retries, AI-personalized emails, real-time recovery tracking — all running automatically in the background. The goal was simple: make payment recovery something founders{' '}
            <Serif>never have to think about again</Serif>
            .
          </p>

          <p className="text-muted text-sm pt-2">— The Revorva team</p>
          <p className="text-muted text-sm">
            Reach out anytime:{' '}
            <a href="mailto:founders@revorva.com" className="text-accent hover:underline">
              founders@revorva.com
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
