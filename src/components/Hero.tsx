'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, TrendingUp, DollarSign, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedCounter } from '@/lib/motion'
import { FloatingParticles, GradientMesh, NoiseTexture, BeamLines } from '@/components/InteractiveBackground'

const floatingCards = [
  {
    icon: DollarSign,
    label: 'Payment Recovered',
    value: '+$249.00',
    color: 'text-success',
    bg: 'bg-success/10',
    delay: 0,
    position: 'top-[15%] right-[5%] lg:right-[8%]',
  },
  {
    icon: Mail,
    label: 'Dunning Email Sent',
    value: 'Step 2 of 3',
    color: 'text-accent',
    bg: 'bg-accent/10',
    delay: 0.3,
    position: 'top-[40%] right-[2%] lg:right-[3%]',
  },
  {
    icon: TrendingUp,
    label: 'Recovery Rate',
    value: '73.2%',
    color: 'text-primary',
    bg: 'bg-primary/10',
    delay: 0.6,
    position: 'bottom-[25%] right-[8%] lg:right-[12%]',
  },
]

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section
      ref={containerRef}
      className="relative flex items-center overflow-hidden"
    >
      {/* Interactive background layers */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <GradientMesh />
      <div className="absolute inset-0 grid-bg opacity-50" />
      <FloatingParticles count={40} connectDistance={100} />
      <BeamLines />
      <NoiseTexture opacity={0.025} />

      <motion.div style={{ y, opacity }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 lg:pt-24 lg:pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="text-sm font-medium text-primary">
                Built for Stripe subscription businesses
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-text-primary leading-[1.1] tracking-tight"
            >
              {"You're losing up to "}
              <span className="relative">
                <span className="gradient-text">15% of your subscription revenue</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-accent/30 rounded-full origin-left"
                />
              </span>
              {' — without realizing it'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-lg sm:text-xl text-text-secondary leading-relaxed max-w-xl"
            >
              Most subscription businesses lose 5–15% of revenue to failed payments every month. Revorva catches them, retries at the right time, and sends dunning emails that actually get read.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Link href="/signup">
                <Button variant="cta" size="xl" className="group">
                  Start recovering revenue
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <p className="text-sm text-text-secondary">
                14-day free trial &middot; No credit card required
              </p>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8 grid grid-cols-3 gap-8 pt-6 border-t border-border/50"
            >
              <div>
                <p className="text-3xl lg:text-4xl font-extrabold text-text-primary">5–15%</p>
                <p className="text-sm text-text-secondary mt-1">of payments fail monthly</p>
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-extrabold text-text-primary">~50%</p>
                <p className="text-sm text-text-secondary mt-1">of churn is involuntary</p>
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-extrabold text-text-primary">3–5×</p>
                <p className="text-sm text-text-secondary mt-1">typical ROI</p>
              </div>
            </motion.div>
          </div>

          {/* Right side — floating cards dashboard preview */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[420px]">
              {/* Main dashboard mock */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-8 mx-auto w-full max-w-md"
              >
                <div className="bg-white rounded-2xl shadow-elevated border border-border/50 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">Revenue Recovered</p>
                      <p className="text-3xl font-extrabold text-text-primary mt-1">$12,847</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-success" />
                    </div>
                  </div>

                  {/* Mini chart bars */}
                  <div className="flex items-end gap-1.5 h-16 pt-2">
                    {[40, 55, 35, 65, 45, 80, 60, 75, 50, 90, 70, 85].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.5, delay: 0.8 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="flex-1 rounded-sm bg-gradient-to-t from-primary to-accent/70"
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-success font-semibold">+23.5%</span>
                    <span className="text-text-secondary">vs last month</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating notification cards */}
              {floatingCards.map((card, index) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 + card.delay }}
                  className={`absolute ${card.position} z-10`}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 4 + index,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.5,
                    }}
                    className="bg-white rounded-xl shadow-card-hover border border-border/50 px-4 py-3 flex items-center gap-3 min-w-[200px]"
                  >
                    <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center flex-shrink-0`}>
                      <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">{card.label}</p>
                      <p className={`text-sm font-bold ${card.color}`}>{card.value}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
