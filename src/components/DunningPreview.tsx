'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'

const sampleEmails = [
  {
    step: 1,
    subject: "Quick heads-up: Your payment didn't go through",
    preview: "Hi Sarah, we noticed your recent payment of $49/mo for ProApp couldn't be processed. This sometimes happens when a card expires or has insufficient funds. No worries — you can update your payment method here to keep your subscription active.",
    tone: 'Friendly',
  },
  {
    step: 2,
    subject: 'Action needed: Update your payment method',
    preview: "Hi Sarah, just a friendly follow-up — your $49/mo ProApp subscription payment is still pending. Your account remains active, but we want to make sure you don't lose access. Please take a moment to update your payment details.",
    tone: 'Professional',
  },
  {
    step: 3,
    subject: 'Final notice: Your ProApp access is at risk',
    preview: "Hi Sarah, this is our final notice regarding your $49/mo ProApp subscription. We haven't been able to process your payment, and your account access will be paused in 48 hours. Update your payment now to continue using ProApp without interruption.",
    tone: 'Urgent',
  },
  {
    step: 4,
    subject: "We understand — let's sort this out together",
    preview: "Hi Sarah, we know life gets busy and things slip through the cracks — it happens to all of us. Your $49/mo ProApp payment didn't go through, and we genuinely want to help you stay connected. Whenever you're ready, updating your payment takes less than a minute.",
    tone: 'Empathetic',
  },
]

export function DunningPreview() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Dunning Email Preview</h3>
            <p className="text-sm text-text-secondary">Smart email sequence for failed payments</p>
          </div>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex border-b border-border">
        {sampleEmails.map((email, index) => (
          <button
            key={index}
            onClick={() => setActiveStep(index)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
              activeStep === index
                ? 'text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Step {email.step}<br />{email.tone}
            {activeStep === index && (
              <motion.div
                layoutId="step-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Email preview */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          <div className="bg-gray-50 rounded-xl p-5 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">R</span>
              </div>
              <span className="text-sm font-medium text-text-primary">Revorva</span>
              <span className="text-xs text-text-secondary">billing@revorva.com</span>
            </div>
            <h4 className="text-base font-semibold text-text-primary mb-3">
              {sampleEmails[activeStep].subject}
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              {sampleEmails[activeStep].preview}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg">
              Update Payment Method
            </div>
          </div>

        </motion.div>
      </AnimatePresence>
    </Card>
  )
}
