'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const sections = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'connecting-stripe', label: 'Connecting Stripe' },
  { id: 'email-branding', label: 'Email Branding' },
  { id: 'custom-domain', label: 'Custom Domain' },
  { id: 'recovery-schedule', label: 'Recovery Schedule' },
  { id: 'pause-skip', label: 'Recovery Status & Pause' },
  { id: 'billing', label: 'Plans & Billing' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Need More Help?' },
]

const faqItems = [
  {
    q: 'How long does it take to set up?',
    a: 'About 2 minutes. Connect your Stripe account via OAuth, set your business name, and Revorva starts watching for failed payments immediately.',
  },
  {
    q: 'Does Revorva charge a percentage of recovered revenue?',
    a: 'No. We charge a flat monthly fee only. You keep 100% of what you recover.',
  },
  {
    q: 'What happens if a payment can\'t be recovered?',
    a: 'After the 14-day sequence (Day 0, 3, 7, 14), the recovery job is marked as Failed in your dashboard. You can review it and decide on next steps manually.',
  },
  {
    q: 'Which payment processors do you support?',
    a: 'Stripe only, for now. We plan to add Paddle and Braintree in future releases.',
  },
  {
    q: 'Can I pause recovery for all customers at once?',
    a: 'Yes. Go to Settings → Recovery Status → Pause Recovery. All new failures will be held, and existing pending jobs will pause.',
  },
  {
    q: 'Can I skip recovery for a specific customer?',
    a: 'Yes. Go to Recoveries, find the customer\'s row, and click Skip. That job will stop and no further emails will be sent.',
  },
  {
    q: 'Will customers know they\'re receiving automated dunning emails?',
    a: 'Emails come from your business name (e.g. "Acme Inc via billing@revorva.com") or your own domain on Growth+ plans. They read naturally and don\'t mention Revorva.',
  },
  {
    q: 'What email address do the recovery emails come from?',
    a: 'By default, billing@revorva.com with your business name as the sender name. Growth+ plans can use a custom domain like billing@yourdomain.com.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'Go to Billing in your dashboard and click "Cancel subscription". Your access continues until the end of your billing period.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'Your data is retained for 30 days after cancellation, then permanently deleted. You can export your recovery history before cancelling.',
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="pt-24 pb-20 lg:pt-32 bg-paper min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mb-10">
          <h1 className="font-display text-4xl lg:text-5xl text-ink mb-3">
            Help &amp;{' '}
            <em style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic', color: '#c8401a' }}>
              Documentation
            </em>
          </h1>
          <p className="text-muted text-lg">Everything you need to get Revorva working for your business.</p>
        </div>

        {/* Search bar (cosmetic v1) */}
        <div className="relative max-w-xl mb-12">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation…"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 text-ink placeholder:text-muted"
          />
        </div>

        <div className="flex gap-10 items-start">
          {/* Sticky sidebar */}
          <nav className="hidden lg:block w-52 flex-shrink-0 sticky top-8">
            <p className="text-xs font-semibold text-ink uppercase tracking-widest mb-3">On this page</p>
            <ul className="space-y-0.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => scrollTo(s.id)}
                    className="flex items-center gap-1.5 w-full text-left text-sm text-muted hover:text-ink transition-colors py-1 px-2 rounded-lg hover:bg-cream"
                  >
                    <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-40" />
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-16">

            {/* 1. Getting Started */}
            <section id="getting-started" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold text-ink mb-4">Getting Started</h2>

              <div className="bg-white border border-border rounded-2xl p-6 mb-5">
                <h3 className="text-base font-semibold text-ink mb-2">Welcome to Revorva</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Revorva is a revenue recovery tool for Stripe businesses. When a subscription payment fails, Revorva automatically detects it, generates a personalised dunning email using AI, and sends it to your customer — all without you lifting a finger. Over a 14-day sequence, it gives each failed payment multiple chances to recover.
                </p>
              </div>

              <div className="bg-white border border-border rounded-2xl p-6 mb-5">
                <h3 className="text-base font-semibold text-ink mb-3">What Revorva does</h3>
                <ul className="space-y-2">
                  {[
                    'Listens for failed Stripe invoice payments in real time via webhooks',
                    'Generates AI-personalised recovery emails matched to your brand tone',
                    'Sends emails on a smart schedule: Day 0, 3, 7, and 14',
                    'Tracks recovery status (Pending → Recovered / Failed) in your dashboard',
                    'Marks a recovery as complete the moment the customer updates their payment',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted">
                      <span className="text-accent mt-0.5">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-sm text-muted">
                New user?{' '}
                <Link href="/onboarding" className="text-accent hover:underline font-medium">
                  Start the onboarding wizard →
                </Link>
              </p>
            </section>

            {/* 2. Connecting Stripe */}
            <section id="connecting-stripe" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold text-ink mb-4">Connecting Stripe</h2>

              <div className="space-y-4">
                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-2">How OAuth works</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Revorva uses Stripe Connect OAuth — you authorise Revorva to read your Stripe data without sharing your API keys. Stripe handles the authentication and issues a scoped access token directly to us.
                  </p>
                </div>

                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-3">What permissions Revorva requests</h3>
                  <ul className="space-y-1.5">
                    {[
                      'Read invoices and payment intents',
                      'Read customer email addresses (to send recovery emails)',
                      'Read subscription data',
                    ].map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted/70 mt-3">We never access your Stripe balance, payouts, or account settings.</p>
                </div>

                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-2">How to disconnect</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Go to <Link href="/settings" className="text-accent hover:underline">Settings</Link> → scroll to the Stripe section → click <strong>Disconnect Stripe</strong>. Recovery will pause automatically. Your recovery history is preserved.
                  </p>
                </div>

                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-2">Troubleshooting connection issues</h3>
                  <ul className="space-y-2 text-sm text-muted">
                    <li><strong className="text-ink">Redirect error:</strong> Make sure you're connecting the correct Stripe account (the one with active subscriptions).</li>
                    <li><strong className="text-ink">Permission denied:</strong> You must be an administrator on the Stripe account to authorise the connection.</li>
                    <li><strong className="text-ink">Connection not showing:</strong> Refresh the page. If it still shows as disconnected, try connecting again from Settings.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. Email Branding */}
            <section id="email-branding" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold text-ink mb-4">Email Branding</h2>

              <div className="space-y-4">
                {[
                  {
                    title: 'Business name',
                    body: 'Shown in the email sender name (e.g. "Acme Inc via billing@revorva.com") and in the email body. Set this in Settings or Email Branding.',
                  },
                  {
                    title: 'Brand color',
                    body: 'Used for the CTA button and accent line in recovery emails. Enter a hex value or use the colour picker. Available on Growth+ plans.',
                  },
                  {
                    title: 'Logo upload',
                    body: 'Upload a PNG or JPG file (max 2MB). Your logo appears at the top of every recovery email. Available on Growth+ plans.',
                  },
                ].map((item) => (
                  <div key={item.title} className="bg-white border border-border rounded-2xl p-6">
                    <h3 className="text-base font-semibold text-ink mb-2">{item.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{item.body}</p>
                  </div>
                ))}

                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-3">Email tone options</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { tone: 'Friendly', desc: 'Warm and understanding. Best for consumer apps and lifestyle products.' },
                      { tone: 'Professional', desc: 'Formal and polished. Best for B2B SaaS and financial tools.' },
                      { tone: 'Direct', desc: 'Clear and concise. Best for developer tools and technical products.' },
                      { tone: 'Empathetic', desc: 'Caring and personal. Best for health, education, and community products.' },
                    ].map((t) => (
                      <div key={t.tone} className="p-3 bg-cream rounded-xl">
                        <p className="text-sm font-medium text-ink">{t.tone}</p>
                        <p className="text-xs text-muted mt-0.5">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Custom Domain */}
            <section id="custom-domain" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold text-ink mb-1">Custom Domain</h2>
              <p className="text-xs text-accent font-medium mb-4">Growth+ only</p>

              <div className="space-y-4">
                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-2">What it is</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Instead of emails sending from <code className="text-xs bg-cream px-1.5 py-0.5 rounded">billing@revorva.com</code>, they'll come from your own domain — for example <code className="text-xs bg-cream px-1.5 py-0.5 rounded">billing@yourdomain.com</code>.
                  </p>
                </div>

                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-2">Why it matters</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Emails from your own domain build trust with customers, improve deliverability, and reduce the chance of landing in spam. Customers are more likely to open and act on emails from a domain they recognise.
                  </p>
                </div>

                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-3">Step-by-step DNS setup</h3>
                  <ol className="space-y-3 text-sm text-muted">
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center flex-shrink-0 font-semibold">1</span>
                      Go to <Link href="/settings" className="text-accent hover:underline">Settings</Link> → Custom Domain → enter your domain (e.g. <code className="text-xs bg-cream px-1 py-0.5 rounded">yourdomain.com</code>).
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center flex-shrink-0 font-semibold">2</span>
                      Revorva will generate a DNS TXT record (e.g. <code className="text-xs bg-cream px-1 py-0.5 rounded">revorva-verify=xxxxxx</code>).
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center flex-shrink-0 font-semibold">3</span>
                      Log in to your DNS provider and add the TXT record to your domain.
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center flex-shrink-0 font-semibold">4</span>
                      Return to Settings and click <strong>Verify domain</strong>. DNS changes can take up to 48 hours to propagate.
                    </li>
                  </ol>
                </div>

                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-3">Supported DNS providers</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Cloudflare', 'GoDaddy', 'Namecheap', 'Google Domains', 'Route 53 (AWS)', 'Hover', 'Porkbun', 'Gandi'].map((p) => (
                      <span key={p} className="text-xs bg-cream text-muted border border-border px-2.5 py-1 rounded-full">{p}</span>
                    ))}
                  </div>
                  <p className="text-xs text-muted mt-3">
                    Any provider that supports TXT records will work. Contact <a href="mailto:support@revorva.com" className="text-accent hover:underline">support@revorva.com</a> if you need help with a specific provider.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Recovery Schedule */}
            <section id="recovery-schedule" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold text-ink mb-4">The 14-Day Recovery Schedule</h2>

              <div className="space-y-4">
                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-4">The schedule</h3>
                  <div className="space-y-3">
                    {[
                      { day: 'Day 0', label: 'Immediate', desc: 'Email sent within minutes of the failed payment.' },
                      { day: 'Day 3', label: '3 days later', desc: 'Follow-up email if payment still hasn\'t been updated.' },
                      { day: 'Day 7', label: '7 days later', desc: 'Third email with a stronger urgency signal.' },
                      { day: 'Day 14', label: '14 days later', desc: 'Final email before the recovery job closes.' },
                    ].map((step) => (
                      <div key={step.day} className="flex items-start gap-4">
                        <div className="w-14 flex-shrink-0">
                          <span className="text-xs font-semibold text-accent bg-accent-light px-2 py-0.5 rounded-full">{step.day}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">{step.label}</p>
                          <p className="text-xs text-muted mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-2">Why this schedule?</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Research across SaaS businesses shows that most recoverable payments are resolved within 7 days. The Day 0 email catches customers who forgot to update an expired card. Days 3 and 7 capture those who were busy. Day 14 is a final attempt before the payment is considered unrecoverable.
                  </p>
                </div>

                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-2">Emails vs silent retries</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Revorva sends emails to prompt customers to update their payment method. Stripe itself may also attempt automatic retries of the charge in the background according to your Stripe retry settings — these are separate from Revorva's email sequence.
                  </p>
                </div>
              </div>
            </section>

            {/* 6. Pause / Skip */}
            <section id="pause-skip" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold text-ink mb-4">Recovery Status &amp; Pause</h2>

              <div className="space-y-4">
                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-2">How to pause recovery</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Go to <Link href="/settings" className="text-accent hover:underline">Settings</Link> → Recovery Status → click <strong>Pause Recovery</strong>. Or use the Pause button on the dashboard banner. New failed payments won't trigger recovery emails, and pending jobs will be held.
                  </p>
                </div>

                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-2">After a Stripe disconnect</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    If you disconnect Stripe (or Stripe revokes access), recovery pauses automatically. Once you reconnect, recovery stays paused — click <strong>Resume</strong> in the dashboard or Settings to restart it. This prevents an accidental email blast after reconnecting.
                  </p>
                </div>

                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-2">Per-customer skip</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    To stop recovery for a specific customer without pausing everyone else, go to <Link href="/recoveries" className="text-accent hover:underline">Recoveries</Link>, find the row, and click <strong>Skip</strong>. The job status changes to Skipped and no further emails are sent. If the customer later updates their payment, the recovery is still marked as Recovered.
                  </p>
                </div>
              </div>
            </section>

            {/* 7. Billing */}
            <section id="billing" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold text-ink mb-4">Plans &amp; Billing</h2>

              <div className="space-y-4">
                <div className="bg-white border border-border rounded-2xl p-6 overflow-x-auto">
                  <h3 className="text-base font-semibold text-ink mb-4">What each plan includes</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide pb-2 pr-4">Feature</th>
                        <th className="text-center text-xs font-semibold text-muted uppercase tracking-wide pb-2 px-4">Starter</th>
                        <th className="text-center text-xs font-semibold text-accent uppercase tracking-wide pb-2 px-4">Growth</th>
                        <th className="text-center text-xs font-semibold text-muted uppercase tracking-wide pb-2 pl-4">Scale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        ['Price', '$29/mo', '$79/mo', '$149/mo'],
                        ['MRR limit', 'Up to $10k', 'Up to $50k', 'Unlimited'],
                        ['Recovery emails', '✓', '✓', '✓'],
                        ['Smart retry schedule', '✓', '✓', '✓'],
                        ['AI-personalised emails', '—', '✓', '✓'],
                        ['Custom email domain', '—', '✓', '✓'],
                        ['Brand color & logo', '—', '✓', '✓'],
                        ['Unlimited domains', '—', '—', '✓'],
                        ['Dedicated account manager', '—', '—', '✓'],
                      ].map(([feature, ...plans]) => (
                        <tr key={feature}>
                          <td className="py-2.5 pr-4 text-muted">{feature}</td>
                          {plans.map((val, i) => (
                            <td key={i} className={cn('py-2.5 px-4 text-center', val === '✓' ? 'text-green-600' : val === '—' ? 'text-muted/40' : 'text-ink font-medium')}>
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-2">14-day free trial</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    All plans start with a 14-day free trial. No credit card is required to sign up. On day 15, if you haven't cancelled, your chosen plan begins. We'll email you a reminder on day 12.
                  </p>
                </div>

                <div className="bg-white border border-border rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-ink mb-2">Upgrade, downgrade, or cancel</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Go to <Link href="/billing" className="text-accent hover:underline">Billing</Link> in your dashboard. Upgrades take effect immediately. Cancellations take effect at the end of your current billing period. Your data is retained for 30 days after cancellation.
                  </p>
                </div>
              </div>
            </section>

            {/* 8. FAQ */}
            <section id="faq" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold text-ink mb-4">FAQ</h2>
              <div className="bg-white border border-border rounded-2xl divide-y divide-border">
                {faqItems.map((item) => (
                  <FaqRow key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </section>

            {/* 9. Contact */}
            <section id="contact" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold text-ink mb-4">Need More Help?</h2>
              <div className="bg-white border border-border rounded-2xl p-8 text-center">
                <p className="text-sm text-muted mb-4 leading-relaxed max-w-md mx-auto">
                  Our team typically responds within 24 hours on business days. For urgent issues affecting live recovery, mention it in the subject line.
                </p>
                <a
                  href="mailto:support@revorva.com"
                  className="inline-block text-sm font-semibold text-white bg-accent hover:bg-accent/90 px-5 py-2.5 rounded-xl transition-colors"
                >
                  Email support@revorva.com
                </a>
                <p className="text-xs text-muted mt-4">Response time: within 24 hours · Mon–Fri</p>
              </div>
            </section>

            {/* Last updated */}
            <p className="text-xs text-muted/60 pt-4 border-t border-border">
              Last updated: April 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-cream/40 transition-colors"
      >
        <span className="text-sm font-medium text-ink pr-4">{q}</span>
        <ChevronRight className={cn('w-4 h-4 text-muted flex-shrink-0 transition-transform duration-200', open && 'rotate-90')} />
      </button>
      {open && (
        <p className="px-6 pb-4 text-sm text-muted leading-relaxed">{a}</p>
      )}
    </div>
  )
}
