'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const CONSENT_KEY = 'cookie-consent'
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

function initGA() {
  if (!GA_ID || typeof window === 'undefined') return
  // Inject the GA script tags at runtime, only after explicit consent
  if (document.getElementById('ga-script')) return // already loaded

  const script1 = document.createElement('script')
  script1.id = 'ga-script'
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  script1.async = true
  document.head.appendChild(script1)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer!.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID)
}

// Extend Window type for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) {
      setVisible(true)
    } else if (consent === 'accepted') {
      // Returning visitor who already accepted — initialise GA immediately
      initGA()
    }
  }, [])

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
    initGA()
  }

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
    // GA is never loaded — no action needed
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4">
      <div
        className="max-w-3xl mx-auto rounded-xl shadow-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ backgroundColor: '#1a1a18', border: '1px solid #2e2d2a' }}
      >
        {/* Text */}
        <p className="text-sm flex-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
          We use cookies to understand how you use Revorva and improve your experience.
          See our{' '}
          <Link href="/privacy" className="underline hover:no-underline" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Privacy Policy
          </Link>
          {' '}for details.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="text-sm px-3.5 py-1.5 rounded-lg border transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.15)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: '#ffffff', color: '#0f0e0c' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            Accept
          </button>
          <button
            onClick={decline}
            className="transition-colors p-1 ml-1"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            aria-label="Decline and close"
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
