'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Save, RefreshCw, Unplug, Mail, Globe, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface SettingsFormProps {
  stripeConnected?: boolean
  userId?: string
  config?: {
    dunningTone: string
    maxRetries: number
    retryIntervalDays: number
    replyToEmail: string
    senderEmail?: string
    senderName?: string
    resendDomainId?: string
  }
}

export function SettingsForm({ stripeConnected = true, userId, config }: SettingsFormProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    dunningTone: config?.dunningTone || 'professional',
    maxRetries: config?.maxRetries || 3,
    retryIntervalDays: config?.retryIntervalDays || 3,
    replyToEmail: config?.replyToEmail || '',
  })

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('stripe_accounts').update({
      config_json: {
        ...config,
        dunningTone: formData.dunningTone,
        maxRetries: formData.maxRetries,
        retryIntervalDays: formData.retryIntervalDays,
        replyToEmail: formData.replyToEmail,
      },
    }).eq('user_id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const hasSenderEmail = !!config?.senderEmail
  const hasDomain = !!config?.resendDomainId

  return (
    <div className="space-y-6">
      {/* Sender Email Config */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Sender Email
              </CardTitle>
              <CardDescription>Dunning emails are sent from this address</CardDescription>
            </div>
            {hasSenderEmail && hasDomain ? (
              <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</Badge>
            ) : hasSenderEmail ? (
              <Badge variant="warning" className="gap-1"><AlertCircle className="w-3 h-3" /> Not Verified</Badge>
            ) : (
              <Badge variant="error">Not Set</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasSenderEmail ? (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-secondary text-xs mb-1">Sender Name</p>
                  <p className="font-medium text-text-primary">{config?.senderName || '—'}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs mb-1">Sender Email</p>
                  <p className="font-medium text-text-primary">{config?.senderEmail}</p>
                </div>
              </div>
              {!hasDomain && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-text-secondary">
                    Your domain is not verified yet. Go to{' '}
                    <Link href="/onboarding" className="text-primary font-medium hover:underline">Onboarding</Link>{' '}
                    to complete domain verification.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <Globe className="w-8 h-8 text-text-secondary/30 mx-auto mb-2" />
              <p className="text-sm text-text-secondary mb-3">No sender email configured yet.</p>
              <Link href="/onboarding">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Set Up Sender Email
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stripe Connection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stripe Connection</CardTitle>
              <CardDescription>Manage your Stripe account integration</CardDescription>
            </div>
            <Badge variant={stripeConnected ? 'success' : 'error'}>
              {stripeConnected ? 'Connected' : 'Not Connected'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {stripeConnected ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="gap-1.5 text-cta hover:text-cta">
                <Unplug className="w-4 h-4" />
                Disconnect
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <RefreshCw className="w-4 h-4" />
                Re-sync
              </Button>
            </div>
          ) : (
            <Link href="/onboarding">
              <Button variant="primary" size="md">
                Connect Stripe Account
              </Button>
            </Link>
          )}
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

          <div className="pt-2">
            <Button variant="primary" size="md" onClick={handleSave} loading={saving} className="gap-1.5">
              <Save className="w-4 h-4" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
