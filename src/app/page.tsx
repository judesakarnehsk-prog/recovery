'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Zap,
  RefreshCw,
  BarChart3,
  Shield,
  Clock,
  Mail,
  TrendingUp,
  CheckCircle2,
  Star,
  Quote,
  AlertTriangle,
} from 'lucide-react'
import { Hero } from '@/components/Hero'
import { PricingTable } from '@/components/PricingTable'
import { DunningPreview } from '@/components/DunningPreview'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection, staggerContainer, staggerItem } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { GradientMesh, AuroraBackground, NoiseTexture, GridBackground } from '@/components/InteractiveBackground'
import { ROICalculator } from '@/components/ROICalculator'

const valueProps = [
  {
    icon: RefreshCw,
    title: 'Retry logic that actually works',
    description: 'Insufficient funds? We wait a few days. Expired card? We send an update link immediately. Timing is based on the decline reason.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Mail,
    title: 'Dunning emails that get read',
    description: 'Multi-step sequences written to match your brand tone. They reference the actual failure reason — not a generic "your payment failed" notice.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    icon: Zap,
    title: 'One-click payment update',
    description: 'Customers get a direct link to update their card. No login, no friction. Works on any device.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: BarChart3,
    title: 'Recovery dashboard',
    description: 'See which payments were recovered, which emails were opened, and how much revenue came back. All in one place.',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    icon: Shield,
    title: 'Stripe Connect — no card data stored',
    description: 'We connect via Stripe OAuth. Your customers\' card details never touch our servers. PCI compliant by design.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Clock,
    title: 'Live in 5 minutes',
    description: 'Connect Stripe, pick your tone, and you\'re done. No developer needed, no webhook setup.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
]

const howItWorks = [
  {
    step: '01',
    title: 'Connect your Stripe account',
    description: 'One-click OAuth. No API keys to copy, no code to write.',
    icon: Zap,
  },
  {
    step: '02',
    title: 'Configure once',
    description: 'Set your email tone, retry schedule, and sender domain. Takes about 5 minutes.',
    icon: Mail,
  },
  {
    step: '03',
    title: 'It runs in the background',
    description: 'Revorva monitors your Stripe account, retries failed charges, and sends dunning emails automatically.',
    icon: TrendingUp,
  },
]

const testimonials = [
  {
    name: 'James R.',
    role: 'Founder, B2B SaaS',
    content: "We had no process for failed payments — just hoped customers would notice. Revorva made it automatic. We got back a few thousand in the first few weeks.",
    avatar: 'JR',
    recovered: 'Early access',
  },
  {
    name: 'Priya M.',
    role: 'Head of Ops, subscription tool',
    content: "The emails don't feel like they came from a dunning platform. They sound like us. Our customers actually reply asking how to update their card.",
    avatar: 'PM',
    recovered: 'Early access',
  },
  {
    name: 'Tom K.',
    role: 'Co-founder, SaaS startup',
    content: "Setup was genuinely quick. Connected Stripe, picked the tone, done. I expected it to be more complicated.",
    avatar: 'TK',
    recovered: 'Early access',
  },
]

const logos = ['Pagesync', 'Bonsai', 'Userflow', 'Codeshot', 'Draftly', 'Stackled']

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <Hero />

      {/* Social proof logos */}
      <section className="py-16 bg-white border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <p className="text-center text-sm font-medium text-text-secondary mb-8 uppercase tracking-wider">
              Early access — used by teams like these
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
              {logos.map((logo) => (
                <motion.span
                  key={logo}
                  whileHover={{ scale: 1.05 }}
                  className="text-lg font-bold text-text-secondary/30 hover:text-text-secondary/50 transition-colors duration-300"
                >
                  {logo}
                </motion.span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 lg:py-32 bg-white relative overflow-hidden">
        <NoiseTexture opacity={0.02} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="default" className="mb-4 gap-1">
              <AlertTriangle className="w-3 h-3" />
              The Problem
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight">
              Most subscription churn isn't{' '}
              <span className="gradient-text">customers leaving</span>
            </h2>
            <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
              It's expired cards, bank declines, and processing errors. Somewhere between 40–60% of cancellations are involuntary. Those customers didn't choose to leave — they just never got a chance to fix it.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { stat: '5–15%', label: 'of subscription payments fail every month' },
              { stat: '40–60%', label: 'of churn is involuntary' },
              { stat: '$0', label: 'recovered without a process in place' },
            ].map((item) => (
              <AnimatedSection key={item.stat}>
                <Card className="text-center py-8">
                  <p className="text-4xl font-extrabold text-primary mb-2">{item.stat}</p>
                  <p className="text-sm text-text-secondary">{item.label}</p>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props (Solution) */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <GridBackground className="opacity-60" />
        <GradientMesh className="opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="accent" className="mb-4">The Solution</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight">
              Revorva handles the recovery{' '}
              <span className="gradient-text">automatically</span>
            </h2>
            <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
              Connect your Stripe account and Revorva takes over — retrying failed charges at the right time and sending dunning emails that match your brand.
            </p>
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {valueProps.map((prop) => (
              <motion.div key={prop.title} variants={staggerItem}>
                <Card hover className="h-full">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', prop.bg)}>
                    <prop.icon className={cn('w-6 h-6', prop.color)} />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">{prop.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{prop.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-white relative overflow-hidden">
        <NoiseTexture opacity={0.02} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="default" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight">
              Set it up once,{' '}
              <span className="gradient-text">runs on its own</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-primary/20 via-accent/30 to-success/20" />

            {howItWorks.map((step, index) => (
              <AnimatedSection key={step.step} delay={index * 0.15}>
                <div className="text-center relative">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="w-16 h-16 rounded-2xl bg-primary-gradient flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10"
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <span className="text-xs font-bold text-accent uppercase tracking-widest">Step {step.step}</span>
                  <h3 className="text-xl font-bold text-text-primary mt-2 mb-3">{step.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Dunning Preview */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <AuroraBackground className="opacity-60" />
        <NoiseTexture opacity={0.02} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimatedSection>
              <Badge variant="accent" className="mb-4">Smart Emails</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary leading-tight">
                Emails that sound like{' '}
                <span className="gradient-text">they came from you</span>
              </h2>
              <p className="mt-4 text-lg text-text-secondary">
                Each email references the actual decline reason and matches the tone you pick. Customers reply to them. That's the difference.
              </p>

              <ul className="mt-8 space-y-3">
                {[
                  'Written around the specific decline reason',
                  'Escalates across 3–5 steps without feeling spammy',
                  'One-click card update — no login required',
                  'Send from your own domain',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-sm text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <DunningPreview />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <GridBackground className="opacity-40" />
        <NoiseTexture opacity={0.02} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="accent" className="mb-4">ROI Calculator</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight">
              How much are you{' '}
              <span className="gradient-text">leaving on the table?</span>
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Rough estimate based on your MRR and typical failure rates. Not a sales pitch — just math.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <ROICalculator />
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="success" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight">
              What early users{' '}
              <span className="gradient-text">are saying</span>
            </h2>
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={staggerItem}>
                <Card className="h-full flex flex-col">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-primary/10 mb-3" />
                  <p className="text-sm text-text-secondary leading-relaxed flex-1">{t.content}</p>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{t.avatar}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                        <p className="text-xs text-text-secondary">{t.role}</p>
                      </div>
                    </div>
                    <Badge variant="success">{t.recovered}</Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <GridBackground className="opacity-40" />
        <GradientMesh className="opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="default" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight">
              Plans that{' '}
              <span className="gradient-text">pay for themselves</span>
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Start with a 14-day free trial. No credit card required.
            </p>
          </AnimatedSection>

          <PricingTable />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-gradient" />
        <div className="absolute inset-0">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <NoiseTexture opacity={0.04} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight glow-text">
              Your next payment failure
              <br />
              <span className="text-accent">doesn't have to be lost revenue.</span>
            </h2>
            <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
              Revorva is in early access. Limited spots. Takes 5 minutes to set up.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button variant="cta" size="xl" className="group">
                  Get early access
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <p className="text-sm text-white/40">
                Free 14-day trial &middot; No credit card &middot; Cancel anytime
              </p>
            </div>
            <p className="mt-8 text-sm text-white/30">
              Questions?{' '}
              <a href="mailto:hello@revorva.com" className="text-white/50 hover:text-white transition-colors underline">
                hello@revorva.com
              </a>
            </p>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
