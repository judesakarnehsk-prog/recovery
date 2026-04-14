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
  Bell,
  Globe,
  Palette,
  Code,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection, staggerContainer, staggerItem } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { GradientMesh, GridBackground, AuroraBackground, NoiseTexture } from '@/components/InteractiveBackground'

const features = [
  {
    category: 'Recovery Engine',
    items: [
      {
        icon: RefreshCw,
        title: 'Intelligent Retry Logic',
        description: 'Analyzes decline codes to determine the optimal retry timing. Insufficient funds? We wait for payday. Expired card? We send an update link immediately.',
        color: 'text-accent',
        bg: 'bg-accent/10',
      },
      {
        icon: Mail,
        title: 'Personalized Dunning Emails',
        description: 'Smart dunning emails tailored to each customer that match your brand voice. Each email is unique to the customer and situation.',
        color: 'text-primary',
        bg: 'bg-primary/10',
      },
      {
        icon: Mail,
        title: 'Multi-Step Sequences',
        description: 'Up to 5-step email sequences with escalating urgency. From friendly reminder to final notice, each step is carefully timed.',
        color: 'text-success',
        bg: 'bg-success/10',
      },
      {
        icon: Zap,
        title: 'Payment Update Links',
        description: 'Frictionless one-click pages where customers update their payment method. No login required. Works on any device.',
        color: 'text-primary',
        bg: 'bg-primary/10',
      },
    ],
  },
  {
    category: 'Analytics & Insights',
    items: [
      {
        icon: BarChart3,
        title: 'Recovery Dashboard',
        description: 'Real-time dashboard showing recovered revenue, retry success rates, email open rates, and customer-level details.',
        color: 'text-primary',
        bg: 'bg-primary/10',
      },
      {
        icon: TrendingUp,
        title: 'Revenue Tracking',
        description: 'Track every dollar recovered. See monthly trends, per-plan breakdowns, and projected annual impact.',
        color: 'text-success',
        bg: 'bg-success/10',
      },
      {
        icon: Bell,
        title: 'Webhook Notifications',
        description: 'Get notified instantly when a payment is recovered. Integrate with Slack, your CRM, or any webhook endpoint.',
        color: 'text-accent',
        bg: 'bg-accent/10',
      },
    ],
  },
  {
    category: 'Customization & Security',
    items: [
      {
        icon: Palette,
        title: 'Brand Customization',
        description: 'Custom email templates with your logo, colors, and domain. Emails look like they come from you, not from a third party.',
        color: 'text-primary',
        bg: 'bg-primary/10',
      },
      {
        icon: Globe,
        title: 'Multi-Currency',
        description: 'Support for USD, GBP, EUR, AUD, and CAD. Emails automatically localize currency formatting.',
        color: 'text-accent',
        bg: 'bg-accent/10',
      },
      {
        icon: Shield,
        title: 'Stripe Native Security',
        description: 'Connects via Stripe Connect OAuth. No credit card data ever touches our servers. SOC 2 ready infrastructure.',
        color: 'text-success',
        bg: 'bg-success/10',
      },
      {
        icon: Lock,
        title: 'GDPR Compliant',
        description: 'Full GDPR and CCPA compliance. Customer data is encrypted at rest and in transit. EU data residency available.',
        color: 'text-primary',
        bg: 'bg-primary/10',
      },
      {
        icon: Code,
        title: 'API Access',
        description: 'REST API for custom integrations. Trigger retries, query recovery data, and manage settings programmatically.',
        color: 'text-accent',
        bg: 'bg-accent/10',
      },
    ],
  },
]

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <GradientMesh className="opacity-50" />
        <GridBackground className="opacity-40" />
        <NoiseTexture opacity={0.02} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <Badge variant="accent" className="mb-6">
              Built for SaaS
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary leading-tight max-w-4xl mx-auto">
              Every tool you need to{' '}
              <span className="gradient-text">eliminate involuntary churn</span>
            </h1>
            <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto">
              From smart dunning to real-time recovery analytics, Revorva handles the entire failed payment lifecycle.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Feature sections */}
      {features.map((section) => (
        <section
          key={section.category}
          className="py-20 lg:py-28 border-b border-border/50 last:border-b-0"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                {section.category}
              </h2>
            </AnimatedSection>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className={cn(
                'grid gap-6',
                section.items.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'
              )}
            >
              {section.items.map((feature) => (
                <motion.div key={feature.title} variants={staggerItem}>
                  <Card hover className="h-full">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', feature.bg)}>
                      <feature.icon className={cn('w-6 h-6', feature.color)} />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2">{feature.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-gradient" />
        <div className="absolute inset-0">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <NoiseTexture opacity={0.04} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white glow-text">
              Ready to recover your revenue?
            </h2>
            <p className="mt-4 text-lg text-white/60">
              14-day free trial. No credit card required.
            </p>
            <div className="mt-8">
              <Link href="/signup">
                <Button variant="cta" size="xl" className="group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/30">
              Questions? Email us at{' '}
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
