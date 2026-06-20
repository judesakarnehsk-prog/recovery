import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MRR Loss Calculator — Free SaaS Tool',
  description: 'See exactly how much failed payments cost your business every month. Based on industry benchmarks from Stripe, Recurly, and Profitwell.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
