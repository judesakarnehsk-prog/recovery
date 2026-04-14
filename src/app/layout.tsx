import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { SmoothScroll } from '@/lib/smooth-scroll'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
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
    'dunning emails',
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
    description:
      'Smart dunning that recovers subscription revenue on autopilot.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
}

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Revorva',
  description: 'Failed payment recovery and dunning management for SaaS businesses. Automatically retries charges and sends personalized dunning emails.',
  url: baseUrl,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: [
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '29',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '29',
        priceCurrency: 'USD',
        referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'MON' },
      },
    },
    {
      '@type': 'Offer',
      name: 'Growth',
      price: '79',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '79',
        priceCurrency: 'USD',
        referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'MON' },
      },
    },
    {
      '@type': 'Offer',
      name: 'Scale',
      price: '199',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '199',
        priceCurrency: 'USD',
        referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'MON' },
      },
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '127',
    bestRating: '5',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <SmoothScroll>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </SmoothScroll>
        <Analytics />
      </body>
    </html>
  )
}
