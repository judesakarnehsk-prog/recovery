'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save, CheckCircle2, Loader2, Mail, Globe, AlertCircle,
  Copy, Trash2, Plus, RefreshCw,
} from 'lucide-react'
import { AuthenticatedNav } from '@/components/AuthenticatedNav'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'

interface Domain {
  id: string
  domain: string
  token: string
  verified: boolean
  created_at: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [config, setConfig] = useState<any>(null)

  // Domain state
  const [domains, setDomains] = useState<Domain[]>([])
  const [newDomain, setNewDomain] = useState('')
  const [addingDomain, setAddingDomain] = useState(false)
  const [domainError, setDomainError] = useState('')
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    dunningTone: 'professional',
    maxRetries: 3,
    retryIntervalDays: 3,
    replyToEmail: '',
    dunningEnabled: true,
    senderDomainId: '',
    senderName: '',
    senderLocalPart: 'billing',
  })

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserId(user.id)

    const [profileRes, stripeRes] = await Promise.all([
      supabase.from('users').select('full_name, email').eq('id', user.id).single(),
      supabase.from('stripe_accounts').select('config_json').eq('user_id', user.id).single(),
    ])

    if (profileRes.data) {
      setUserName(profileRes.data.full_name || '')
      setUserEmail(profileRes.data.email || user.email || '')
    }

    const cfg = stripeRes.data?.config_json
    if (cfg) {
      setConfig(cfg)
      setFormData({
        dunningTone: cfg.dunningTone || 'professional',
        maxRetries: cfg.maxRetries || 3,
        retryIntervalDays: cfg.retryIntervalDays || 3,
        replyToEmail: cfg.replyToEmail || '',
        dunningEnabled: cfg.dunningEnabled !== false,
        senderDomainId: cfg.senderDomainId || '',
        senderName: cfg.senderName || '',
        senderLocalPart: cfg.senderLocalPart || 'billing',
      })
    }

    // Load domains
    const res = await fetch('/api/domains')
    if (res.ok) {
      const data = await res.json()
      setDomains(data)
    }

    setLoading(false)
  }, [router])

  useEffect(() => { loadData() }, [loadData])

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
      setDomains((prev) => [data, ...prev])
      setNewDomain('')
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
    if (data.verified) {
      setDomains((prev) => prev.map((d) => d.id === id ? { ...d, verified: true } : d))
    } else {
      setDomainError(data.message || 'Not verified yet.')
    }
    setVerifyingId(null)
  }

  const handleDeleteDomain = async (id: string) => {
    if (!confirm('Remove this domain?')) return
    await fetch('/api/domains', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setDomains((prev) => prev.filter((d) => d.id !== id))
    if (formData.senderDomainId === id) {
      setFormData((f) => ({ ...f, senderDomainId: '' }))
    }
  }

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    const supabase = createClient()
    const selectedDomain = domains.find((d) => d.id === formData.senderDomainId)
    await supabase.from('stripe_accounts').update({
      config_json: {
        ...config,
        dunningTone: formData.dunningTone,
        maxRetries: formData.maxRetries,
        retryIntervalDays: formData.retryIntervalDays,
        replyToEmail: formData.replyToEmail,
        dunningEnabled: formData.dunningEnabled,
        senderDomainId: formData.senderDomainId,
        senderName: formData.senderName,
        senderLocalPart: formData.senderLocalPart,
        senderEmail: selectedDomain
          ? `${formData.senderLocalPart}@${selectedDomain.domain}`
          : config?.senderEmail || '',
      },
    }).eq('user_id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const verifiedDomains = domains.filter((d) => d.verified)

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedNav userName={userName} userEmail={userEmail} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-secondary mt-1">Configure your dunning and email preferences</p>
        </div>

        <div className="space-y-6">

          {/* Domain Verification */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Sending Domains
                  </CardTitle>
                  <CardDescription>Verify your domain to send emails from your own address</CardDescription>
                </div>
                {verifiedDomains.length > 0 && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {verifiedDomains.length} verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Add domain */}
              <div className="flex gap-2">
                <Input
                  placeholder="yourdomain.com"
                  value={newDomain}
                  onChange={(e) => { setNewDomain(e.target.value); setDomainError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                  className="flex-1"
                />
                <Button variant="primary" size="md" onClick={handleAddDomain} loading={addingDomain} className="gap-1.5 whitespace-nowrap">
                  <Plus className="w-4 h-4" />
                  Add Domain
                </Button>
              </div>
              {domainError && (
                <p className="text-sm text-red-500 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {domainError}
                </p>
              )}

              {/* Domain list */}
              {domains.length > 0 && (
                <div className="space-y-3">
                  {domains.map((d) => (
                    <div key={d.id} className="border border-border rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-text-primary text-sm">{d.domain}</p>
                          <Badge variant={d.verified ? 'success' : 'warning'} className="gap-1">
                            {d.verified
                              ? <><CheckCircle2 className="w-3 h-3" /> Verified</>
                              : <><AlertCircle className="w-3 h-3" /> Pending</>}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {!d.verified && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerify(d.id)}
                              loading={verifyingId === d.id}
                              className="gap-1 text-xs"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Check
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDomain(d.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {!d.verified && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                          <p className="text-xs font-semibold text-text-primary">Add this DNS TXT record to verify ownership:</p>
                          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                            <span className="text-text-secondary font-medium">Type</span>
                            <span className="font-mono text-text-primary">TXT</span>
                            <span className="text-text-secondary font-medium">Name</span>
                            <span className="font-mono text-text-primary">@</span>
                            <span className="text-text-secondary font-medium">Value</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-text-primary break-all">{d.token}</span>
                              <button
                                onClick={() => handleCopyToken(d.token)}
                                className="text-primary hover:text-primary/70 flex-shrink-0"
                              >
                                {copiedToken === d.token
                                  ? <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                                  : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-text-secondary">DNS changes can take a few minutes to propagate. Click "Check" after adding the record.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {domains.length === 0 && (
                <div className="text-center py-6 border border-dashed border-border rounded-xl">
                  <Globe className="w-8 h-8 text-text-secondary/20 mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">No domains added yet. Add your domain above to send emails from your own address.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sender Email Config */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Sender Email
                </CardTitle>
                <CardDescription>Configure the from address for dunning emails</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {verifiedDomains.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-text-secondary">
                    Verify a domain above to send emails from your own address. Until then, emails are sent via Revorva.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="senderName">Sender Name</Label>
                    <Input
                      id="senderName"
                      placeholder="Billing Team"
                      value={formData.senderName}
                      onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderDomain">Send From Domain</Label>
                    <Select
                      id="senderDomain"
                      value={formData.senderDomainId}
                      onChange={(e) => setFormData({ ...formData, senderDomainId: e.target.value })}
                    >
                      <option value="">— Select domain —</option>
                      {verifiedDomains.map((d) => (
                        <option key={d.id} value={d.id}>{d.domain}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderLocal">Email Prefix</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        id="senderLocal"
                        placeholder="billing"
                        value={formData.senderLocalPart}
                        onChange={(e) => setFormData({ ...formData, senderLocalPart: e.target.value.replace(/[^a-z0-9._+-]/gi, '') })}
                        className="flex-1"
                      />
                      {formData.senderDomainId && (
                        <span className="text-sm text-text-secondary whitespace-nowrap">
                          @{verifiedDomains.find((d) => d.id === formData.senderDomainId)?.domain}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="replyTo">Reply-to Email</Label>
                    <Input
                      id="replyTo"
                      type="email"
                      placeholder="support@yourcompany.com"
                      value={formData.replyToEmail}
                      onChange={(e) => setFormData({ ...formData, replyToEmail: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dunning Toggle */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Dunning Recovery</CardTitle>
                  <CardDescription>Enable or disable automatic payment recovery</CardDescription>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, dunningEnabled: !formData.dunningEnabled })}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${formData.dunningEnabled ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${formData.dunningEnabled ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary">
                {formData.dunningEnabled
                  ? 'Revorva is actively monitoring and recovering failed payments.'
                  : 'Payment recovery is paused. Failed payments will not be retried.'}
              </p>
            </CardContent>
          </Card>

          {/* Dunning Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Dunning Settings</CardTitle>
                  <CardDescription>Configure how Revorva handles failed payments</CardDescription>
                </div>
                {saved && <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Saved</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="tone">Email Tone</Label>
                  <Select id="tone" value={formData.dunningTone} onChange={(e) => setFormData({ ...formData, dunningTone: e.target.value })}>
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="direct">Direct</option>
                    <option value="empathetic">Empathetic</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retries">Max Retry Attempts</Label>
                  <Select id="retries" value={formData.maxRetries} onChange={(e) => setFormData({ ...formData, maxRetries: Number(e.target.value) })}>
                    <option value={1}>1 attempt</option>
                    <option value={2}>2 attempts</option>
                    <option value={3}>3 attempts</option>
                    <option value={5}>5 attempts</option>
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="interval">Days Between Retries</Label>
                  <Select id="interval" value={formData.retryIntervalDays} onChange={(e) => setFormData({ ...formData, retryIntervalDays: Number(e.target.value) })}>
                    <option value={1}>1 day</option>
                    <option value={2}>2 days</option>
                    <option value={3}>3 days</option>
                    <option value={5}>5 days</option>
                    <option value={7}>7 days</option>
                  </Select>
                </div>
              </div>
              <div className="pt-2">
                <Button variant="primary" size="md" onClick={handleSave} loading={saving} className="gap-1.5">
                  <Save className="w-4 h-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  )
}
