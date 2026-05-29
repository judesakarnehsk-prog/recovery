import { Hero } from '@/components/marketing/Hero'
import { Problem } from '@/components/marketing/Problem'
import { MrrCalculator } from '@/components/marketing/MrrCalculator'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { Features } from '@/components/marketing/Features'
import { EmailDemo } from '@/components/marketing/EmailDemo'
import { ComparisonTable } from '@/components/marketing/ComparisonTable'
import { SecurityTrust } from '@/components/marketing/SecurityTrust'
import { Pricing } from '@/components/marketing/Pricing'
import { IndustryStats } from '@/components/marketing/IndustryStats'
import { FinalCTA } from '@/components/marketing/FinalCTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <MrrCalculator />
      <HowItWorks />
      <Features />
      <EmailDemo />
      <ComparisonTable />
      <SecurityTrust />
      <Pricing />
      <IndustryStats />
      <FinalCTA />
    </>
  )
}
