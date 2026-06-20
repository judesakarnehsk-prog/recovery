'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Plug, Palette, CheckCircle } from 'lucide-react'

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Create your account',
    time: '30 seconds',
    description: 'Sign up with your email. Verify your inbox. You\'re in.',
  },
  {
    number: 2,
    icon: Plug,
    title: 'Connect Stripe',
    time: '1 minute',
    description: 'Click \'Connect Stripe\' — we use Stripe\'s official OAuth. No API keys to copy. No webhooks to configure.',
  },
  {
    number: 3,
    icon: Palette,
    title: 'Customize your branding',
    time: '1 minute',
    description: 'Add your business name, logo, brand color, and choose your email tone. Optional but recommended.',
  },
  {
    number: 4,
    icon: CheckCircle,
    title: 'You\'re done.',
    time: '0 extra steps',
    description: 'We start listening for failed payments immediately. Your first recovery happens automatically.',
  },
]

export function WhatHappensNext() {
  const lineRef = useRef<SVGLineElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          lineRef.current?.classList.add('is-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-24 lg:py-32 bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink mb-3">
            What happens when you click &ldquo;Start free trial&rdquo;
          </h2>
          <p className="text-muted">Setup takes 2 minutes. Here&apos;s exactly what to expect.</p>
        </motion.div>

        {/* Desktop horizontal timeline */}
        <div ref={wrapperRef} className="hidden md:block relative">
          {/* Animated SVG line replacing static dashed div */}
          <svg
            className="absolute pointer-events-none z-0 overflow-visible"
            style={{ top: 36, left: '12.5%', width: '75%', height: 2 }}
            aria-hidden="true"
          >
            <line
              ref={lineRef}
              x1="0" y1="1" x2="100%" y2="1"
              stroke="rgba(15,14,12,0.18)"
              strokeWidth="2"
              strokeDasharray="6 4"
              className="timeline-line"
            />
          </svg>

          <div className="grid md:grid-cols-4 gap-6 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group flex flex-col items-center text-center"
              >
                {/* Number circle + icon — solid bg so line doesn't show through */}
                <div className="relative mb-5 bg-paper rounded-full p-1">
                  <div
                    className="rounded-full flex items-center justify-center shadow-card group-hover:shadow-elevated transition-all duration-200 group-hover:-translate-y-1"
                    style={{ width: 72, height: 72, backgroundColor: '#C94A1F' }}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ink text-white text-[10px] font-bold flex items-center justify-center z-10">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-ink mb-1.5">{step.title}</h3>
                <p className="text-xs text-muted leading-relaxed mb-3">{step.description}</p>
                <span className="inline-block text-[11px] font-medium text-muted/60 bg-cream border border-border rounded-full px-2.5 py-0.5">
                  {step.time}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="md:hidden space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex gap-4 relative"
            >
              {/* Left: icon column with vertical line */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                  style={{ backgroundColor: '#C94A1F' }}
                >
                  <step.icon className="w-5 h-5 text-white" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-ink text-white text-[9px] font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 border-l-2 border-dashed border-border mt-1 mb-1 min-h-[40px]" />
                )}
              </div>

              {/* Right: content */}
              <div className="pb-8">
                <h3 className="text-sm font-semibold text-ink mb-1">{step.title}</h3>
                <p className="text-xs text-muted leading-relaxed mb-2">{step.description}</p>
                <span className="inline-block text-[11px] font-medium text-muted/60 bg-cream border border-border rounded-full px-2.5 py-0.5">
                  {step.time}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
