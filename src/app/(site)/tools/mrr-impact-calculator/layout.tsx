import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Revorva ROI Calculator — How Much Would You Recover?',
  description: 'Calculate your exact recovery potential with Revorva. Enter your MRR and current recovery rate to see monthly and annual upside.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
