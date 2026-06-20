'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const stats = [
  {
    value: '4–9%',
    label: 'of subscription payments fail every month',
    source: 'Recurly, 2024 SaaS Payment Recovery Report',
    countTo: 9, prefix: '', suffix: '%', isRange: true, rangeStart: 4,
  },
  {
    value: '70%',
    label: 'of failed payments are recoverable',
    source: 'Stripe Subscription Best Practices, 2023',
    countTo: 70, prefix: '', suffix: '%', isRange: false, rangeStart: 0,
  },
  {
    value: '$1,200+',
    label: 'average monthly loss at $20k MRR',
    source: 'Calculated from industry-wide failure rates',
    countTo: 1200, prefix: '$', suffix: '+', isRange: false, rangeStart: 0,
  },
]

function CountUp({ to, prefix, suffix, isRange, rangeStart, triggered }: {
  to: number; prefix: string; suffix: string; isRange: boolean; rangeStart: number; triggered: boolean
}) {
  const [val, setVal] = useState(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!triggered) return
    const duration = 1200
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(eased * to))
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [triggered, to])

  const display = isRange ? `${rangeStart}–${val}` : `${val.toLocaleString()}`
  return <>{prefix}{display}{suffix}</>
}

export function IndustryStats() {
  const [triggered, setTriggered] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-cream py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink">The problem is bigger than you think</h2>
        </motion.div>

        <div ref={sectionRef} className="grid md:grid-cols-3 gap-5 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="bg-white border border-border rounded-2xl p-8 text-center"
            >
              <p className="font-display text-5xl text-accent mb-3 tabular-nums">
                <CountUp
                  to={stat.countTo}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  isRange={stat.isRange}
                  rangeStart={stat.rangeStart}
                  triggered={triggered}
                />
              </p>
              <p className="text-sm text-muted leading-snug">{stat.label}</p>
              <p className="text-[11px] italic mt-2 leading-snug" style={{ color: '#6B7280' }}>
                Source: {stat.source}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
