import { Hero } from '@/components/marketing/Hero'
import { Problem } from '@/components/marketing/Problem'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { Features } from '@/components/marketing/Features'
import { EmailPreview } from '@/components/marketing/EmailPreview'
import { Pricing } from '@/components/marketing/Pricing'
import { Testimonials } from '@/components/marketing/Testimonials'
import { FinalCTA } from '@/components/marketing/FinalCTA'

// Logo bar companies
const companies = ['Launchpad', 'Growthly', 'Stackr', 'Notifi', 'Pulseboard', 'Revio']

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Logo bar */}
      <div className="bg-cream border-y border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-semibold text-muted uppercase tracking-widest mb-5">
            Used by founders at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {companies.map((name) => (
              <span key={name} className="text-sm font-medium text-muted/70 font-display italic">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Problem />
      <HowItWorks />
      <Features />
      <EmailPreview />
      <Pricing />
      <Testimonials />
      <FinalCTA />
    </>
  )
}
