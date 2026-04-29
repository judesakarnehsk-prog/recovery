import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Target, Shield, Zap } from 'lucide-react'
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
    description: 'Your data never touches our servers beyond what Stripe provides. We use OAuth connections and maintain SOC 2 readiness.',
  },
  {
    icon: Zap,
    title: 'Simplicity First',
    description: 'Complex problems deserve simple solutions. Revorva takes 5 minutes to set up and works on autopilot from day one.',
  },
]

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary leading-tight">
          Built for subscription businesses that want to{' '}
          <span className="gradient-text">stop losing revenue</span>
        </h1>
        <p className="mt-6 text-lg text-text-secondary leading-relaxed">
          Revorva was born from a simple observation: subscription businesses lose up to 15% of their
          revenue to failed payments — and most don&apos;t even realize it. Expired cards, insufficient funds,
          and processing errors silently drain revenue every month.
        </p>
        <p className="mt-4 text-lg text-text-secondary leading-relaxed">
          We built Revorva to solve this problem with smart automation. By combining intelligent retry
          logic with personalized dunning email sequences, we recover revenue that would otherwise be
          lost — without requiring any manual effort from your team.
        </p>

        <div className="mt-16 space-y-8">
          {values.map((value) => (
            <div key={value.title} className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <value.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">{value.title}</h3>
                <p className="mt-1 text-text-secondary leading-relaxed">{value.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-gray-50 rounded-2xl border border-border">
          <h2 className="text-2xl font-bold text-text-primary mb-3">Based in London</h2>
          <p className="text-text-secondary leading-relaxed">
            Revorva is headquartered at 167-169 Great Portland Street, 5th Floor, London, W1W 5PF,
            United Kingdom. We serve subscription businesses globally.
          </p>
        </div>

        <div className="mt-12">
          <Link href="/signup">
            <Button variant="primary" size="lg" className="group">
              Start Recovering Revenue
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
