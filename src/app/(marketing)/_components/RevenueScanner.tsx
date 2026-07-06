'use client'

import { useEffect, useRef, useState } from 'react'
import { scannerStore } from './scannerStore'

export interface ScanResults {
  analysis: Analysis
  mrr: number
  url: string
}

interface Analysis {
  businessType: string
  whatWeDetected: string
  recoveryApproach: string
  emailToneRecommendation: string
  emailToneReason: string
  sampleSubject: string
  sampleOpener: string
  estimatedRecoveryRate: string
  keyInsight: string
}

type ScanState = 'idle' | 'loading' | 'error'

const MRR_OPTIONS = [
  { label: 'Under $5k',  value: 3000  },
  { label: '$5k–$20k',   value: 12000 },
  { label: '$20k–$50k',  value: 35000 },
  { label: '$50k–$100k', value: 75000 },
  { label: '$100k+',     value: 150000 },
]

// ── Shared helpers ────────────────────────────────────────────────────────────

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function useCountUp(target: number, active: boolean, duration = 1200) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) { setValue(0); return }
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(target * easeOutCubic(progress)))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, active, duration])

  return value
}

// ── Loading sub-components ────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: 'scanSpin 0.7s linear infinite' }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function PendingDot() {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%',
      background: '#E5E3E0', display: 'inline-block',
    }} />
  )
}

