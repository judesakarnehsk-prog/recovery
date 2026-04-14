'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection, staggerContainer, staggerItem } from '@/lib/motion'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Starter',
    description: 'For early-stage SaaS with growing subscriptions',
    monthlyPrice: 29,
    yearlyPrice: 24,
    features: [
      'Up to 100 recovery attempts/mo',
      '1 sending domain',
      '3-step dunning email sequence',
      'Smart personalized emails',
      'Payment update links',
      'Basic dashboard & analytics',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Growth',
    description: 'For scaling SaaS teams serious about churn',
    monthlyPrice: 79,
    yearlyPrice: 66,
    features: [
      'Up to 1,000 recovery attempts/mo',
      '3 sending domains',
      '5-step dunning sequence',
      'Smart personalized emails',
      'Payment update links',
      'Advanced analytics & reports',
      'Custom email branding',
      'Webhook notifications',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Scale',
    description: 'For high-volume subscription businesses',
    monthlyPrice: 199,
    yearlyPrice: 166,
    features: [
      'Unlimited recovery attempts',
      'Unlimited sending domains',
      'Fully custom dunning flows',
      'Smart personalized emails',
      'Payment update links',
      'Full analytics suite',
      'Custom domain emails',
      'API access',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
]

export function PricingTable() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div>
      {/* Billing toggle */}
      <AnimatedSection className="flex justify-center mb-12">
        <div className="inline-flex items-center gap-3 p-1.5 bg-white rounded-full border border-border shadow-card">
          <button
            onClick={() => setIsYearly(false)}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-medium transition-all duration-300',
              !isYearly ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2',
              isYearly ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            Yearly
            <span className={cn(
              'text-xs font-bold px-2 py-0.5 rounded-full transition-colors duration-300',
              isYearly ? 'bg-white/20 text-white' : 'bg-success/10 text-success'
            )}>
              -17%
            </span>
          </button>
        </div>
      </AnimatedSection>

      {/* Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto"
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            variants={staggerItem}
            className={cn(
              'relative rounded-2xl border p-8 transition-all duration-500',
              plan.popular
                ? 'bg-white border-primary/30 shadow-elevated scale-[1.02] lg:scale-105'
                : 'bg-white border-border shadow-card hover:shadow-card-hover hover:-translate-y-1'
            )}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge variant="accent" className="shadow-md px-4 py-1.5">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
              <p className="text-sm text-text-secondary mt-1">{plan.description}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isYearly ? 'yearly' : 'monthly'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="text-5xl font-extrabold text-text-primary"
                  >
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </motion.span>
                </AnimatePresence>
                <span className="text-text-secondary">/mo</span>
              </div>
              {isYearly && (
                <p className="text-sm text-success font-medium mt-1">
                  Save ${(plan.monthlyPrice - plan.yearlyPrice) * 12}/year
                </p>
              )}
            </div>

            <Link href="/signup">
              <Button
                variant={plan.popular ? 'cta' : 'outline'}
                size="lg"
                className="w-full mb-8"
              >
                {plan.cta}
              </Button>
            </Link>

            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                    plan.popular ? 'bg-accent/10' : 'bg-success/10'
                  )}>
                    <Check className={cn(
                      'w-3 h-3',
                      plan.popular ? 'text-accent' : 'text-success'
                    )} />
                  </div>
                  <span className="text-sm text-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
