// Extend Window to include gtag so TypeScript knows about it
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

const CONSENT_KEY = 'cookie-consent'

export function hasConsent(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(CONSENT_KEY) === 'accepted'
}

export function trackEvent(name: string, params?: Record<string, any>): void {
  if (typeof window === 'undefined') return
  if (typeof window.gtag === 'function' && hasConsent()) {
    window.gtag('event', name, params)
  }
}
