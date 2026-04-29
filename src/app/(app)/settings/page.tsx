'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Save, CheckCircle2, Loader2, Copy, Trash2, Plus, RefreshCw, Link2, X, Lock, PauseCircle, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState('')
  const [plan, setPlan] = useState('starter')

  // Business details
  const [businessName, setBusinessName] = useState('')
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
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null)
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
    setUserId(user.id)

    const [profileRes, stripeRes, domainsRes] = await Promise.all([
      supabase.from('users').select('company_name, plan, business_category, config_json').eq('id', user.id).single(),
      supabase.from('stripe_accounts').select('stripe_account_id, config_json').eq('user_id', user.id).single(),
      fetch('/api/domains').then(r => r.ok ? r.json() : []),
    ])

    if (profileRes.data) {
      setBusinessName(profileRes.data.company_name || '')
      setPlan(profileRes.data.plan || 'starter')
      const bt = profileRes.data.business_category || ''
      const knownTypes = ['SaaS', 'E-commerce', 'Agency', 'Marketplace', 'Mobile App', 'Media & Content', 'Education', 'Healthcare', 'Finance & Fintech', 'Other']
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
      if (stripeRes.data.config_json?.replyToEmail) {
        setReplyTo(stripeRes.data.config_json.replyToEmail)
      }
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

    // Load current config_json to merge
    const { data: currentUser } = await supabase.from('users').select('config_json').eq('id', user.id).single()
    const mergedConfig = { ...(currentUser?.config_json || {}), replyToEmail: replyTo }

    await supabase.from('users').update({
      company_name: businessName,
      business_category: finalBusinessType,
      config_json: mergedConfig,
    }).eq('id', user.id)

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

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
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
      // Keep stripeAccount state so the Stripe Connection section reflects the disconnect,
      // but clear the account ID so it shows "not connected"
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

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-cream rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Settings</h1>

      {/* Business Details */}
      <div className="bg-white border border-border rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-semibold text-ink">Business Details</h2>

        <Input
          id="business-name"
          label="Business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Acme Inc."
        />
        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">Business type</label>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">Select your business type...</option>
            <option value="SaaS">SaaS</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Agency">Agency</option>
            <option value="Marketplace">Marketplace</option>
            <option value="Mobile App">Mobile App</option>
            <option value="Media & Content">Media &amp; Content</option>
            <option value="Education">Education</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance & Fintech">Finance &amp; Fintech</option>
            <option value="Other">Other (type manually)</option>
          </select>
          {businessType === 'Other' && (
            <input
              type="text"
              value={businessTypeCustom}
              onChange={(e) => setBusinessTypeCustom(e.target.value)}
              placeholder="Describe your business type..."
              className="mt-2 w-full border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          )}
        </div>

        <Input
          id="reply-to"
          label="Reply-to email"
          type="email"
          value={replyTo}
          onChange={(e) => setReplyTo(e.target.value)}
          placeholder="support@yourcompany.com"
        />

        <div className="flex items-center gap-3 pt-1">
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save changes</>}
          </Button>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Email Settings</h2>
          {plan === 'starter' || plan === 'trial' ? (
            <span className="text-xs text-muted bg-cream border border-border rounded-full px-2.5 py-0.5">Growth+ required</span>
          ) : null}
        </div>

        <div className="flex items-center gap-3 p-4 bg-cream rounded-xl">
          <div>
            <p className="text-sm font-medium text-ink">Current sending address</p>
            <p className="text-sm text-muted">billing@revorva.com (with your business name)</p>
          </div>
        </div>

        {(plan === 'growth' || plan === 'scale') && (
          <div className="space-y-4">
            <p className="text-sm text-muted">Add your domain to send from <span className="text-ink font-medium">billing@yourdomain.com</span>.</p>

            {domains.map((d) => {
              const isVerified = d.verified || d.verification_status === 'verified'
              const records: DnsRecord[] = Array.isArray(d.dns_records) ? d.dns_records : []

              return (
                <div key={d.id} className="border border-border rounded-xl overflow-hidden">
                  {/* Domain header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-cream">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-medium text-ink">{d.domain}</span>
                      <Badge variant={isVerified ? 'recovered' : 'pending'}>
                        {isVerified ? 'Verified' : 'Pending DNS'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isVerified && (
                        <Button variant="outline" size="sm" onClick={() => handleVerify(d.id)} disabled={verifyingId === d.id}>
                          {verifyingId === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          Check DNS
                        </Button>
                      )}
                      {removeConfirmId === d.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-red-600">Remove?</span>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 border border-red-200 h-7 px-2 text-xs" onClick={() => handleDelete(d.id)} disabled={removingId === d.id}>
                            {removingId === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs border border-border" onClick={() => setRemoveConfirmId(null)}>No</Button>
                        </div>
                      ) : (
                        <button onClick={() => setRemoveConfirmId(d.id)} className="text-muted hover:text-red-600 transition-colors p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Verified state */}
                  {isVerified && (
                    <div className="px-4 py-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-muted">
                        Recovery emails will be sent from <span className="font-medium text-ink">billing@{d.domain}</span>
                      </p>
                    </div>
                  )}

                  {/* DNS records table */}
                  {!isVerified && records.length > 0 && (
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-ink mb-0.5">Add these DNS records</p>
                        <p className="text-xs text-muted">Changes can take up to 24 hours to propagate. After adding the records, click "Check DNS" above.</p>
                      </div>
                      <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-cream border-b border-border">
                              <th className="text-left px-3 py-2 text-muted font-medium w-16">Type</th>
                              <th className="text-left px-3 py-2 text-muted font-medium w-1/3">Name</th>
                              <th className="text-left px-3 py-2 text-muted font-medium">Value</th>
                              <th className="w-8" />
                            </tr>
                          </thead>
                          <tbody>
                            {records.map((rec, i) => {
                              const copyKey = `${d.id}-${i}`
                              return (
                                <tr key={i} className={i < records.length - 1 ? 'border-b border-border' : ''}>
                                  <td className="px-3 py-2.5">
                                    <span className="font-mono font-medium text-ink bg-cream px-1.5 py-0.5 rounded text-xs">{rec.type}</span>
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <span className="font-mono text-ink break-all">{rec.name}</span>
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <span className="font-mono text-muted break-all">{rec.value}</span>
                                  </td>
                                  <td className="px-2 py-2.5">
                                    <button
                                      onClick={() => handleCopyField(copyKey, rec.value)}
                                      className="text-muted hover:text-ink transition-colors"
                                      title="Copy value"
                                    >
                                      {copiedField === copyKey
                                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                        : <Copy className="w-3.5 h-3.5" />
                                      }
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

                  {/* Pending but no records (legacy domain) */}
                  {!isVerified && records.length === 0 && (
                    <div className="px-4 py-3">
                      <p className="text-xs text-muted">DNS records unavailable. Remove this domain and re-add it to get the required records.</p>
                    </div>
                  )}
                </div>
              )
            })}

            <div className="flex gap-2">
              <Input
                id="new-domain"
                placeholder="yourdomain.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                error={domainError}
              />
              <Button variant="outline" size="md" onClick={handleAddDomain} disabled={addingDomain} className="flex-shrink-0">
                {addingDomain ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add
              </Button>
            </div>
          </div>
        )}

        {(plan === 'starter' || plan === 'trial') && (
          <div className="p-4 bg-accent-light border border-accent/20 rounded-xl">
            <p className="text-sm text-ink font-medium mb-1">Send from your own domain</p>
            <p className="text-sm text-muted mb-3">
              Upgrade to Growth to send recovery emails from <span className="font-medium text-ink">billing@yourdomain.com</span> instead of billing@revorva.com.
            </p>
            <a href="/billing" className="text-sm text-accent font-medium hover:underline">Upgrade to Growth →</a>
          </div>
        )}
      </div>

      {/* Stripe Connection */}
      <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-ink">Stripe Connection</h2>

        {stripeAccount ? (
          <div className="flex items-center justify-between p-4 bg-cream rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Connected</p>
                <p className="text-xs text-muted font-mono">{stripeAccount.stripe_account_id}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDisconnect} disabled={disconnecting} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-cream rounded-xl">
            <div>
              <p className="text-sm font-medium text-ink">Not connected</p>
              <p className="text-xs text-muted">Connect Stripe to start recovering payments</p>
            </div>
            <Button variant="accent" size="sm" onClick={() => window.location.href = '/api/stripe/connect/start'}>
              <Link2 className="w-4 h-4" />
              Connect
            </Button>
          </div>
        )}
      </div>

      {/* Recovery Status */}
      {stripeAccount && (
        <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-ink">Recovery Status</h2>

          {recoveryPaused ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <PauseCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  {pausedBy === 'stripe_disconnect' ? (
                    <>
                      <p className="text-sm font-semibold text-amber-900">Currently: Paused — Stripe disconnected</p>
                      <p className="text-sm text-amber-700 mt-0.5">
                        Reconnect your Stripe account to re-enable recovery, then click Resume.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-amber-900">Currently: Paused</p>
                      <p className="text-sm text-amber-700 mt-0.5">
                        No emails are being sent. No retries are running.
                      </p>
                    </>
                  )}
                  {pausedAt && (
                    <span className="block text-xs mt-1 text-amber-600">
                      Paused since {new Date(pausedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
              {pausedBy === 'stripe_disconnect' ? (
                <Button variant="primary" size="sm" onClick={() => window.location.href = '/api/stripe/connect/start'}>
                  <PlayCircle className="w-4 h-4" />
                  Reconnect Stripe
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleResume} loading={togglingPause}>
                  <PlayCircle className="w-4 h-4" />
                  Resume recovery
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Currently: Active</p>
                  <p className="text-sm text-green-700 mt-0.5">
                    Recovery is running. Failed payments will be detected and emails sent automatically.
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPauseModal(true)}
                  loading={togglingPause}
                >
                  <PauseCircle className="w-4 h-4" />
                  Pause recovery
                </Button>
                <p className="text-xs text-muted pl-0.5">
                  Pausing stops all recovery emails and retry attempts. Existing jobs are held until you resume.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security */}
      <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-ink">Security</h2>
        <div className="flex items-center justify-between p-4 bg-cream rounded-xl">
          <div>
            <p className="text-sm font-medium text-ink">Password</p>
            <p className="text-xs text-muted">Send a password reset link to your email address</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePasswordReset}
            loading={sendingReset}
            disabled={resetSent}
          >
            {resetSent
              ? <><CheckCircle2 className="w-4 h-4 text-green-600" /> Link sent</>
              : <><Lock className="w-4 h-4" /> Change password</>
            }
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-red-200 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-red-700 mb-3">Danger Zone</h2>
        <p className="text-sm text-muted mb-4">Permanently delete your account and all data. This cannot be undone.</p>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:bg-red-50 border border-red-200"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete account
        </Button>
      </div>

      {/* Pause confirmation modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-ink">Pause recovery?</h3>
              <button onClick={() => setShowPauseModal(false)} className="text-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted leading-relaxed mb-5">
              Existing recovery jobs will be held. New failed payments won&apos;t trigger recovery.
              You can resume anytime.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" className="flex-1 border border-border" onClick={() => setShowPauseModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" className="flex-1" onClick={handlePauseConfirm}>
                <PauseCircle className="w-4 h-4" />
                Pause recovery
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {pauseToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-ink text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
          {pauseToast}
        </div>
      )}

      {/* Delete account modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-red-700">Delete account</h3>
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeleteError('') }} className="text-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted leading-relaxed mb-4">
              This will permanently delete your account, all recovery jobs, Stripe connection, and any stored data. Your Stripe subscription will be cancelled immediately. <strong className="text-ink">This cannot be undone.</strong>
            </p>
            <p className="text-sm font-medium text-ink mb-2">
              Type <span className="font-mono bg-red-50 text-red-700 px-1.5 py-0.5 rounded">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full border border-red-200 rounded-lg px-3.5 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
              autoComplete="off"
            />
            {deleteError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 mb-4">
                {deleteError}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 border border-border"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeleteError('') }}
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-red-600 hover:bg-red-50 border border-red-200 disabled:opacity-40"
                onClick={handleDeleteAccount}
                loading={deleting}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                Delete my account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
