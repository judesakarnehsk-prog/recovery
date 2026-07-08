import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#C94A1F',
}
import { Instrument_Serif, DM_Sans, Sora, JetBrains_Mono } from 'next/font/google'
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

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['600', '700', '800'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
  display: 'swap',
})

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://revorva.com'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Revorva — Recover Failed Stripe Payments Automatically',
    template: '%s | Revorva',
  },
  description:
    'Stop losing 4-9% of MRR to failed payments. Revorva connects to Stripe in 2 minutes and recovers up to 70% with AI dunning emails and smart retries.',
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
    title: 'Revorva — Recover Failed Stripe Payments Automatically',
    description:
      'Stop losing 4-9% of MRR to failed payments. Revorva connects to Stripe in 2 minutes and recovers up to 70% with AI dunning emails and smart retries.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Revorva',
    url: baseUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revorva — Recover Failed Stripe Payments Automatically',
    description: 'Stop losing 4-9% of MRR to failed payments. Revorva recovers up to 70% of failed Stripe payments with AI dunning emails.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable} ${sora.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-paper text-ink">
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  )
}

