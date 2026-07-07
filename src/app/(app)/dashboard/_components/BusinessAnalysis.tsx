'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

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

interface UserContext {
  id: string
  company_url: string
  company_name: string | null
  business_category: string | null
  has_seen_analysis: boolean
}

export function BusinessAnalysis({ forceOpen = false }: { forceOpen?: boolean }) {
  const [user, setUser] = useState<UserContext | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [toneApplied, setToneApplied] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const loadUser = useCallback(async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data } = await supabase
      .from('users')
      .select('id, company_url, company_name, business_category, has_seen_analysis')
      .eq('id', authUser.id)
      .single()

    if (data?.company_url) {
      setUser(data as UserContext)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open])

  const fetchAnalysis = useCallback(async (u: UserContext) => {
    setLoading(true)
    setAnalysis(null)
    try {
      const res = await fetch('/api/analyze-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyUrl: u.company_url,
          businessName: u.company_name,
          businessCategory: u.business_category,
        }),
      })
      const data = await res.json()
      if (data.success) setAnalysis(data.analysis)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleOpen = useCallback(async (u?: UserContext) => {
    const target = u ?? user
    if (!target) return
    setOpen(true)
    await fetchAnalysis(target)
  }, [user, fetchAnalysis])

  useEffect(() => {
    if (forceOpen && user && !open) {
      handleOpen(user)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceOpen])

  const handleClose = () => {
    setOpen(false)
  }

  const handleDismiss = async () => {
    setOpen(false)
    setDismissed(true)
    if (user) {
      const supabase = createClient()
      await supabase.from('users').update({ has_seen_analysis: true }).eq('id', user.id)
    }
  }

  const applyTone = async () => {
    if (!user || !analysis) return
    const supabase = createClient()
    await supabase
      .from('stripe_accounts')
      .update({ config_json: { dunningTone: analysis.emailToneRecommendation } })
      .eq('user_id', user.id)
    setToneApplied(true)
    setTimeout(() => setToneApplied(false), 2000)
  }

  if (!user) return null
  const showCtaCard = !dismissed && !user.has_seen_analysis

  const businessName = user.company_name || 'your business'

  return (
    <>
      {/* CTA card on dashboard */}
      {showCtaCard && <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        background: 'linear-gradient(135deg, rgba(201,74,31,0.08) 0%, rgba(201,74,31,0.04) 100%)',
        border: '1px solid var(--accent-border)',
        borderRadius: 12,
        padding: '18px 20px',
        margin: '0 32px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40,
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent-border)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>
              See your personalized recovery strategy
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
              We analyzed {businessName} &mdash; here&apos;s exactly how Revorva will recover your failed payments.
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpen()}
          style={{
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '9px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          View analysis &rarr;
        </button>
      </div>}

      {/* Modal */}
      {open && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-mid)',
              borderRadius: 16,
              width: 580,
              maxWidth: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              animation: 'slideUp 0.2s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {loading ? (
              <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                <div style={{
                  width: 32, height: 32,
                  border: '2px solid var(--border-mid)',
                  borderTopColor: 'var(--accent)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 16px',
                }} />
                <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-1)', marginBottom: 6 }}>
                  Analyzing {businessName}&hellip;
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
                  Reading your website and building your recovery strategy
                </p>
              </div>
            ) : analysis ? (
              <>
                <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{
                    display: 'inline-block',
                    background: 'var(--accent-dim)',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent-border)',
                    borderRadius: 100,
                    fontSize: 11, fontWeight: 600,
                    padding: '3px 10px',
                    marginBottom: 10,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  }}>
                    {analysis.businessType}
                  </div>
                  <h2 style={{
                    fontFamily: 'var(--font-sora), system-ui, sans-serif',
                    fontSize: 20, fontWeight: 700,
                    color: 'var(--text-1)',
                    marginBottom: 8,
                  }}>
                    Your recovery strategy
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                    {analysis.whatWeDetected}
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 1,
                  background: 'var(--border)',
                  borderBottom: '1px solid var(--border)',
                }}>
                  {[
                    { value: analysis.estimatedRecoveryRate, label: 'Est. recovery rate' },
                    { value: '4', label: 'Recovery touchpoints' },
                    { value: '14 days', label: 'Recovery window' },
                  ].map(({ value, label }) => (
                    <div key={label} style={{ background: 'var(--surface)', padding: '16px 20px', textAlign: 'center' }}>
                      <div style={{
                        fontFamily: 'var(--font-jetbrains-mono), monospace',
                        fontSize: 22, fontWeight: 500,
                        color: 'var(--accent)', marginBottom: 4,
                      }}>
                        {value}
                      </div>
                      <div style={{
                        fontSize: 11, color: 'var(--text-3)',
                        textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                      }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 10 }}>
                    How we&apos;ll recover your payments
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                    {analysis.recoveryApproach}
                  </p>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '16px 28px',
                  background: 'var(--accent-dim)',
                  borderBottom: '1px solid var(--accent-border)',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <line x1="12" y1="2" x2="12" y2="6"/>
                    <path d="M12 6a6 6 0 0 1 6 6c0 3-2 5-3 6H9c-1-1-3-3-3-6a6 6 0 0 1 6-6z"/>
                    <line x1="9" y1="18" x2="15" y2="18"/>
                    <line x1="10" y1="21" x2="14" y2="21"/>
                  </svg>
                  <p style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.5, margin: 0 }}>
                    {analysis.keyInsight}
                  </p>
                </div>

                <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 10 }}>
                    Recommended email tone
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border-mid)',
                      borderRadius: 6,
                      padding: '4px 12px',
                      fontSize: 13, fontWeight: 600,
                      color: 'var(--text-1)',
                      textTransform: 'capitalize' as const,
                    }}>
                      {analysis.emailToneRecommendation}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>{analysis.emailToneReason}</p>
                  </div>
                  <button
                    onClick={applyTone}
                    style={{
                      background: toneApplied ? 'var(--green-dim)' : 'transparent',
                      border: `1px solid ${toneApplied ? 'var(--green-border)' : 'var(--border-mid)'}`,
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13, fontWeight: 500,
                      color: toneApplied ? 'var(--green)' : 'var(--text-2)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!toneApplied) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' } }}
                    onMouseLeave={(e) => { if (!toneApplied) { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-2)' } }}
                  >
                    {toneApplied ? '&#x2713; Tone applied' : 'Apply this tone to my emails'}
                  </button>
                </div>

                <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 10 }}>
                    Sample recovery email
                  </p>
                  <div style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: 16,
                  }}>
                    <div style={{
                      fontSize: 13, color: 'var(--text-1)', fontWeight: 500,
                      marginBottom: 12, paddingBottom: 12,
                      borderBottom: '1px solid var(--border)',
                    }}>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600, marginRight: 8 }}>
                        Subject:
                      </span>
                      {analysis.sampleSubject}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
                      {analysis.sampleOpener}
                      <br /><br />
                      <span style={{ color: 'var(--text-3)', fontSize: 13 }}>
                        [Revorva continues with personalized recovery content and payment update link&hellip;]
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '20px 28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                }}>
                  <button
                    onClick={handleDismiss}
                    style={{
                      background: 'transparent', color: 'var(--text-3)',
                      border: '1px solid var(--border)', borderRadius: 8,
                      padding: '10px 16px', fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border-mid)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    Don&apos;t show this again
                  </button>
                  <button
                    onClick={handleClose}
                    style={{
                      background: 'var(--accent)', color: 'white',
                      border: 'none', borderRadius: 8,
                      padding: '10px 20px', fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', whiteSpace: 'nowrap',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                  >
                    Got it, let&apos;s go &rarr;
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-1)', marginBottom: 8 }}>
                  Analysis unavailable
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>
                  We couldn&apos;t analyze your website right now. Recovery is still fully active.
                </p>
                <button
                  onClick={handleClose}
                  style={{
                    background: 'var(--surface-2)', color: 'var(--text-1)',
                    border: '1px solid var(--border-mid)', borderRadius: 8,
                    padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes spin    { to { transform: rotate(360deg) } }
      `}</style>
    </>
  )
}

