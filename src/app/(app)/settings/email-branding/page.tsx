'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Save, Lock, Upload, Check } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const TONES = [
  { value: 'friendly', label: 'Friendly', desc: 'Warm and understanding' },
  { value: 'professional', label: 'Professional', desc: 'Formal and polished' },
  { value: 'direct', label: 'Direct', desc: 'Clear and concise' },
  { value: 'empathetic', label: 'Empathetic', desc: 'Caring and personal' },
]

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function EmailBrandingPage() {
  const [plan, setPlan] = useState('starter')
  const [businessName, setBusinessName] = useState('')
  const [brandColor, setBrandColor] = useState('#c8401a')
  const [dunningTone, setDunningTone] = useState('professional')
  const [subjectPrefix, setSubjectPrefix] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const isGrowthPlus = plan === 'growth' || plan === 'scale'

  const debouncedColor = useDebounce(brandColor, 300)
  const debouncedName = useDebounce(businessName, 300)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return

      // Plan comes from users table; branding config lives in stripe_accounts.config_json
      const [profileRes, stripeRes] = await Promise.all([
        supabase.from('users').select('plan').eq('id', user.id).single(),
        supabase.from('stripe_accounts').select('config_json').eq('user_id', user.id).single(),
      ])

      if (profileRes.data?.plan) setPlan(profileRes.data.plan)

      const cfg = stripeRes.data?.config_json || {}
      if (cfg.businessName !== undefined) setBusinessName(cfg.businessName)
      if (cfg.brandColor !== undefined) setBrandColor(cfg.brandColor)
      if (cfg.dunningTone !== undefined) setDunningTone(cfg.dunningTone)
      if (cfg.subjectPrefix !== undefined) setSubjectPrefix(cfg.subjectPrefix)
      if (cfg.logoUrl) setLogoUrl(cfg.logoUrl)
    })
  }, [])

  const handleSave = async () => {
    const formValues = { businessName, brandColor, dunningTone, subjectPrefix, logoUrl, isGrowthPlus }
    console.log('[branding] Save clicked, posting:', formValues)

    setSaving(true)
    const supabase = createClient()

    // Get user at save time — don't rely on userId state which may be empty
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('[branding] No authenticated user at save time')
      setSaving(false)
      alert('You must be logged in to save')
      return
    }

    // Read existing config_json first so we merge, not overwrite other keys
    const { data: existing } = await supabase
      .from('stripe_accounts')
      .select('config_json')
      .eq('user_id', user.id)
      .single()

    const merged = {
      ...(existing?.config_json || {}),
      businessName,
      brandColor: isGrowthPlus ? brandColor : (existing?.config_json?.brandColor || '#c8401a'),
      dunningTone,
      subjectPrefix: isGrowthPlus ? subjectPrefix : (existing?.config_json?.subjectPrefix || ''),
      logoUrl: isGrowthPlus ? logoUrl : (existing?.config_json?.logoUrl || ''),
    }

    console.log('[branding] Saving to stripe_accounts.config_json:', merged)

    const { error } = await supabase
      .from('stripe_accounts')
      .update({ config_json: merged })
      .eq('user_id', user.id)

    setSaving(false)
    if (error) {
      console.error('[branding] save error:', error)
      alert('Failed to save — try again')
      return
    }
    console.log('[branding] Saved successfully')
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'image/png') {
      alert('Only PNG files are supported.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be under 2MB.')
      return
    }

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

  // Preview values (debounced)
  const previewColor = isGrowthPlus ? debouncedColor : '#c8401a'
  const previewName = debouncedName || 'Your Company'

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink">Email Branding</h1>
        <p className="text-sm text-muted mt-1">Customize how recovery emails look to your customers.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ── Form ── */}
        <div className="space-y-6">

          {/* Business name */}
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Business name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Acme Inc."
              className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <p className="text-xs text-muted mt-1">Shown in the email sender name and body.</p>
          </div>

          {/* Brand color */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-ink">Brand color</label>
              {!isGrowthPlus && (
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Lock className="w-3 h-3" />
                  <Link href="/billing" className="text-accent hover:underline">Upgrade to Growth</Link>
                </span>
              )}
            </div>
            <div className={cn('flex items-center gap-2', !isGrowthPlus && 'opacity-50 pointer-events-none')}>
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer p-1 bg-white"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="flex-1 border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink bg-white font-mono focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="#c8401a"
              />
            </div>
          </div>

          {/* Logo upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-ink">Logo</label>
              {!isGrowthPlus && (
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Lock className="w-3 h-3" />
                  <Link href="/billing" className="text-accent hover:underline">Upgrade to Growth</Link>
                </span>
              )}
            </div>
            {isGrowthPlus ? (
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {logoUrl ? (
                  <div className="flex items-center gap-3">
                    <Image src={logoUrl} alt="Logo" width={160} height={40} className="h-10 w-auto rounded border border-border object-contain" />
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="text-xs text-muted hover:text-ink underline"
                    >
                      Replace
                    </button>
                    <button
                      onClick={() => setLogoUrl('')}
                      className="text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full border border-dashed border-border rounded-lg p-4 text-sm text-muted hover:text-ink hover:border-ink/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading…' : 'Upload PNG (max 2MB)'}
                  </button>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-lg p-4 text-sm text-muted opacity-50 text-center">
                PNG logo upload — Growth+ only
              </div>
            )}
          </div>

          {/* Email tone */}
          <div>
            <label className="text-sm font-medium text-ink block mb-2">Email tone</label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setDunningTone(t.value)}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-all duration-150',
                    dunningTone === t.value
                      ? 'border-ink bg-ink text-white'
                      : 'border-border bg-white text-ink hover:border-ink/30'
                  )}
                >
                  <p className={cn('text-sm font-medium', dunningTone === t.value ? 'text-white' : 'text-ink')}>
                    {t.label}
                  </p>
                  <p className={cn('text-xs mt-0.5', dunningTone === t.value ? 'text-white/70' : 'text-muted')}>
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Subject prefix */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-ink">Subject prefix</label>
              {!isGrowthPlus && (
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Lock className="w-3 h-3" />
                  <Link href="/billing" className="text-accent hover:underline">Growth+</Link>
                </span>
              )}
            </div>
            <input
              type="text"
              value={subjectPrefix}
              onChange={(e) => setSubjectPrefix(e.target.value)}
              placeholder="e.g. [Action required]"
              disabled={!isGrowthPlus}
              className={cn(
                'w-full border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/30',
                !isGrowthPlus && 'opacity-50 cursor-not-allowed'
              )}
            />
            <p className="text-xs text-muted mt-1">Prepended to the AI-generated subject line.</p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            loading={saving}
            className="gap-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save changes
              </>
            )}
          </Button>
        </div>

        {/* ── Live preview ── */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-3">Email preview</p>
          <div className="bg-cream rounded-xl p-4">
            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              {/* Email header bar */}
              <div
                className="h-1"
                style={{ backgroundColor: previewColor }}
              />

              {/* Email meta */}
              <div className="px-5 py-3 border-b border-border bg-paper/50">
                <p className="text-xs text-muted">
                  From: {previewName} &lt;billing@revorva.com&gt;
                </p>
                <p className="text-xs text-ink font-medium mt-0.5">
                  {subjectPrefix && isGrowthPlus ? `${subjectPrefix} ` : ''}Action needed: Update your {previewName} payment
                </p>
              </div>

              {/* Email body */}
              <div className="p-5 space-y-4">
                {logoUrl && isGrowthPlus && (
                  <Image src={logoUrl} alt="Logo" width={160} height={32} className="h-8 w-auto object-contain" />
                )}

                <div>
                  <p className="text-sm text-muted">Hi John,</p>
                </div>

                <div className="text-sm text-ink/80 leading-relaxed space-y-2">
                  {dunningTone === 'friendly' && (
                    <p>We noticed your recent payment of <strong>$49/month</strong> for {previewName} didn&apos;t go through — no worries, these things happen!</p>
                  )}
                  {dunningTone === 'professional' && (
                    <p>We were unable to process your payment of <strong>$49/month</strong> for {previewName}. Please update your payment details at your earliest convenience.</p>
                  )}
                  {dunningTone === 'direct' && (
                    <p>Your <strong>$49/month</strong> payment for {previewName} failed. Please update your payment method to avoid service interruption.</p>
                  )}
                  {dunningTone === 'empathetic' && (
                    <p>We understand life gets busy — your payment of <strong>$49/month</strong> for {previewName} didn&apos;t process. We&apos;re here to help you resolve this quickly.</p>
                  )}
                </div>

                <div>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="inline-block text-sm font-semibold text-white px-5 py-2.5 rounded-lg transition-opacity hover:opacity-90"
                    style={{ backgroundColor: previewColor }}
                  >
                    Update payment method
                  </a>
                </div>

                <p className="text-xs text-muted/60 pt-2 border-t border-border">
                  Powered by {previewName}
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted/60 text-center mt-3">Preview updates as you type</p>
        </div>
      </div>
    </div>
  )
}
