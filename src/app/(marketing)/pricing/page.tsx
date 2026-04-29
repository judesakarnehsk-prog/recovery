import type { Metadata } from 'next'
import { Pricing } from '@/components/marketing/Pricing'
import { FinalCTA } from '@/components/marketing/FinalCTA'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, flat-rate pricing. Starts at $29/mo. 14-day free trial, no credit card required.',
}

export default function PricingPage() {
  return (
    <>
      <div className="pt-20">
        <Pricing />
      </div>
      <FinalCTA />
    </>
  )
}
