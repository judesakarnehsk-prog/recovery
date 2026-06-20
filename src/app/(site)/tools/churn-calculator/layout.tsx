import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Churn Cost Calculator — Free SaaS Tool',
  description: 'Calculate the true lifetime cost of every churned customer. Includes LTV, CAC, and annual revenue impact.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
