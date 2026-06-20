import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Target, Shield, Zap, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Revorva — the payment recovery platform built for subscription businesses.',
}

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description: 'We believe no business should lose revenue to preventable payment failures. Every dollar recovered is a customer retained.',
  },
  {
    icon: Shield,
    title: 'Trust & Security',
    description: "Your data never touches our servers beyond what Stripe provides. We use OAuth connections and all payment data stays inside Stripe.",
  },
  {
    icon: Zap,
    title: 'Simplicity First',
    description: 'Complex problems deserve simple solutions. Revorva takes 2 minutes to set up and works on autopilot from day one.',
  },
]

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
          Built by founders, for founders
        </h1>
        <div className="mt-8 space-y-5 text-muted leading-relaxed">
          <p>
            Revorva was founded by SaaS operators who watched too many businesses lose revenue to broken payment recovery. We built Revorva to be the tool we wished existed when we needed it.
          </p>
          <p>
            The observation was simple: subscription businesses lose 4–9% of their revenue to failed payments every month — and most don&apos;t even realise it. Cards expire, banks decline, subscriptions quietly cancel. Revenue evaporates without a single cancellation notification.
          </p>
          <p>
            The crazy part: most of these failed payments are completely recoverable. The customer never meant to churn. They just needed someone to ask them to update their card — at the right time, in the right way. Stripe wasn&apos;t doing it well enough. So we built something better.
          </p>
          <p>
            We&apos;re a small remote team operating under Humanaira Ltd, a registered company in London, UK. We respond to every customer email within 24 hours.
          </p>
        </div>

        {/* Founder contact */}
        <div className="mt-8 flex items-center gap-3 p-4 bg-cream rounded-xl border border-border">
          <Mail className="w-5 h-5 text-accent flex-shrink-0" />
          <p className="text-sm text-muted">
            You can email the founders directly at{' '}
            <a href="mailto:founders@revorva.com" className="text-accent hover:underline font-medium">
              founders@revorva.com
            </a>{' '}
            — we read and reply to every message.
          </p>
        </div>

        <div className="mt-16 space-y-8">
          {values.map((value) => (
            <div key={value.title} className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
                <value.icon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">{value.title}</h3>
                <p className="mt-1 text-muted leading-relaxed">{value.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-cream rounded-2xl border border-border">
          <h2 className="font-display text-2xl text-ink mb-3">Based in London</h2>
          <p className="text-muted leading-relaxed">
            Revorva is operated by Humanaira Ltd, a registered company in England and Wales. 167–169 Great Portland Street, London, W1W 5PF, UK.
          </p>
        </div>

        <div className="mt-12">
          <Link href="/signup">
            <Button variant="accent" size="lg" className="group">
              Start Recovering Revenue
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
