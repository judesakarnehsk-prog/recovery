'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'

const plans = [
  {
    name: 'Starter',
    slug: 'starter',
    monthly: 29,
    annual: 23,
    description: 'For early-stage SaaS with up to $10k MRR',
    features: [
      'Up to $10k MRR',
      'Unlimited recovery emails',
      'Smart retry schedule (Day 0, 3, 7, 14)',
      'Send from billing@revorva.com with your business name',
      'Recovery dashboard',
      'Email support',
    ],
    popular: false,
  },
  {
    name: 'Growth',
    slug: 'growth',
    monthly: 79,
    annual: 63,
    description: 'For growing teams with up to $50k MRR',
    features: [
      'Up to $50k MRR',
      'Everything in Starter',
      'AI-personalized email content',
      'Custom email domain (billing@yourdomain.com)',
      'Custom brand color & logo',
      'Priority email support',
    ],
    popular: true,
  },
  {
    name: 'Scale',
    slug: 'scale',
    monthly: 149,
    annual: 119,
    description: 'For established businesses with unlimited MRR',
    features: [
      'Unlimited MRR',
      'Everything in Growth',
      'Unlimited custom domains',
      'Advanced retry logic',
      'Dedicated account manager',
    ],
    popular: false,
  },
]

const faqs = [
  {
    q: 'What happens after the free trial?',
    a: "You're charged on day 15. We'll remind you on day 12.",
  },
  {
    q: 'Do you take a % of recovered revenue?',
    a: 'No. Flat monthly fee only. Keep 100% of what you recover.',
  },
  {
    q: "What if a payment can't be recovered?",
    a: "We mark it in your dashboard. You decide next steps.",
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your dashboard. No questions asked.',
  },
  {
    q: 'Does this work with Stripe?',
    a: 'Yes, Stripe only for now.',
  },
  {
    q: 'What email address do customers receive emails from?',
    a: 'billing@revorva.com by default, with your business name shown. Scale plan users can use their own domain.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-ink hover:text-accent transition-colors"
      >
        {q}
        <ChevronDown className={cn('w-4 h-4 text-muted flex-shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted pb-4 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Pricing() {
  const [annual, setAnnual] = useState(false)

  useEffect(() => {
    trackEvent('pricing_viewed')
  }, [])

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink mb-3">Simple pricing. Pays for itself.</h2>
          <p className="text-muted">Start free for 14 days. No credit card required.</p>
        </motion.div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={cn('text-sm font-medium', !annual ? 'text-ink' : 'text-muted')}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={cn(
              'relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none',
              annual ? 'bg-ink' : 'bg-border'
            )}
          >
            <span
              className={cn(
                'absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                annual ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
          <span className={cn('text-sm font-medium', annual ? 'text-ink' : 'text-muted')}>
            Annual <span className="text-xs text-accent font-semibold ml-1">Save 20%</span>
          </span>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                'relative rounded-2xl border p-6 flex flex-col',
                plan.popular
                  ? 'bg-ink text-white border-ink shadow-elevated'
                  : 'bg-white border-border'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">Most popular</span>
                </div>
              )}

              <div className="mb-5">
                <h3 className={cn('text-base font-semibold mb-1', plan.popular ? 'text-white' : 'text-ink')}>{plan.name}</h3>
                <p className={cn('text-xs', plan.popular ? 'text-white/60' : 'text-muted')}>{plan.description}</p>
              </div>

              <div className="mb-5">
                <span className={cn('text-4xl font-bold', plan.popular ? 'text-white' : 'text-ink')}>
                  ${annual ? plan.annual : plan.monthly}
                </span>
                <span className={cn('text-sm ml-1', plan.popular ? 'text-white/60' : 'text-muted')}>/mo</span>
                {annual && (
                  <p className={cn('text-xs mt-0.5', plan.popular ? 'text-white/50' : 'text-muted')}>billed annually</p>
                )}
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={cn('w-4 h-4 mt-0.5 flex-shrink-0', plan.popular ? 'text-accent' : 'text-green-600')} />
                    <span className={cn('text-sm', plan.popular ? 'text-white/80' : 'text-muted')}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/signup?plan=${plan.slug}`}
                onClick={() => trackEvent('cta_clicked', { location: 'pricing', plan: plan.slug })}
              >
                <Button
                  variant={plan.popular ? 'accent' : 'outline'}
                  size="md"
                  className="w-full"
                >
                  Start free trial
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted mb-16">
          All plans include a 14-day free trial. Cancel anytime. No contracts.
        </p>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h3 className="text-lg font-semibold text-ink mb-4 text-center">Frequently asked questions</h3>
          <div className="bg-white border border-border rounded-2xl px-6">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} {...faq} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