function LoadingState({ displayUrl, scanStep }: { displayUrl: string; scanStep: number }) {
  const steps = [
    'Reading your website',
    'Identifying your business model',
    'Calculating your recovery opportunity',
  ]

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 28 }}>
        <div className="scan-pulse-ring" />
        <p style={{ fontSize: 16, color: '#555', marginTop: 16 }}>
          Analyzing <strong style={{ color: '#111' }}>{displayUrl}</strong>
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
        {steps.map((label, i) => {
          const stepNum = i + 1
          const isDone = scanStep > stepNum
          const isActive = scanStep === stepNum
          return (
            <div
              key={label}
              className={`scan-step ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}
            >
              <div className="step-check" style={{ color: isDone ? '#16A34A' : isActive ? '#111' : '#999' }}>
                {isDone ? <CheckIcon /> : isActive ? <SpinnerIcon /> : <PendingDot />}
              </div>
              <span>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Number card ───────────────────────────────────────────────────────────────

function NumberCard({
  value, label, note, color, prefix = '$', suffix = '',
}: {
  value: number; label: string; note: string; color: string; prefix?: string; suffix?: string
}) {
  const counted = useCountUp(value, true)
  return (
    <div className="result-number-card" style={{ textAlign: 'center' }}>
      <div className="number-value" style={{ color }}>{prefix}{counted.toLocaleString()}{suffix}</div>
      <div className="number-label">{label}</div>
      <div className="number-note">{note}</div>
    </div>
  )
}

// ── Results section (exported separately — renders below hero) ────────────────

export function ScanResultsSection({ analysis, mrr, url, onReset }: ScanResults & { onReset: () => void }) {
  const failureRate = 0.065
  const monthlyLoss = Math.round(mrr * failureRate)
  const yearlyLoss = monthlyLoss * 12
  const rateNum = parseInt(analysis.estimatedRecoveryRate) || 60
  const recoverable = Math.round(monthlyLoss * (rateNum / 100))
  const displayDomain = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const mrrLabel = `$${mrr >= 1000 ? (mrr / 1000).toFixed(0) + 'k' : mrr} MRR`
  const signupUrl = `/signup?ref=scanner&url=${encodeURIComponent(url)}`

  return (
    <section id="scan-results-section" style={{ padding: '0 24px 60px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="scan-results-card" style={{ animation: 'scan-fade-in 0.4s ease-out' }}>

          {/* Business header */}
          <div className="result-business-header">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.google.com/s2/favicons?domain=${displayDomain}&sz=32`}
              alt=""
              width={32}
              height={32}
              style={{ borderRadius: 6, flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div>
              <div className="result-business-type">{analysis.businessType}</div>
              <p style={{ fontSize: 14, color: '#555', margin: 0, lineHeight: 1.6 }}>
                {analysis.whatWeDetected}
              </p>
            </div>
          </div>

          {/* Numbers — three cards */}
          <div className="result-numbers">
            <NumberCard value={monthlyLoss} label="Estimated monthly loss" note={`at ${mrrLabel}`} color="#DC2626" suffix="/mo" />
            <NumberCard value={yearlyLoss} label="If nothing changes" note="compounding every month" color="#D97706" suffix="/yr" />
            <NumberCard value={recoverable} label="Recoverable with Revorva" note={`${analysis.estimatedRecoveryRate} est. rate`} color="#16A34A" suffix="/mo" />
          </div>

          {/* Key insight — full text */}
          <div className="result-insight">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C94A1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
              <line x1="12" y1="2" x2="12" y2="6" />
              <path d="M12 6a6 6 0 0 1 6 6c0 3-2 5-3 6H9c-1-1-3-3-3-6a6 6 0 0 1 6-6z" />
              <line x1="9" y1="18" x2="15" y2="18" />
              <line x1="10" y1="21" x2="14" y2="21" />
            </svg>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#333' }}>{analysis.keyInsight}</p>
          </div>

          {/* Recovery approach — first sentence free, rest gated */}
          {(() => {
            const firstSentence = analysis.recoveryApproach.split(/\.\s/)[0] + '.'
            const remainder = analysis.recoveryApproach.slice(firstSentence.length).trim()
            return (
              <div className="result-section">
                <p className="result-section-label">HOW WE&apos;D RECOVER YOUR PAYMENTS</p>
                <p className="result-section-body">{firstSentence}</p>
                {remainder && (
                  <div className="approach-gate">
                    <p className="approach-blurred">{remainder}</p>
                    <div className="approach-gate-overlay">
                      <a
                        href={signupUrl}
                        className="approach-read-more"
                      >
                        Read full strategy →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* Sample email */}
          <div className="result-section">
            <p className="result-section-label">SAMPLE RECOVERY EMAIL WE&apos;D SEND</p>
            <div className="result-email-preview">
              <div className="email-subject-row">
                <span className="email-subject-label">Subject:</span>
                <span className="email-subject-text">{analysis.sampleSubject}</span>
              </div>
              <div className="email-body-preview">
                {analysis.sampleOpener}
                <span className="email-continues"> [continues with payment update link…]</span>
              </div>
            </div>
          </div>

          {/* Tone — fully gated */}
          <div className="result-section tone-section">
            <p className="result-section-label">RECOMMENDED TONE</p>
            <div className="tone-gate">
              <div className="tone-blurred-content">
                <div className="tone-chip-placeholder">{analysis.emailToneRecommendation}</div>
                <p className="tone-reason-placeholder">{analysis.emailToneReason}</p>
              </div>
              <div className="tone-gate-overlay">
                <div className="tone-lock-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <p className="tone-gate-text">See your recommended tone</p>
                <a
                  href={`/signup?ref=scanner_tone&url=${encodeURIComponent(url)}`}
                  className="tone-unlock-btn"
                >
                  Unlock free →
                </a>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="results-bottom-cta">
            <div className="results-cta-divider" />
            <div className="results-cta-label">THIS IS A SAMPLE STRATEGY</div>
            <p className="results-cta-explanation">
              Your real recovery strategy uses your actual Stripe payment data — specific customers,
              real amounts, and emails sent from your domain. Connect Stripe to start recovering
              revenue automatically.
            </p>
            <a href={signupUrl} className="results-cta-btn">
              Start recovering revenue — free for 14 days →
            </a>
            <p className="results-cta-note">
              No credit card · 2-minute setup · Cancel anytime · Connects via Stripe OAuth
            </p>
          </div>

          {/* Reset link */}
          <p style={{ textAlign: 'center', marginTop: 16, marginBottom: 0 }}>
            <button
              onClick={onReset}
              style={{ background: 'none', border: 'none', color: '#999', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Scan a different site
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}

// ── Error section ─────────────────────────────────────────────────────────────

export function ScanErrorSection({ onReset }: { onReset: () => void }) {
  return (
    <section id="scan-results-section" style={{ padding: '0 24px 60px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="scan-results-card">
          <div className="scan-error-section">
            <div className="scan-error-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ color: '#999' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <p className="error-title">We couldn&apos;t analyze that website</p>
            <p className="error-body">
              The site may be down, under construction, or doesn&apos;t have enough public
              content to analyze. Try your real business URL, or{' '}
              <a href="/signup">start your free trial</a> — we&apos;ll analyze your business
              after you connect Stripe.
            </p>
            <button className="error-retry-btn" onClick={onReset}>
              Try a different URL
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Widget (input only — lives inside the hero, talks via scannerStore) ──────

export function RevenueScannerWidget() {
  const [scanUrl, setScanUrl] = useState('')
  const [selectedMRR, setSelectedMRR] = useState(12000)
  const [scanError, setScanError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleScan = async () => {
    if (!scanUrl.trim()) { setScanError('Please enter your website URL'); return }
    setScanError('')

    let url = scanUrl.trim()
    if (!url.startsWith('http')) url = 'https://' + url

    const display = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    setIsLoading(true)
    scannerStore.emit({ type: 'loading', displayUrl: display, step: 1 })

    // Step advancement (independent of fetch)
    const t2 = setTimeout(() => scannerStore.emit({ type: 'loading', displayUrl: display, step: 2 }), 1500)
    const t3 = setTimeout(() => scannerStore.emit({ type: 'loading', displayUrl: display, step: 3 }), 3000)

    const fetchStart = Date.now()

    try {
      const res = await fetch('/api/public/analyze-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyUrl: url, businessName: display, businessCategory: '' }),
      })

      const data = await res.json()

      if (res.status === 429) {
        clearTimeout(t2); clearTimeout(t3)
        setScanError(data.error || 'Too many requests. Please try again later.')
        scannerStore.emit({ type: 'error' })
        setIsLoading(false)
        return
      }

      // Minimum 3.5s so all 3 loading steps are visible
      const elapsed = Date.now() - fetchStart
      if (elapsed < 3500) await new Promise(r => setTimeout(r, 3500 - elapsed))

      clearTimeout(t2); clearTimeout(t3)

      if (data.success) {
        scannerStore.emit({ type: 'results', analysis: data.analysis, mrr: selectedMRR, url })
      } else {
        scannerStore.emit({ type: 'error' })
      }
    } catch {
      clearTimeout(t2); clearTimeout(t3)
      scannerStore.emit({ type: 'error' })
    }

    setIsLoading(false)
  }

  // Keep the button in sync when the wrapper resets
  useEffect(() => {
    return scannerStore.subscribe((event) => {
      if (event.type === 'reset') setIsLoading(false)
    })
  }, [])

  return (
    <div className="scanner-widget">
      <div className="scanner-label">
        <span className="scanner-dot" />
        See your revenue leak — free, instant, no signup
      </div>

      {/* URL row */}
      <div className="scanner-input-row">
        <div className="scanner-input-wrapper">
          <svg className="scanner-globe-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <input
            type="url"
            placeholder="yourwebsite.com"
            value={scanUrl}
            onChange={(e) => setScanUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            className="scanner-input"
            disabled={isLoading}
          />
        </div>
        <button onClick={handleScan} disabled={isLoading} className="scanner-btn">
          {isLoading ? (
            <span className="scanner-loading">
              <span className="scanner-spinner" />
              Analyzing…
            </span>
          ) : (
            'Scan my site →'
          )}
        </button>
      </div>

      {/* MRR selector */}
      <div className="scanner-mrr-row">
        <span className="scanner-mrr-label">Approximate monthly revenue (MRR)</span>
        <div className="scanner-mrr-options">
          {MRR_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`mrr-option${selectedMRR === opt.value ? ' active' : ''}`}
              onClick={() => setSelectedMRR(opt.value)}
              disabled={isLoading}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {scanError && <p className="scanner-error">{scanError}</p>}
    </div>
  )
}

// ── Loading section (subscribes to store for live step updates) ──────────────

export function ScanLoadingSection({ displayUrl, scanStep }: { displayUrl: string; scanStep: number }) {
  const [step, setStep] = useState(scanStep)
  const [url, setUrl] = useState(displayUrl)

  useEffect(() => {
    setStep(scanStep)
    setUrl(displayUrl)
  }, [scanStep, displayUrl])

  useEffect(() => {
    return scannerStore.subscribe((event) => {
      if (event.type === 'loading') {
        setStep(event.step)
        setUrl(event.displayUrl)
      }
    })
  }, [])

  return (
    <section id="scan-results-section" style={{ padding: '0 24px 60px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="scan-results-card">
          <LoadingState displayUrl={url} scanStep={step} />
        </div>
      </div>
    </section>
  )
}
