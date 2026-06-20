'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, CheckCircle2, RefreshCw, AlertCircle, Link2, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

const slides = [
  {
    title: 'Connect your Stripe account',
    caption: 'One click. No code. We handle the rest.',
    accentCaption: 'One click.',
    icon: Link2,
    mockup: 'connect',
  },
  {
    title: 'Customize your email branding',
    caption: 'Match your brand. Set your tone. Add your logo.',
    accentCaption: 'Match your brand.',
    icon: Palette,
    mockup: 'branding',
  },
  {
    title: 'Watch recoveries happen',
    caption: 'Real-time view of every recovery in progress.',
    accentCaption: 'Real-time view.',
    icon: RefreshCw,
    mockup: 'recoveries',
  },
  {
    title: 'AI-personalized emails go out automatically',
    caption: 'Each email is unique. Sounds human. Converts better.',
    accentCaption: 'Sounds human.',
    icon: CheckCircle2,
    mockup: 'email',
  },
  {
    title: 'Track your recovered revenue',
    caption: 'Every recovered dollar is visible. No more silent churn.',
    accentCaption: 'No more silent churn.',
    icon: CheckCircle2,
    mockup: 'dashboard',
  },
]

// ── In-code mockup renderers ────────────────────────────────────────────────

function MacFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-elevated bg-white">
      {/* macOS-style titlebar */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 bg-cream border-b border-border">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-amber-400" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-3 flex-1 h-5 bg-border/50 rounded text-[10px] text-muted flex items-center justify-center">
          app.revorva.com
        </span>
        <span className="text-[9px] text-muted/40 font-medium uppercase tracking-wider">Preview</span>
      </div>
      {children}
    </div>
  )
}

function ConnectMockup() {
  return (
    <MacFrame>
      <div className="p-8 flex flex-col items-center justify-center min-h-[240px] bg-paper gap-5">
        <div className="text-center">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Step 2 of 4</p>
          <h3 className="text-xl font-bold text-ink mb-1">Connect your Stripe account</h3>
          <p className="text-sm text-muted">Authorize Revorva via Stripe&apos;s official OAuth. Read-only.</p>
        </div>
        <button className="flex items-center gap-2.5 bg-[#635BFF] text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md">
          <svg viewBox="0 0 16 16" className="w-4 h-4 fill-white"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 9.1c-.2.8-1 1.5-2.3 1.5-1 0-1.7-.4-2.1-1l-.3 1H5.6l1.3-6.5h1.7l-.4 2c.5-.6 1.1-.9 1.9-.9 1.3 0 2 .8 1.8 2l-.4 1.9zm-1.3-.3.3-1.5c.1-.6-.1-1-.7-1-.5 0-.9.3-1.1.8l-.4 1.7c.2.4.6.6 1.1.6.5 0 .7-.2.8-.6z"/></svg>
          Connect with Stripe
        </button>
        <p className="text-xs text-muted/60">Stripe OAuth · Read-only permissions · Revoke anytime</p>
      </div>
    </MacFrame>
  )
}

