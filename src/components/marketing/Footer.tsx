import Link from 'next/link'
import { MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative bg-paper border-t border-border overflow-hidden">
      {/* Background watermark */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none"
        aria-hidden="true"
      >
        <span
          className="font-display italic whitespace-nowrap leading-none block"
          style={{
            fontSize: 'clamp(100px, 16vw, 220px)',
            color: '#0f0e0c',
            opacity: 0.055,
            letterSpacing: '-0.04em',
            paddingRight: '0.12em',
            lineHeight: 0.85,
          }}
        >
          revorva
        </span>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main footer content */}
        <div className="py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-base font-bold text-ink font-sans block mb-3">
              Revorva<span className="text-accent">.</span>
            </span>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Recover failed subscription payments automatically with smart dunning sequences.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-xs font-semibold text-ink uppercase tracking-widest mb-4">Product</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Features', href: '/features' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'FAQ', href: '/faq' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted hover:text-ink transition-colors duration-150">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-xs font-semibold text-ink uppercase tracking-widest mb-4">Company</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'About', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Refund Policy', href: '/refund' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted hover:text-ink transition-colors duration-150">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-semibold text-ink uppercase tracking-widest mb-4">Support</h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:support@revorva.com"
                  className="text-sm text-muted hover:text-ink transition-colors duration-150"
                >
                  support@revorva.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted leading-relaxed">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-50" />
                <address className="not-italic">
                  167–169 Great Portland St<br />
                  London, W1W 5PF, UK
                </address>
              </li>
              <li>
                <Link href="/help" className="text-sm text-muted hover:text-ink transition-colors duration-150">
                  Help &amp; Docs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted">
              © {new Date().getFullYear()} Revorva. All rights reserved.
            </p>
            <p className="text-xs text-muted/60 mt-0.5">
              A Humanaira Ltd product
            </p>
          </div>
          <a
            href="https://stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted/60 hover:text-muted transition-colors"
          >
            Payments powered by Stripe
          </a>
        </div>
      </div>
    </footer>
  )
}
