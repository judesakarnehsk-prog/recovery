'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'What is Revorva?',
    answer: 'Revorva is a payment recovery platform for subscription businesses. We automatically retry failed payments and send personalized dunning emails to recover revenue that would otherwise be lost to involuntary churn.',
  },
  {
    question: 'How does Revorva connect to my Stripe account?',
    answer: 'Revorva uses Stripe Connect OAuth for a secure, one-click connection. We never ask for your Stripe API keys directly. Your payment data stays with Stripe — we only access what we need to manage failed payment recovery.',
  },
  {
    question: 'How long does setup take?',
    answer: 'Most teams are up and running in under 5 minutes. Connect your Stripe account, configure your email tone and retry schedule, verify your sending domain, and you\'re done. Revorva starts working immediately.',
  },
  {
    question: 'What kind of recovery rates can I expect?',
    answer: 'Most customers see recovery rates between 40-73% of involuntary churn. The exact rate depends on your customer base, payment methods, and how quickly we can reach customers after a failure.',
  },
  {
    question: 'Do I need to install any code?',
    answer: 'No. Revorva works entirely through Stripe webhooks and our email service. There\'s no code to install, no SDKs to integrate, and no changes to your existing billing flow.',
  },
  {
    question: 'Can I customize the dunning emails?',
    answer: 'Yes. You can choose your email tone (friendly, professional, direct, or empathetic), set up your custom sending domain, configure the retry schedule, and control how many attempts are made before giving up.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! Every plan comes with a 14-day free trial. No credit card required. You can test Revorva with your real Stripe data and see results before committing.',
  },
  {
    question: 'How is pricing structured?',
    answer: 'Revorva offers three plans based on recovery volume: Starter ($29/mo for up to 100 attempts), Growth ($79/mo for up to 1,000 attempts), and Scale ($199/mo for unlimited attempts). Annual billing saves 17%.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use Stripe Connect OAuth (no API keys), 256-bit SSL encryption, and maintain SOC 2 readiness. We\'re also GDPR compliant. Customer payment data never touches our servers.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. There are no long-term contracts or cancellation fees. You can cancel your subscription at any time from your billing settings.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-base font-semibold text-text-primary pr-4">{question}</span>
        <ChevronDown className={cn('w-5 h-5 text-text-secondary flex-shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-4">
              <p className="text-sm text-text-secondary leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            Everything you need to know about Revorva.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        <div className="mt-12 text-center p-8 bg-gray-50 rounded-2xl border border-border">
          <p className="text-text-primary font-semibold mb-2">Still have questions?</p>
          <p className="text-sm text-text-secondary">
            Reach out to us at{' '}
            <a href="mailto:hello@revorva.com" className="text-primary hover:underline">
              hello@revorva.com
            </a>{' '}
            and we&apos;ll get back to you within 24 hours.
          </p>
        </div>
      </div>
    </div>
  )
}
