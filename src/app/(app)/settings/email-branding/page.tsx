'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'

const TONES = [
  { value: 'friendly',     label: 'Friendly',     desc: 'Warm and understanding' },
  { value: 'professional', label: 'Professional',  desc: 'Formal and polished' },
  { value: 'direct',       label: 'Direct',        desc: 'Clear and concise' },
  { value: 'empathetic',   label: 'Empathetic',    desc: 'Caring and personal' },
]

const PREVIEW_BODY: Record<string, (name: string) => string> = {
  friendly:     (n) => `We noticed your recent payment of $49/month for ${n} didn't go through — no worries, these things happen!`,
  professional: (n) => `We were unable to process your payment of $49/month for ${n}. Please update your payment details at your earliest convenience.`,
  direct:       (n) => `Your $49/month payment for ${n} failed. Please update your payment method to avoid service interruption.`,
  empathetic:   (n) => `We understand life gets busy — your payment of $49/month for ${n} didn't process. We're here to help you resolve this quickly.`,
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const LockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 24 }}>
    {children}
  </p>
)

const Optional = () => (
  <span style={{ fontWeight: 400, color: 'var(--text-3)', textTransform: 'none', letterSpacing: 0, fontSize: 11 }}> optional</span>
)

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: 'var(--surface-2)', border: '1px solid var(--border-mid)',
  borderRadius: 8, color: 'var(--text-1)', fontSize: 14,
  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
  fontFamily: 'inherit', boxSizing: 'border-box',
}

