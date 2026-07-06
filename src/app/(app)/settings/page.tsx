'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'

interface DnsRecord {
  type: string
  name: string
  value: string
  ttl?: number
  priority?: number
  status?: string
}

interface Domain {
  id: string
  domain: string
  token: string
  verified: boolean
  verification_status: string
  verified_at: string | null
  dns_records: DnsRecord[] | null
  resend_domain_id: string | null
  created_at: string
}

interface StripeAccount {
  stripe_account_id: string
  config_json: any
}

// ── Shared styles ────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 12, padding: 24,
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-sora), system-ui, sans-serif',
  fontSize: 16, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px',
}

const sectionDesc: React.CSSProperties = {
  fontSize: 13, color: 'var(--text-3)', margin: '0 0 20px',
}

const label: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500,
  color: 'var(--text-2)', marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: 'var(--surface-2)', border: '1px solid var(--border-mid)',
  borderRadius: 8, color: 'var(--text-1)', fontSize: 14,
  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
  fontFamily: 'inherit', boxSizing: 'border-box',
}

const helperText: React.CSSProperties = {
  fontSize: 12, color: 'var(--text-3)', marginTop: 5,
}

function Field({ label: lbl, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={label}>{lbl}</label>
      {children}
    </div>
  )
}

function focusIn(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = '#C94A1F'
  e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)'
}
function focusOut(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'var(--border-mid)'
  e.currentTarget.style.boxShadow = 'none'
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [plan, setPlan] = useState('starter')

  // Business details
  const [businessName, setBusinessName] = useState('')
  const [companyUrl, setCompanyUrl] = useState('')
  const [replyTo, setReplyTo] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [businessTypeCustom, setBusinessTypeCustom] = useState('')

  // Stripe
  const [stripeAccount, setStripeAccount] = useState<StripeAccount | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  // Domains
  const [domains, setDomains] = useState<Domain[]>([])
  const [newDomain, setNewDomain] = useState('')
  const [addingDomain, setAddingDomain] = useState(false)
  const [domainError, setDomainError] = useState('')
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null)

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Recovery pause
  const [recoveryPaused, setRecoveryPaused] = useState(false)
  const [pausedAt, setPausedAt] = useState<string | null>(null)
  const [pausedBy, setPausedBy] = useState<string | null>(null)
  const [togglingPause, setTogglingPause] = useState(false)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [pauseToast, setPauseToast] = useState<string | null>(null)

  // Security
  const [sendingReset, setSendingReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, stripeRes, domainsRes] = await Promise.all([
      supabase.from('users').select('company_name, company_url, plan, business_category, config_json').eq('id', user.id).single(),
      supabase.from('stripe_accounts').select('stripe_account_id, config_json').eq('user_id', user.id).single(),
      fetch('/api/domains').then(r => r.ok ? r.json() : []),
    ])

    if (profileRes.data) {
      setBusinessName(profileRes.data.company_name || '')
      setCompanyUrl(profileRes.data.company_url || '')
      setPlan(profileRes.data.plan || 'starter')
      const bt = profileRes.data.business_category || ''
      const knownTypes = ['SaaS / Software', 'E-commerce', 'Marketplace', 'Newsletter / Media', 'Community / Membership', 'Agency / Services', 'Other']
      if (bt && !knownTypes.includes(bt)) {
        setBusinessType('Other')
        setBusinessTypeCustom(bt)
      } else {
        setBusinessType(bt)
      }
      setReplyTo(profileRes.data.config_json?.replyToEmail || '')
    }
    if (stripeRes.data) {
      setStripeAccount(stripeRes.data)
      if (stripeRes.data.config_json?.replyToEmail) setReplyTo(stripeRes.data.config_json.replyToEmail)
      setRecoveryPaused(stripeRes.data.config_json?.recoveryPaused === true)
      setPausedAt(stripeRes.data.config_json?.pausedAt ?? null)
      setPausedBy(stripeRes.data.config_json?.pausedBy ?? null)
    }
    setDomains(Array.isArray(domainsRes) ? domainsRes : [])
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const finalBusinessType = businessType === 'Other' ? businessTypeCustom : businessType
    const { data: currentUser } = await supabase.from('users').select('config_json').eq('id', user.id).single()
    const mergedConfig = { ...(currentUser?.config_json || {}), replyToEmail: replyTo }
    await supabase.from('users').update({ company_name: businessName, company_url: companyUrl || null, business_category: finalBusinessType, config_json: mergedConfig }).eq('id', user.id)
    if (stripeAccount) {
      const cfg = { ...(stripeAccount.config_json || {}), replyToEmail: replyTo }
      await supabase.from('stripe_accounts').update({ config_json: cfg }).eq('user_id', user.id)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return
    setAddingDomain(true)
    setDomainError('')
    const res = await fetch('/api/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: newDomain.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      setDomainError(data.error || 'Failed to add domain')
    } else {
      setDomains(prev => [...prev, data])
      setNewDomain('')
      trackEvent('domain_added')
    }
    setAddingDomain(false)
  }

  const handleVerify = async (id: string) => {
    setVerifyingId(id)
    const res = await fetch('/api/domains/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    if (data.domain) {
      setDomains(prev => prev.map(d => d.id === id ? data.domain : d))
      if (data.domain.verification_status === 'verified') trackEvent('domain_verified')
    } else if (data.verified) {
      setDomains(prev => prev.map(d => d.id === id ? { ...d, verified: true, verification_status: 'verified' } : d))
      trackEvent('domain_verified')
    }
    setVerifyingId(null)
  }

  const handleDelete = async (id: string) => {
    setRemovingId(id)
    await fetch(`/api/domains?id=${id}`, { method: 'DELETE' })
    setDomains(prev => prev.filter(d => d.id !== id))
    setRemovingId(null)
    setRemoveConfirmId(null)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return
    setDeleting(true)
    setDeleteError('')
    const res = await fetch('/api/account/delete', { method: 'DELETE' })
    if (res.ok) {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/?deleted=1')
    } else {
      const data = await res.json()
      setDeleteError(data.error || 'Failed to delete account. Please contact support.')
      setDeleting(false)
    }
  }

  const handleCopyField = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(key)
    setTimeout(() => setCopiedField(null), 1500)
  }

  const showToast = (msg: string) => {
    setPauseToast(msg)
    setTimeout(() => setPauseToast(null), 3000)
  }

  const handlePauseConfirm = async () => {
    setShowPauseModal(false)
    setTogglingPause(true)
    const res = await fetch('/api/recovery/pause', { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setRecoveryPaused(true)
      setPausedAt(data.pausedAt)
      showToast('Recovery paused')
      trackEvent('recovery_paused')
    }
    setTogglingPause(false)
  }

  const handleResume = async () => {
    setTogglingPause(true)
    const res = await fetch('/api/recovery/resume', { method: 'POST' })
    if (res.ok) {
      setRecoveryPaused(false)
      setPausedAt(null)
      setPausedBy(null)
      showToast('Recovery resumed')
      trackEvent('recovery_resumed')
    }
    setTogglingPause(false)
  }

  const handleDisconnect = async () => {
    if (!confirm('Disconnect your Stripe account? Recovery will be paused automatically.')) return
    setDisconnecting(true)
    const res = await fetch('/api/stripe/disconnect', { method: 'POST' })
    if (res.ok) {
      setStripeAccount(prev => prev ? { ...prev, stripe_account_id: '' } : null)
      setRecoveryPaused(true)
      setPausedAt(new Date().toISOString())
    }
    setDisconnecting(false)
  }

  const handlePasswordReset = async () => {
    setSendingReset(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { setSendingReset(false); return }
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSendingReset(false)
    setResetSent(true)
    setTimeout(() => setResetSent(false), 4000)
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ padding: '32px 32px 48px', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[120, 160, 100].map((h, i) => (
          <div key={i} style={{ height: h, background: 'var(--surface-2)', borderRadius: 12, opacity: 0.5 }} />
        ))}
      </div>
    )
  }

  const isGrowthPlus = plan === 'growth' || plan === 'scale'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Heading */}
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px' }}>
          Settings
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
          Manage your account, email configuration, and recovery settings.
        </p>
      </div>

      {/* ── Business Details ──────────────────────────────────────────────── */}
      <div style={card}>
        <h2 style={sectionTitle}>Business Details</h2>
        <p style={sectionDesc}>Used in your recovery emails and account identification.</p>

        <Field label="Business name">
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Acme Inc."
            style={inputStyle}
            onFocus={focusIn} onBlur={focusOut}
          />
        </Field>

        <Field label="Website URL">
          <input
            type="url"
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            style={inputStyle}
            onFocus={focusIn} onBlur={focusOut}
          />
          <p style={helperText}>Used to personalize your recovery emails and generate your recovery strategy.</p>
        </Field>

        <Field label="Business type">
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            style={inputStyle}
            onFocus={focusIn} onBlur={focusOut}
          >
            <option value="">Select your business type…</option>
            <option value="SaaS / Software">SaaS / Software</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Marketplace">Marketplace</option>
            <option value="Newsletter / Media">Newsletter / Media</option>
            <option value="Community / Membership">Community / Membership</option>
            <option value="Agency / Services">Agency / Services</option>
            <option value="Other">Other</option>
          </select>
          {businessType === 'Other' && (
            <input
              type="text"
              value={businessTypeCustom}
              onChange={(e) => setBusinessTypeCustom(e.target.value)}
              placeholder="Describe your business type…"
              style={{ ...inputStyle, marginTop: 8 }}
              onFocus={focusIn} onBlur={focusOut}
            />
          )}
        </Field>

        <Field label="Reply-to email">
          <input
            type="email"
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
            placeholder="support@yourcompany.com"
            style={inputStyle}
            onFocus={focusIn} onBlur={focusOut}
          />
          <p style={helperText}>Customers who reply to recovery emails will reach this address.</p>
        </Field>

        {/* Save button */}
        <div style={{ marginTop: 20 }}>
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

      {/* ── Email Settings ────────────────────────────────────────────────── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={sectionTitle}>Email Settings</h2>
          {!isGrowthPlus && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              background: 'var(--surface-2)', color: 'var(--text-3)',
              border: '1px solid var(--border)', borderRadius: 100,
              padding: '2px 9px', whiteSpace: 'nowrap',
            }}>
              Growth+ required for custom domain
            </span>
          )}
        </div>
        <p style={sectionDesc}>Configure the sending address for recovery emails.</p>

        {/* Current sending address */}
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '14px 16px', marginBottom: 16,
        }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', margin: '0 0 2px' }}>
            Current sending address
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
            billing@revorva.com (with your business name)
          </p>
        </div>

        {/* Growth+: domain management */}
        {isGrowthPlus && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
              Add your domain to send from{' '}
              <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>billing@yourdomain.com</span>.
            </p>

            {domains.map((d) => {
              const isVerified = d.verified || d.verification_status === 'verified'
              const records: DnsRecord[] = Array.isArray(d.dns_records) ? d.dns_records : []

              return (
                <div key={d.id} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  {/* Domain header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--surface-2)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{d.domain}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100,
                        background: isVerified ? 'var(--green-dim)' : 'var(--surface-3)',
                        color: isVerified ? 'var(--green)' : 'var(--text-3)',
                        border: `1px solid ${isVerified ? 'var(--green-border)' : 'var(--border)'}`,
                      }}>
                        {isVerified ? 'Verified' : 'Pending DNS'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {!isVerified && (
                        <button
                          onClick={() => handleVerify(d.id)}
                          disabled={verifyingId === d.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px', fontSize: 12, fontWeight: 500,
                            background: 'var(--surface-3)', border: '1px solid var(--border-mid)',
                            borderRadius: 7, color: 'var(--text-1)', cursor: 'pointer',
                            opacity: verifyingId === d.id ? 0.6 : 1, transition: 'all 0.15s',
                          }}
                        >
                          {verifyingId === d.id ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              style={{ animation: 'spin 0.8s linear infinite' }}>
                              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.08-4.14"/>
                            </svg>
                          )}
                          Check DNS
                        </button>
                      )}
                      {removeConfirmId === d.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, color: 'var(--red)' }}>Remove?</span>
                          <button
                            onClick={() => handleDelete(d.id)}
                            disabled={removingId === d.id}
                            style={{ padding: '4px 10px', fontSize: 12, background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red-border)', borderRadius: 6, cursor: 'pointer' }}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setRemoveConfirmId(null)}
                            style={{ padding: '4px 10px', fontSize: 12, background: 'var(--surface-3)', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRemoveConfirmId(d.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, display: 'flex', transition: 'color 0.15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--red)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Verified: sending address confirmation */}
                  {isVerified && (
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span style={{ fontSize: 13 }}>
                        Recovery emails will be sent from <strong>billing@{d.domain}</strong>
                      </span>
                    </div>
                  )}

                  {/* Pending: DNS records table */}
                  {!isVerified && records.length > 0 && (
                    <div style={{ padding: 16 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', margin: '0 0 4px' }}>Add these DNS records</p>
                      <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 12px' }}>
                        Changes can take up to 24 hours to propagate. After adding the records, click "Check DNS" above.
                      </p>
                      <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                          <thead>
                            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                              {['Type', 'Name', 'Value', ''].map((h, i) => (
                                <th key={i} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-3)', fontWeight: 500, width: i === 0 ? 64 : i === 3 ? 32 : undefined }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {records.map((rec, i) => {
                              const copyKey = `${d.id}-${i}`
                              return (
                                <tr key={i} style={{ borderBottom: i < records.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                  <td style={{ padding: '10px 12px' }}>
                                    <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 11, background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', color: 'var(--text-1)' }}>
                                      {rec.type}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'var(--text-1)', wordBreak: 'break-all' }}>{rec.name}</td>
                                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'var(--text-2)', wordBreak: 'break-all' }}>{rec.value}</td>
                                  <td style={{ padding: '10px 12px' }}>
                                    <button
                                      onClick={() => handleCopyField(copyKey, rec.value)}
                                      title="Copy value"
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', transition: 'color 0.15s' }}
                                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-1)'}
                                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
                                    >
                                      {copiedField === copyKey ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                      ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                        </svg>
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Pending: no DNS records */}
                  {!isVerified && records.length === 0 && (
                    <div style={{ padding: '12px 16px' }}>
                      <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>
                        DNS records unavailable. Remove this domain and re-add it to get the required records.
                      </p>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Add domain row */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddDomain() }}
                  placeholder="yourdomain.com"
                  style={{ ...inputStyle, ...(domainError ? { borderColor: 'var(--red)' } : {}) }}
                  onFocus={focusIn} onBlur={focusOut}
                />
                {domainError && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 5 }}>{domainError}</p>}
              </div>
              <button
                onClick={handleAddDomain}
                disabled={addingDomain}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', fontSize: 13, fontWeight: 500,
                  background: 'var(--surface-3)', border: '1px solid var(--border-mid)',
                  borderRadius: 8, color: 'var(--text-1)', cursor: addingDomain ? 'wait' : 'pointer',
                  transition: 'all 0.15s', opacity: addingDomain ? 0.6 : 1,
                }}
                onMouseEnter={(e) => { if (!addingDomain) { e.currentTarget.style.background = '#C94A1F'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#C94A1F' } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.borderColor = 'var(--border-mid)' }}
              >
                {addingDomain ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                )}
                Add
              </button>
            </div>
          </div>
        )}

        {/* Starter: upgrade prompt */}
        {!isGrowthPlus && (
          <div style={{
            marginTop: 4,
            padding: '14px 16px',
            background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
            borderRadius: 10,
          }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', margin: '0 0 4px' }}>
              Send from your own domain
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 10px' }}>
              Upgrade to Growth to send from{' '}
              <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>billing@yourdomain.com</span>.
            </p>
            <a href="/billing" style={{ fontSize: 13, color: '#C94A1F', fontWeight: 500, textDecoration: 'none' }}>
              Upgrade to Growth →
            </a>
          </div>
        )}
      </div>

      {/* ── Stripe Connection ─────────────────────────────────────────────── */}
      <div style={card}>
        <h2 style={sectionTitle}>Stripe Connection</h2>
        <p style={sectionDesc}>Your connected Stripe account for monitoring failed payments.</p>

        {stripeAccount?.stripe_account_id ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--surface-2)', border: '1px solid var(--green-border)',
            borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 34, height: 34, flexShrink: 0,
                background: 'var(--green-dim)', border: '1px solid var(--green-border)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)', margin: '0 0 2px' }}>Connected</p>
                <p style={{ fontSize: 12, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'var(--text-3)', margin: 0 }}>
                  {stripeAccount.stripe_account_id}
                </p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              style={{
                padding: '6px 14px', fontSize: 13, fontWeight: 500,
                color: 'var(--red)', background: 'transparent',
                border: '1px solid var(--red-border)', borderRadius: 7,
                cursor: disconnecting ? 'wait' : 'pointer', opacity: disconnecting ? 0.6 : 1,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (!disconnecting) e.currentTarget.style.background = 'var(--red-dim)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              {disconnecting ? 'Disconnecting…' : 'Disconnect'}
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '14px 16px',
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)', margin: '0 0 2px' }}>Not connected</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>Connect Stripe to start recovering payments</p>
            </div>
            <button
              onClick={() => window.location.href = '/api/stripe/connect/start'}
              style={{
                padding: '8px 16px', fontSize: 13, fontWeight: 600,
                background: '#C94A1F', color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Connect Stripe
            </button>
          </div>
        )}
      </div>

      {/* ── Recovery Status ───────────────────────────────────────────────── */}
      {stripeAccount && (
        <div style={card}>
          <h2 style={sectionTitle}>Recovery Status</h2>
          <p style={sectionDesc}>Control whether recovery emails and retries are running.</p>

          {recoveryPaused ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)',
                borderRadius: 10, padding: '14px 16px',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
                <div>
                  {pausedBy === 'stripe_disconnect' ? (
                    <>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#92400E', margin: '0 0 3px' }}>
                        Currently: Paused — Stripe disconnected
                      </p>
                      <p style={{ fontSize: 13, color: '#B45309', margin: 0 }}>
                        Reconnect your Stripe account to re-enable recovery, then click Resume.
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#92400E', margin: '0 0 3px' }}>
                        Currently: Paused
                      </p>
                      <p style={{ fontSize: 13, color: '#B45309', margin: 0 }}>
                        No emails are being sent. No retries are running.
                      </p>
                    </>
                  )}
                  {pausedAt && (
                    <p style={{ fontSize: 12, color: '#D97706', margin: '6px 0 0' }}>
                      Paused since {new Date(pausedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
              {pausedBy === 'stripe_disconnect' ? (
                <button
                  onClick={() => window.location.href = '/api/stripe/connect/start'}
                  style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', fontSize: 13, fontWeight: 600, background: '#C94A1F', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Reconnect Stripe
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  disabled={togglingPause}
                  style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', fontSize: 13, fontWeight: 600, background: '#C94A1F', color: '#fff', border: 'none', borderRadius: 8, cursor: togglingPause ? 'wait' : 'pointer', opacity: togglingPause ? 0.7 : 1, transition: 'opacity 0.15s' }}
                  onMouseEnter={(e) => { if (!togglingPause) e.currentTarget.style.opacity = '0.85' }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  {togglingPause ? 'Resuming…' : 'Resume recovery'}
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: 'var(--green-dim)', border: '1px solid var(--green-border)',
                borderRadius: 10, padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 8, height: 8, background: 'var(--green)',
                    borderRadius: '50%', flexShrink: 0,
                    animation: 'pulse 2s ease-in-out infinite',
                    display: 'inline-block',
                  }} />
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)', margin: 0 }}>
                    Currently: Active
                  </p>
                </div>
                <p style={{ fontSize: 13, color: 'var(--green)', opacity: 0.8, margin: '4px 0 0 16px' }}>
                  Recovery is running. Failed payments will be detected and emails sent automatically.
                </p>
              </div>

              <div>
                <button
                  onClick={() => setShowPauseModal(true)}
                  disabled={togglingPause}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '9px 18px', fontSize: 13, fontWeight: 500,
                    background: 'transparent', border: '1px solid var(--border-mid)',
                    borderRadius: 8, color: 'var(--text-2)',
                    cursor: togglingPause ? 'wait' : 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'transparent' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                  </svg>
                  Pause recovery
                </button>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 7 }}>
                  Pausing stops all recovery emails and retry attempts. Existing jobs are held until you resume.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Security ──────────────────────────────────────────────────────── */}
      <div style={card}>
        <h2 style={sectionTitle}>Security</h2>
        <p style={sectionDesc}>Manage your login credentials.</p>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '14px 16px',
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)', margin: '0 0 3px' }}>Password</p>
            <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>
              Send a password reset link to your email address
            </p>
          </div>
          <button
            onClick={handlePasswordReset}
            disabled={sendingReset || resetSent}
            style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', fontSize: 13, fontWeight: 500,
              background: resetSent ? 'var(--green-dim)' : 'var(--surface-3)',
              color: resetSent ? 'var(--green)' : 'var(--text-1)',
              border: `1px solid ${resetSent ? 'var(--green-border)' : 'var(--border-mid)'}`,
              borderRadius: 8, cursor: sendingReset ? 'wait' : 'pointer',
              opacity: sendingReset ? 0.6 : 1, transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { if (!sendingReset && !resetSent) { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.background = 'var(--surface-2)' } }}
            onMouseLeave={(e) => { if (!resetSent) { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.background = 'var(--surface-3)' } }}
          >
            {resetSent ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Link sent
              </>
            ) : sendingReset ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Sending…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Change password
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Danger Zone ───────────────────────────────────────────────────── */}
      <div style={{ ...card, border: '1px solid var(--red-border)' }}>
        <h2 style={{ ...sectionTitle, color: 'var(--red)' }}>Danger Zone</h2>
        <p style={{ ...sectionDesc, marginBottom: 16 }}>
          Permanently delete your account and all data. This cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            padding: '9px 20px', fontSize: 13, fontWeight: 500,
            background: 'transparent', color: 'var(--red)',
            border: '1px solid var(--red-border)', borderRadius: 8,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--red-dim)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          Delete account
        </button>
      </div>

      {/* ── Pause modal ───────────────────────────────────────────────────── */}
      {showPauseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, maxWidth: 380, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'var(--font-sora), system-ui, sans-serif', margin: 0 }}>Pause recovery?</h3>
              <button onClick={() => setShowPauseModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, display: 'flex', transition: 'color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-1)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 20px' }}>
              Existing recovery jobs will be held. New failed payments won't trigger recovery. You can resume anytime.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowPauseModal(false)}
                style={{ flex: 1, padding: '9px 16px', fontSize: 13, fontWeight: 500, background: 'transparent', border: '1px solid var(--border-mid)', borderRadius: 8, color: 'var(--text-2)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handlePauseConfirm}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 16px', fontSize: 13, fontWeight: 600, background: '#C94A1F', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
                Pause recovery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {pauseToast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: 'var(--surface-3)', border: '1px solid var(--border-mid)', color: 'var(--text-1)', fontSize: 13, fontWeight: 500, padding: '10px 18px', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
          {pauseToast}
        </div>
      )}

      {/* ── Delete account modal ──────────────────────────────────────────── */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--red-border)', borderRadius: 14, padding: 24, maxWidth: 440, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--font-sora), system-ui, sans-serif', margin: 0 }}>Delete account</h3>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeleteError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, display: 'flex' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 16px' }}>
              This will permanently delete your account, all recovery jobs, Stripe connection, and any stored data. Your Stripe subscription will be cancelled immediately.{' '}
              <strong style={{ color: 'var(--text-1)' }}>This cannot be undone.</strong>
            </p>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', margin: '0 0 8px' }}>
              Type{' '}
              <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 12, background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red-border)', borderRadius: 4, padding: '1px 6px' }}>
                DELETE
              </span>
              {' '}to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              autoComplete="off"
              style={{ ...inputStyle, borderColor: deleteConfirmText && deleteConfirmText !== 'DELETE' ? 'var(--red)' : 'var(--border-mid)', marginBottom: 12 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--red-dim)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.boxShadow = 'none' }}
            />
            {deleteError && (
              <p style={{ fontSize: 13, color: 'var(--red)', background: 'var(--red-dim)', border: '1px solid var(--red-border)', borderRadius: 8, padding: '10px 14px', margin: '0 0 14px' }}>
                {deleteError}
              </p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeleteError('') }}
                style={{ flex: 1, padding: '9px 16px', fontSize: 13, fontWeight: 500, background: 'transparent', border: '1px solid var(--border-mid)', borderRadius: 8, color: 'var(--text-2)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                style={{
                  flex: 1, padding: '9px 16px', fontSize: 13, fontWeight: 600,
                  background: deleteConfirmText === 'DELETE' ? 'var(--red-dim)' : 'transparent',
                  color: 'var(--red)', border: '1px solid var(--red-border)', borderRadius: 8,
                  cursor: deleteConfirmText !== 'DELETE' || deleting ? 'not-allowed' : 'pointer',
                  opacity: deleteConfirmText !== 'DELETE' || deleting ? 0.45 : 1,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (deleteConfirmText === 'DELETE' && !deleting) e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = deleteConfirmText === 'DELETE' ? 'var(--red-dim)' : 'transparent'; e.currentTarget.style.color = 'var(--red)' }}
              >
                {deleting ? 'Deleting…' : 'Delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  )
}
