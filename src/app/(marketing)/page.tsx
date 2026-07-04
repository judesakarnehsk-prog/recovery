import { Hero } from '@/components/marketing/Hero'
import { Problem } from '@/components/marketing/Problem'
import { MrrCalculator } from '@/components/marketing/MrrCalculator'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { ProductDemo } from '@/components/marketing/ProductDemo'
import { Features } from '@/components/marketing/Features'
import { EmailDemo } from '@/components/marketing/EmailDemo'
import { ComparisonTable } from '@/components/marketing/ComparisonTable'
import { IntegrationsRoadmap } from '@/components/marketing/IntegrationsRoadmap'
import { SecurityTrust } from '@/components/marketing/SecurityTrust'
import { FounderStory } from '@/components/marketing/FounderStory'
import { Pricing } from '@/components/marketing/Pricing'
import { IndustryStats } from '@/components/marketing/IndustryStats'
import { RecentActivity } from '@/components/marketing/RecentActivity'
import { FinalCTA } from '@/components/marketing/FinalCTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <MrrCalculator />
      <HowItWorks />
      <ProductDemo />
      <Features />
      <EmailDemo />
      <ComparisonTable />
      <IntegrationsRoadmap />
      <SecurityTrust />
      <FounderStory />
      <Pricing />
      <IndustryStats />
      <RecentActivity />
      <FinalCTA />
    </>
  )
}