export default function EmailBrandingPage() {
  const [plan, setPlan] = useState('starter')
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [brandColor, setBrandColor] = useState('#c8401a')
  const [dunningTone, setDunningTone] = useState('professional')
  const [subjectMode, setSubjectMode] = useState<'ai' | 'custom'>('ai')
  const [customSubject, setCustomSubject] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const isGrowthPlus = plan === 'growth' || plan === 'scale' || (plan === 'trial' && !!trialEndsAt && new Date(trialEndsAt) > new Date())
  const debouncedColor = useDebounce(brandColor, 300)
  const debouncedName = useDebounce(businessName, 300)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const [profileRes, stripeRes] = await Promise.all([
        supabase.from('users').select('plan, trial_ends_at').eq('id', user.id).single(),
        supabase.from('stripe_accounts').select('config_json').eq('user_id', user.id).single(),
      ])
      if (profileRes.data?.plan) setPlan(profileRes.data.plan)
      if (profileRes.data?.trial_ends_at) setTrialEndsAt(profileRes.data.trial_ends_at)
      const cfg = stripeRes.data?.config_json || {}
      if (cfg.businessName !== undefined) setBusinessName(cfg.businessName)
      if (cfg.brandColor !== undefined) setBrandColor(cfg.brandColor)
      if (cfg.dunningTone !== undefined) setDunningTone(cfg.dunningTone)
      if (cfg.subjectMode !== undefined) setSubjectMode(cfg.subjectMode)
      if (cfg.custom_subject_line != null) setCustomSubject(cfg.custom_subject_line)
      if (cfg.logoUrl) setLogoUrl(cfg.logoUrl)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); alert('You must be logged in to save'); return }

    const { data: existing } = await supabase
      .from('stripe_accounts').select('config_json').eq('user_id', user.id).single()

    const merged = {
      ...(existing?.config_json || {}),
      businessName,
      brandColor: isGrowthPlus ? brandColor : (existing?.config_json?.brandColor || '#c8401a'),
      dunningTone,
      subjectMode: isGrowthPlus ? subjectMode : 'ai',
      custom_subject_line: (isGrowthPlus && subjectMode === 'custom') ? customSubject : null,
      logoUrl: isGrowthPlus ? logoUrl : (existing?.config_json?.logoUrl || ''),
    }

    const { error } = await supabase
      .from('stripe_accounts').update({ config_json: merged }).eq('user_id', user.id)

    setSaving(false)
    if (error) { console.error('[branding] save error:', error); alert('Failed to save — try again'); return }
    trackEvent('branding_saved')
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'image/png') { alert('Only PNG files are supported.'); return }
    if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2MB.'); return }
    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }
    const path = `${user.id}/${Date.now()}.png`
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
      setLogoUrl(publicUrl)
      trackEvent('logo_uploaded')
    }
    setUploading(false)
  }

  const handleSubjectModeChange = (newMode: 'ai' | 'custom') => {
    setSubjectMode(newMode)
    if (newMode === 'custom' && !customSubject) {
      setCustomSubject(`Update your ${businessName || 'Acme Inc.'} payment`)
    }
  }

  const previewColor = isGrowthPlus ? debouncedColor : '#c8401a'
  const previewName  = debouncedName || 'Acme Inc.'
  const previewSubject = subjectMode === 'ai'
    ? `Hey, quick note about your ${previewName} payment`
    : (customSubject || `Update your ${previewName} payment`)

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: 1060 }}>
      {/* Heading */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--font-sora), system-ui, sans-serif',
          fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4,
        }}>
          Email Branding
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
          Customize how recovery emails look to your customers.
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'start' }}>

        {/* ── Left: Form ── */}
        <div>

          {/* Business name */}
          <SectionLabel>Business name</SectionLabel>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Acme Inc."
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#C94A1F'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.boxShadow = 'none' }}
          />
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>Shown in the email sender name and body.</p>

          {/* Brand color */}
          <SectionLabel>
            Brand color{' '}
            {!isGrowthPlus && (
              <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-3)', textTransform: 'none', letterSpacing: 0 }}>
                — <Link href="/billing" style={{ color: '#C94A1F', textDecoration: 'none' }}>Upgrade to Growth</Link>
              </span>
            )}
          </SectionLabel>
          <div style={{ display: 'flex', gap: 10, opacity: isGrowthPlus ? 1 : 0.45, pointerEvents: isGrowthPlus ? 'auto' : 'none' }}>
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              style={{
                width: 44, height: 44, flexShrink: 0,
                border: '1px solid var(--border-mid)', borderRadius: 8,
                padding: 3, background: 'var(--surface-2)', cursor: 'pointer',
              }}
            />
            <input
              type="text"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              placeholder="#c8401a"
              style={{ ...inputStyle, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#C94A1F'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          {/* Logo */}
          <SectionLabel>Logo<Optional /> {!isGrowthPlus && (
            <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-3)', textTransform: 'none', letterSpacing: 0 }}>
              — <Link href="/billing" style={{ color: '#C94A1F', textDecoration: 'none' }}>Growth+</Link>
            </span>
          )}</SectionLabel>
          <input ref={fileRef} type="file" accept="image/png" onChange={handleLogoUpload} style={{ display: 'none' }} />
          {isGrowthPlus ? (
            logoUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Image src={logoUrl} alt="Logo" width={160} height={40}
                  style={{ height: 40, width: 'auto', borderRadius: 6, border: '1px solid var(--border)', objectFit: 'contain' }} />
                <button onClick={() => fileRef.current?.click()}
                  style={{ fontSize: 12, color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Replace
                </button>
                <button onClick={() => setLogoUrl('')}
                  style={{ fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{
                  width: '100%', padding: '18px 16px',
                  background: 'var(--surface-2)',
                  border: '1.5px dashed var(--border-bright)',
                  borderRadius: 10, textAlign: 'center' as const,
                  cursor: uploading ? 'wait' : 'pointer',
                  display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8,
                  color: 'var(--text-3)', fontSize: 13, transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C94A1F'; e.currentTarget.style.color = '#C94A1F'; e.currentTarget.style.background = 'var(--accent-dim)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'var(--surface-2)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
                {uploading ? 'Uploading…' : 'Upload PNG (max 2MB)'}
              </button>
            )
          ) : (
            <div style={{
              padding: '14px 16px', background: 'var(--surface-2)',
              border: '1.5px dashed var(--border)', borderRadius: 10,
              fontSize: 13, color: 'var(--text-3)', textAlign: 'center', opacity: 0.5,
            }}>
              PNG logo upload — Growth+ only
            </div>
          )}

          {/* Email tone */}
          <SectionLabel>Email tone</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {TONES.map((t) => {
              const active = dunningTone === t.value
              return (
                <button
                  key={t.value}
                  onClick={() => setDunningTone(t.value)}
                  style={{
                    padding: 14, borderRadius: 10, textAlign: 'left' as const,
                    background: active ? 'var(--accent-dim)' : 'var(--surface)',
                    border: active ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                    cursor: 'pointer', transition: 'all 0.15s', position: 'relative' as const,
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.background = 'var(--surface-2)' } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' } }}
                >
                  {active && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C94A1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ position: 'absolute', top: 10, right: 10 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 2px', color: active ? '#C94A1F' : 'var(--text-1)' }}>
                    {t.label}
                  </p>
                  <p style={{ fontSize: 12, margin: 0, color: 'var(--text-2)' }}>
                    {t.desc}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Subject line */}
          <SectionLabel>
            Subject line{' '}
            {!isGrowthPlus && (
              <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-3)', textTransform: 'none', letterSpacing: 0 }}>
                — <Link href="/billing" style={{ color: '#C94A1F', textDecoration: 'none' }}>Custom subject requires Growth+</Link>
              </span>
            )}
          </SectionLabel>

          {/* Mode tabs */}
          <div style={{
            display: 'flex', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 10,
            padding: 4, gap: 3, marginBottom: 14,
          }}>
            {([
              { value: 'ai' as const,     label: 'AI generated', recommended: true,
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
              { value: 'custom' as const, label: 'Custom subject', recommended: false,
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
            ] as const).map((tab) => {
              const active = subjectMode === tab.value
              const disabled = tab.value === 'custom' && !isGrowthPlus
              return (
                <button
                  key={tab.value}
                  onClick={() => { if (!disabled) handleSubjectModeChange(tab.value) }}
                  disabled={disabled}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 7, padding: '9px 14px',
                    background: active ? 'var(--surface-3)' : 'transparent',
                    border: active ? '1px solid var(--border-mid)' : '1px solid transparent',
                    borderRadius: 7, fontSize: 13, fontWeight: 500,
                    color: active ? 'var(--text-1)' : disabled ? 'var(--text-3)' : 'var(--text-3)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.45 : 1,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!active && !disabled) e.currentTarget.style.color = 'var(--text-2)' }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = disabled ? 'var(--text-3)' : 'var(--text-3)' }}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.recommended && (
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      background: 'var(--accent-dim)', color: '#C94A1F',
                      border: '1px solid var(--accent-border)',
                      borderRadius: 100, padding: '1px 7px', letterSpacing: '0.02em',
                    }}>
                      Recommended
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* AI mode — example subjects */}
          {subjectMode === 'ai' && (
            <div style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '16px 18px',
            }}>
              {([
                { day: 'Day 1',  text: `Hey, quick note about your ${previewName} payment` },
                { day: 'Day 7',  text: `Still having trouble with your ${previewName} payment?` },
                { day: 'Final',  text: `Last chance to keep your ${previewName} subscription` },
              ]).map(({ day, text }, i) => (
                <div key={day} style={{ marginBottom: i < 2 ? 10 : 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 5px' }}>
                    {day}
                  </p>
                  <p style={{
                    fontSize: 13, color: 'var(--text-1)',
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    background: 'var(--surface-3)', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '8px 12px', margin: 0,
                  }}>
                    "{text}"
                  </p>
                </div>
              ))}
              <p style={{
                fontSize: 12, color: 'var(--text-3)', marginTop: 12, lineHeight: 1.5,
                borderTop: '1px solid var(--border)', paddingTop: 10,
              }}>
                Subject lines are personalized per customer using their name, amount, and email sequence day. Optimized for open rates.
              </p>
            </div>
          )}

          {/* Custom mode — full subject line editor */}
          {subjectMode === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>
                  Full subject line
                </p>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder={`Update your ${businessName || 'Acme Inc.'} payment`}
                  maxLength={120}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#C94A1F'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>

              {/* Variable pills */}
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 6px' }}>
                  Available variables:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { token: '{customerName}', desc: "customer's first name" },
                    { token: '{businessName}', desc: 'your business name' },
                    { token: '{amount}',       desc: 'payment amount (e.g. $49/month)' },
                  ].map(({ token, desc }) => (
                    <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontFamily: 'var(--font-jetbrains-mono), monospace',
                        fontSize: 11, background: 'var(--surface-3)',
                        border: '1px solid var(--border)', borderRadius: 4,
                        padding: '1px 6px', color: '#C94A1F', whiteSpace: 'nowrap',
                      }}>
                        {token}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>→ {desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live preview */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '10px 14px',
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Preview
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-1)', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                  "{customSubject || `Update your ${previewName} payment`}"
                </span>
              </div>
            </div>
          )}

          {/* Save button */}
          <div style={{ marginTop: 28 }}>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 24px',
                background: saved ? 'var(--green)' : '#C94A1F',
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer',
                opacity: saving ? 0.7 : 1,
                transition: 'background 0.2s, opacity 0.15s',
              }}
              onMouseEnter={(e) => { if (!saving && !saved) e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              {saving ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Saving…
                </>
              ) : saved ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Saved!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save changes
                </>
              )}
            </button>
          </div>

        </div>

        {/* ── Right: Sticky preview ── */}
        <div style={{ position: 'sticky', top: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Email preview
          </p>

          {/* Preview card shell */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            {/* Accent top bar */}
            <div style={{ height: 3, background: previewColor }} />

            {/* Email meta */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #E5E5E5', background: '#FAFAFA' }}>
              <p style={{ fontSize: 11, color: '#666', margin: '0 0 2px', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                From: {previewName} &lt;billing@revorva.com&gt;
              </p>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#111', margin: 0 }}>
                {previewSubject}
              </p>
            </div>

            {/* Email body — intentionally light (emails are light) */}
            <div style={{ padding: 24, background: '#FAFAFA' }}>
              {logoUrl && isGrowthPlus && (
                <Image src={logoUrl} alt="Logo" width={160} height={32}
                  style={{ height: 32, width: 'auto', objectFit: 'contain', marginBottom: 16 }} />
              )}

              <p style={{ fontSize: 14, color: '#555', margin: '0 0 16px' }}>Hi John,</p>

              <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6, margin: '0 0 20px' }}>
                {PREVIEW_BODY[dunningTone]?.(previewName) ?? PREVIEW_BODY.professional(previewName)}
              </p>

              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  display: 'inline-block',
                  background: previewColor, color: '#fff',
                  borderRadius: 6, padding: '10px 20px',
                  fontSize: 14, fontWeight: 600,
                  textDecoration: 'none', marginBottom: 24,
                }}
              >
                Update payment method
              </a>

              <div style={{ borderTop: '1px solid #eee', paddingTop: 12, marginTop: 8 }}>
                <p style={{ fontSize: 11, color: '#999', margin: 0 }}>
                  Powered by Revorva
                </p>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 10 }}>
            Preview updates as you type
          </p>
        </div>

      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

