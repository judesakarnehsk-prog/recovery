import type { Metadata } from 'next'
import { Shield, Lock, Server, Globe, Bell, Building2, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Security at Revorva',
  description: 'How we keep your data — and your customers\' data — safe. Stripe OAuth, AES-256 encryption, GDPR compliance, and more.',
}

const sections = [
  {
    icon: Shield,
    title: 'Stripe connection security',
    content: [
      "We connect via Stripe's official OAuth — the same way you'd authorise Slack, Notion, or any trusted Stripe app.",
      'We request only the minimum permissions needed:',
    ],
    bullets: [
      'Read failed payment data',
      'Trigger payment retries',
      'Read customer email addresses for recovery emails',
    ],
    footer: 'We never request access to your Stripe balance or payouts.',
  },
  {
    icon: Lock,
    title: 'Data encryption',
    content: [
      'All data is encrypted in transit (TLS 1.3) and at rest (AES-256).',
      'Database hosted on Supabase with bank-level security infrastructure.',
      "No customer card details ever touch our systems — Stripe handles all sensitive payment data.",
    ],
    bullets: [],
    footer: null,
  },
  {
    icon: Server,
    title: 'Access control',
    content: [
      'Only authorised Revorva systems have access to your data.',
      'All employee access is logged and audited.',
      'Multi-factor authentication required for all team members.',
    ],
    bullets: [],
    footer: null,
  },
  {
    icon: Globe,
    title: 'Where your data lives',
    content: [
      'Data is stored in EU and US data centres (depending on your region).',
      'We are GDPR-compliant for EU customers.',
      'Data is never sold, shared, or used for marketing other products.',
    ],
    bullets: [],
    footer: null,
  },
  {
    icon: Bell,
    title: 'Incident response',
    content: [
      'In the unlikely event of a security incident, affected customers are notified within 72 hours per GDPR requirements.',
    ],
    bullets: [],
    footer: 'Security contact: security@revorva.com',
    footerLink: 'mailto:security@revorva.com',
  },
  {
    icon: Building2,
    title: 'Compliance',
    content: [
      'Operating under Humanaira Ltd, registered in England and Wales.',
      'Address: 167–169 Great Portland Street, London, W1W 5PF, UK',
      'VAT registered, ICO registered for data protection compliance.',
    ],
    bullets: [],
    footer: null,
  },
  {
    icon: AlertTriangle,
    title: 'Responsible disclosure',
    content: [
      'Found a security issue? We welcome responsible disclosure.',
      'We aim to respond within 48 hours.',
    ],
    bullets: [],
    footer: 'Email: security@revorva.com',
    footerLink: 'mailto:security@revorva.com',
  },
]

export default function SecurityPage() {
  return (
    <div className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-4">Security</p>
          <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight mb-4">
            Security at Revorva
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            How we keep your data — and your customers&apos; data — safe.
          </p>
          <p className="mt-4 text-sm text-muted">
            You can also email the founders directly at{' '}
            <a href="mailto:founders@revorva.com" className="text-accent hover:underline">
              founders@revorva.com
            </a>{' '}
            — we read and reply to every message.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title} className="bg-white border border-border rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0 mt-0.5">
                  <section.icon className="w-5 h-5 text-accent" />
                </div>
                <h2 className="font-display text-xl text-ink leading-snug">{section.title}</h2>
              </div>
              <div className="pl-14 space-y-2">
                {section.content.map((line, i) => (
                  <p key={i} className="text-muted leading-relaxed">{line}</p>
                ))}
                {section.bullets.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="text-muted text-sm">{bullet}</li>
                    ))}
                  </ul>
                )}
                {section.footer && (
                  <p className="text-sm text-muted mt-3 pt-3 border-t border-border">
                    {section.footerLink ? (
                      <>
                        {section.footer.split(section.footerLink.replace('mailto:', ''))[0]}
                        <a href={section.footerLink} className="text-accent hover:underline">
                          {section.footerLink.replace('mailto:', '')}
                        </a>
                      </>
                    ) : section.footer}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 p-6 bg-cream rounded-2xl border border-border text-center">
          <p className="text-sm text-muted leading-relaxed">
            Security is an ongoing commitment, not a checkbox. If you have questions about how we handle your data, email us at{' '}
            <a href="mailto:security@revorva.com" className="text-accent hover:underline">
              security@revorva.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
