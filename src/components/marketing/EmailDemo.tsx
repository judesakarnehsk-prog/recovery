'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Tone = 'friendly' | 'professional' | 'empathetic'
type Day = 0 | 7 | 14

const tones: { value: Tone; label: string }[] = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'empathetic', label: 'Empathetic' },
]

const days: { value: Day; label: string }[] = [
  { value: 0, label: 'Day 0' },
  { value: 7, label: 'Day 7' },
  { value: 14, label: 'Final notice' },
]

function getSubject(businessName: string, tone: Tone, day: Day): string {
  if (day === 14) return `Final notice: ${businessName} subscription at risk`
  if (day === 7) {
    if (tone === 'friendly') return `Still here! Update your ${businessName} card when you can`
    if (tone === 'professional') return `Reminder: ${businessName} payment requires attention`
    return `Following up on your ${businessName} account`
  }
  // day 0
  if (tone === 'friendly') return `Hey, quick note about your ${businessName} payment`
  if (tone === 'professional') return `Action required: ${businessName} payment unsuccessful`
  return `We noticed something — your ${businessName} payment`
}

function getBody(businessName: string, customerName: string, amount: string, tone: Tone, day: Day): string {
  if (day === 14) {
    return `Hi ${customerName}, this is our final notice — your payment of ${amount} for ${businessName} is still outstanding. To keep your subscription active, please update your payment details today. After this, your account will be paused.`
  }
  if (tone === 'friendly') {
    return `Hey ${customerName}, just a quick heads up — we weren't able to process your payment of ${amount} for ${businessName}. No worries, it happens! Click below to update your card and keep your subscription running.`
  }
  if (tone === 'professional') {
    return `Dear ${customerName}, this is a reminder that your payment of ${amount} for ${businessName} was unsuccessful. Please update your payment method at your earliest convenience to avoid any interruption to your service.`
  }
  return `Hi ${customerName}, we noticed your payment of ${amount} for ${businessName} didn't go through — these things happen. We want to make sure you don't lose access. Could you take a moment to update your details?`
}

function getSignoff(businessName: string, tone: Tone): string {
  if (tone === 'friendly') return `Cheers,\nThe ${businessName} team`
  if (tone === 'professional') return `Regards,\nThe ${businessName} Billing Team`
  return `With care,\nThe ${businessName} team`
}

export function EmailDemo() {
  const [businessName, setBusinessName] = useState('Acme SaaS')
  const [customerName, setCustomerName] = useState('John')
  const [amount, setAmount] = useState('$49')
  const [tone, setTone] = useState<Tone>('friendly')
  const [day, setDay] = useState<Day>(0)

  const subject = getSubject(businessName || 'Your Company', tone, day)
  const body = getBody(businessName || 'Your Company', customerName || 'there', amount || '$0', tone, day)
  const signoff = getSignoff(businessName || 'Your Company', tone)

  return (
    <section className="py-24 lg:py-32 bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink">
            See exactly what your customers receive
          </h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">
            Customize the preview below — it updates in real time.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* LEFT: controls */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white border border-border rounded-2xl p-6 space-y-5"
          >
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-2">Business name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="Acme SaaS"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-2">Customer first name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="John"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-2">Amount</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="$49"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-2">Email tone</label>
              <div className="flex gap-2">
                {tones.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-150',
                      tone === t.value
                        ? 'bg-ink text-white border-ink'
                        : 'bg-white text-ink border-border hover:border-ink/30'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-2">Email sequence</label>
              <div className="flex gap-2">
                {days.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDay(d.value)}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-150',
                      day === d.value
                        ? 'bg-ink text-white border-ink'
                        : 'bg-white text-ink border-border hover:border-ink/30'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT: email preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Stripe default comparison card */}
            <div className="bg-cream border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Stripe default ↓</p>
              <p className="text-sm text-ink/60 font-mono bg-white border border-border rounded-lg px-4 py-3">
                &ldquo;Payment failed. Please update your payment method.&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-center">
              <span className="text-xs font-semibold text-accent uppercase tracking-wide">What Revorva sends ↓</span>
            </div>

            {/* Revorva email mockup */}
            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-card">
              {/* Accent top bar */}
              <div className="h-1 bg-[#C94A1F]" />

              {/* Email header */}
              <div className="bg-cream border-b border-border px-5 py-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs text-muted">From:</span>
                  <span className="text-xs text-ink font-medium">
                    {businessName || 'Your Company'} Billing &lt;billing@revorva.com&gt;
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-xs text-muted flex-shrink-0">Subject:</span>
                  <span className="text-xs text-ink font-medium">{subject}</span>
                </div>
              </div>

              {/* Email body */}
              <div className="px-6 py-6 space-y-4">
                <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-line">{body}</p>

                <div>
                  <span
                    className="inline-block text-sm font-semibold text-white px-5 py-2.5 rounded-lg cursor-default"
                    style={{ backgroundColor: '#C94A1F' }}
                  >
                    Update payment method →
                  </span>
                </div>

                <p className="text-sm text-muted whitespace-pre-line leading-relaxed">{signoff}</p>

                <p className="text-xs text-muted/50 pt-3 border-t border-border">
                  Sent by {businessName || 'Your Company'} · Powered by Revorva
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
