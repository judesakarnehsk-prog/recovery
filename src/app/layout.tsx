import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#C94A1F',
}
import { Instrument_Serif, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { CookieBanner } from '@/components/CookieBanner'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://revorva.com'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Revorva – Recover Failed Payments Automatically',
    template: '%s | Revorva',
  },
  description:
    'Stop losing revenue to failed payments. Revorva auto-retries charges, sends personalized dunning emails, and recovers your subscription revenue on autopilot.',
  keywords: [
    'payment recovery',
    'dunning',
    'failed payments',
    'subscription billing',
    'churn reduction',
    'involuntary churn',
    'Stripe',
    'SaaS',
    'revenue recovery',
  ],
  openGraph: {
    title: 'Revorva – Recover Failed Payments Automatically',
    description:
      'Stop losing revenue to failed payments. Smart dunning that recovers subscription revenue on autopilot.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Revorva',
    url: baseUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revorva – Recover Failed Payments Automatically',
    description: 'Smart dunning that recovers subscription revenue on autopilot.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased bg-paper text-ink">
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  )
}
