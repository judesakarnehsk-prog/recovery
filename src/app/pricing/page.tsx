'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react'
import { PricingTable } from '@/components/PricingTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection, staggerContainer, staggerItem } from '@/lib/motion'
import { GradientMesh, GridBackground, NoiseTexture } from '@/components/InteractiveBackground'

const faqs = [
  {
    q: 'How does the 14-day free trial work?',
    a: 'Start using Revorva immediately — no credit card required. After 14 days, pick a plan to continue. All recovered revenue during the trial is yours to keep.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Absolutely. Upgrade or downgrade anytime from your dashboard. Changes take effect on your next billing cycle, and we prorate any differences.',
  },
  {
    q: 'What happens if I exceed my monthly limit?',
    a: 'We will never stop recovering your revenue. If you exceed your plan limit, we will reach out to upgrade you. No surprise charges.',
  },
  {
    q: 'Do you take a percentage of recovered revenue?',
    a: 'No. Revorva is a flat monthly fee. All recovered revenue goes directly to you. No hidden fees, no revenue share.',
  },
  {
    q: 'Is my Stripe data safe?',
    a: 'Yes. We connect via Stripe Connect OAuth and never store card data. Our infrastructure is SOC 2 ready and all data is encrypted at rest and in transit.',
  },
  {
    q: 'What currencies do you support?',
    a: 'USD, GBP, EUR, AUD, and CAD. Dunning emails automatically format currency for each customer locale.',
  },
]

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <GradientMesh className="opacity-50" />
        <GridBackground className="opacity-40" />
        <NoiseTexture opacity={0.02} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <Badge variant="accent" className="mb-6">
              Simple Pricing
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary leading-tight">
              Plans that{' '}
              <span className="gradient-text">pay for themselves</span>
            </h1>
            <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
              Start with a 14-day free trial. No credit card required. Most teams recover 10-20x their subscription cost.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-12 lg:py-16 relative overflow-hidden">
        <GridBackground className="opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingTable />
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="bg-success/5 border border-success/20 rounded-2xl p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-4" />
              <h3 className="text-xl font-bold text-text-primary mb-2">
                30-Day Money-Back Guarantee
              </h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                If Revorva does not recover at least 3x your subscription cost in the first 30 days, we will refund you in full. No questions asked.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
        <NoiseTexture opacity={0.02} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-text-secondary">
              Can not find an answer? Email us at{' '}
              <a href="mailto:support@revorva.com" className="text-primary hover:underline">
                support@revorva.com
              </a>
            </p>
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {faqs.map((faq) => (
              <motion.div
                key={faq.q}
                variants={staggerItem}
                className="border border-border rounded-xl p-6 bg-white hover:shadow-card transition-shadow duration-300 spotlight-card"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">{faq.q}</h3>
                    <p className="text-sm text-text-secondary mt-2 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-gradient" />
        <div className="absolute inset-0">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-[30%] right-[15%] w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <NoiseTexture opacity={0.04} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white glow-text">
              Start recovering revenue today
            </h2>
            <div className="mt-8">
              <Link href="/signup">
                <Button variant="cta" size="xl" className="group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/30">
              Billing questions? Contact{' '}
              <a href="mailto:billing@revorva.com" className="text-white/50 hover:text-white transition-colors underline">
                billing@revorva.com
              </a>
            </p>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