function BrandingMockup() {
  return (
    <MacFrame>
      <div className="flex min-h-[240px]">
        <div className="w-1/2 p-5 border-r border-border space-y-3">
          <p className="text-xs font-semibold text-ink uppercase tracking-wide">Email Branding</p>
          <div>
            <p className="text-xs text-muted mb-1">Business name</p>
            <div className="border border-border rounded-lg px-3 py-1.5 text-xs text-ink">Acme SaaS</div>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Brand color</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: '#C94A1F' }} />
              <div className="border border-border rounded-lg px-2 py-1 text-xs font-mono text-ink">#C94A1F</div>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Email tone</p>
            <div className="flex gap-1">
              {['Friendly', 'Pro', 'Empathetic'].map((t, i) => (
                <span key={t} className={cn('text-[10px] px-2 py-1 rounded-md font-medium', i === 0 ? 'bg-ink text-white' : 'border border-border text-muted')}>{t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="w-1/2 p-5 bg-cream/50 flex flex-col">
          <p className="text-[10px] text-muted uppercase tracking-wide mb-2">Live preview</p>
          <div className="bg-white rounded-lg border border-border overflow-hidden text-xs flex-1">
            <div className="h-0.5 bg-[#C94A1F]" />
            <div className="p-3 space-y-1.5">
              <p className="text-muted text-[10px]">From: Acme SaaS Billing</p>
              <p className="text-ink font-medium text-[10px]">Quick note about your payment</p>
              <div className="border-t border-border pt-2">
                <p className="text-muted text-[10px] leading-relaxed">Hey Sarah, just a heads up — your payment of $49 didn&apos;t go through…</p>
                <div className="mt-2 inline-block bg-[#C94A1F] text-white text-[9px] font-medium px-2 py-1 rounded">Update payment →</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MacFrame>
  )
}

function RecoveriesMockup() {
  const rows = [
    { email: 'sarah@example.com', amount: '$79', status: 'Recovered', step: 'Day 3', statusColor: 'text-green-700 bg-green-50' },
    { email: 'james@acme.io', amount: '$149', status: 'Email sent', step: 'Day 0', statusColor: 'text-amber-700 bg-amber-50' },
    { email: 'lena@startup.co', amount: '$49', status: 'Pending', step: 'Day 7', statusColor: 'text-blue-700 bg-blue-50' },
    { email: 'tom@venture.com', amount: '$299', status: 'Recovered', step: 'Day 7', statusColor: 'text-green-700 bg-green-50' },
  ]
  return (
    <MacFrame>
      <div className="p-4 min-h-[240px]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-ink">Recoveries</p>
          <span className="text-[10px] text-muted bg-cream border border-border rounded-full px-2 py-0.5">4 active</span>
        </div>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="text-left pb-2 font-medium">Customer</th>
              <th className="text-left pb-2 font-medium">Amount</th>
              <th className="text-left pb-2 font-medium">Status</th>
              <th className="text-left pb-2 font-medium">Step</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0">
                <td className="py-2 text-ink">{r.email}</td>
                <td className="py-2 font-medium text-ink">{r.amount}</td>
                <td className="py-2">
                  <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-medium', r.statusColor)}>{r.status}</span>
                </td>
                <td className="py-2 text-muted">{r.step}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MacFrame>
  )
}

function EmailMockup() {
  return (
    <MacFrame>
      <div className="min-h-[240px] bg-[#F5F2EC] p-4">
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card max-w-sm mx-auto">
          <div className="h-0.5 bg-[#C94A1F]" />
          <div className="bg-cream border-b border-border px-4 py-3">
            <p className="text-[10px] text-muted">From: <span className="text-ink font-medium">Acme SaaS Billing &lt;billing@revorva.com&gt;</span></p>
            <p className="text-[10px] text-ink font-medium mt-0.5">Hey, quick note about your Acme SaaS payment</p>
          </div>
          <div className="px-4 py-4 space-y-2.5 text-[11px]">
            <p className="text-ink/80 leading-relaxed">
              Hey <strong>Sarah</strong>, just a quick heads up — we weren&apos;t able to process your payment of <strong>$79</strong> for Acme SaaS. No worries, it happens!
            </p>
            <div>
              <span className="inline-block bg-[#C94A1F] text-white text-[10px] font-semibold px-3 py-1.5 rounded-md">
                Update payment method →
              </span>
            </div>
            <p className="text-[10px] text-muted/50 pt-1 border-t border-border">Sent by Acme SaaS · Powered by Revorva</p>
          </div>
        </div>
      </div>
    </MacFrame>
  )
}

function DashboardMockup() {
  return (
    <MacFrame>
      <div className="p-5 min-h-[240px] space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Revenue Recovered This Month</p>
            <p className="text-3xl font-bold text-ink">$4,280</p>
          </div>
          <span className="text-[10px] font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">+23%</span>
        </div>
        <div className="flex items-end gap-0.5 h-10">
          {[35,50,42,65,55,78,62,80,70,90,75,95].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i >= 9 ? '#C94A1F' : '#ede9e0' }} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total recoveries', value: '37' },
            { label: 'Recovery rate', value: '68%' },
            { label: 'Pending', value: '4' },
          ].map((s) => (
            <div key={s.label} className="bg-cream rounded-lg p-2.5 text-center">
              <p className="text-base font-bold text-ink">{s.value}</p>
              <p className="text-[10px] text-muted leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </MacFrame>
  )
}

function SlideMockup({ mockup }: { mockup: string }) {
  switch (mockup) {
    case 'connect': return <ConnectMockup />
    case 'branding': return <BrandingMockup />
    case 'recoveries': return <RecoveriesMockup />
    case 'email': return <EmailMockup />
    case 'dashboard': return <DashboardMockup />
    default: return null
  }
}

// ── Main carousel component ─────────────────────────────────────────────────

export function ProductDemo() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi, onSelect])

  // Auto-advance every 6s, paused on hover/interaction
  useEffect(() => {
    if (isHovered) {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
      return
    }
    autoplayRef.current = setInterval(() => {
      emblaApi?.scrollNext()
    }, 6000)
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
    }
  }, [emblaApi, isHovered])

  return (
    <section className="py-24 lg:py-32" style={{ backgroundColor: '#EFEBE3' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink mb-3">
            See exactly how Revorva works
          </h2>
          <p className="text-muted">A guided tour of the actual product.</p>
        </motion.div>

        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Carousel viewport */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {slides.map((slide, i) => (
                <div
                  key={i}
                  className="flex-[0_0_100%] min-w-0 px-4"
                >
                  <motion.div
                    animate={{ opacity: selectedIndex === i ? 1 : 0.5, scale: selectedIndex === i ? 1 : 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-2xl mx-auto"
                  >
                    <SlideMockup mockup={slide.mockup} />
                    <div className="text-center mt-5">
                      <p className="text-base font-semibold text-ink mb-1">{slide.title}</p>
                      <p className="text-sm text-muted">
                        {slide.caption.replace(slide.accentCaption, '').trim()}{' '}
                        <span style={{ color: '#C94A1F' }} className="font-medium">{slide.accentCaption}</span>
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={scrollPrev}
              className="w-10 h-10 rounded-full border border-border bg-white flex items-center justify-center hover:border-[#C94A1F] hover:text-[#C94A1F] transition-colors shadow-card"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={cn(
                    'rounded-full transition-all duration-200',
                    selectedIndex === i
                      ? 'w-6 h-2.5 bg-ink'
                      : 'w-2.5 h-2.5 bg-border hover:bg-muted'
                  )}
                />
              ))}
            </div>

            <button
              onClick={scrollNext}
              className="w-10 h-10 rounded-full border border-border bg-white flex items-center justify-center hover:border-[#C94A1F] hover:text-[#C94A1F] transition-colors shadow-card"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
