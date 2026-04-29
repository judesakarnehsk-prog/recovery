'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, ArrowRight, Zap, Mail, BarChart2, Lock, Upload } from 'lucide-react'
import Image from 'next/image'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'

type Step = 1 | 2 | 3 | 4

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {([1, 2, 3, 4] as Step[]).map((s, i) => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all duration-300',
              step > s
                ? 'bg-accent text-white'
                : step === s
                ? 'bg-ink text-white'
                : 'bg-border text-muted'
            )}
          >
            {step > s ? <Check className="w-3.5 h-3.5" /> : s}
          </div>
          {i < 3 && (
            <div className={cn('h-px flex-1 transition-colors duration-300', step > s ? 'bg-accent' : 'bg-border')} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Step 1: Welcome ──────────────────────────────────────────────────────────
function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-accent-light flex items-center justify-center mx-auto mb-6">
        <Zap className="w-8 h-8 text-accent" />
      </div>
      <h1 className="font-display text-4xl text-ink mb-3">Welcome to Revorva</h1>
      <p className="text-muted text-lg mb-10">Let&apos;s get you recovering revenue in 2 minutes.</p>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Connect Stripe', desc: 'Link your account securely' },
          { label: 'Brand emails', desc: 'Make them feel like yours' },
          { label: 'Go live', desc: 'Recovery starts automatically' },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-border rounded-xl p-4 text-left">
            <p className="text-sm font-semibold text-ink mb-1">{item.label}</p>
            <p className="text-xs text-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      <Button variant="accent" size="lg" onClick={onNext} className="gap-2 w-full sm:w-auto">
        Get started
        <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  )
}

// ─── Step 2: Connect Stripe ───────────────────────────────────────────────────
function StepConnectStripe({ onNext, userId }: { onNext: () => void; userId: string }) {
  const [safetyOpen, setSafetyOpen] = useState(false)
  const [connected, setConnected] = useState(false)
  const [accountName, setAccountName] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('stripe_accounts')
      .select('stripe_account_id, config_json')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setConnected(true)
          setAccountName(data.config_json?.businessName || data.stripe_account_id)
        }
        setChecking(false)
      })
  }, [userId])

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display text-3xl text-ink mb-2">Connect your Stripe account</h2>
      <p className="text-muted mb-8">Revorva monitors your Stripe for failed payments and handles recovery automatically.</p>

      {checking ? (
        <div className="h-14 bg-cream rounded-xl animate-pulse" />
      ) : connected ? (
        <div className="bg-white border border-green-200 rounded-xl p-5 flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Connected</p>
            <p className="text-xs text-muted">{accountName}</p>
          </div>
        </div>
      ) : (
        <Link
          href="/api/stripe/connect/start"
          className="flex items-center justify-center gap-3 w-full bg-[#635bff] hover:bg-[#5b53f0] text-white font-semibold py-3.5 px-6 rounded-xl transition-colors duration-200 mb-6"
        >
          <svg viewBox="0 0 60 25" className="h-5 fill-white" aria-label="Stripe">
            <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.87zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.5 0 3 .27 4.35.86v3.88a9.23 9.23 0 0 0-4.35-1.23c-.86 0-1.3.2-1.3.9 0 1.83 6.36.89 6.36 5.82z" />
          </svg>
          Connect with Stripe
        </Link>
      )}

      {/* Safety accordion */}
      <button
        onClick={() => setSafetyOpen(!safetyOpen)}
        className="w-full flex items-center justify-between text-sm text-muted hover:text-ink transition-colors py-2"
      >
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          Why is this safe?
        </span>
        <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', safetyOpen && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {safetyOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-border rounded-xl p-4 mt-2 space-y-2 text-sm text-muted">
              <p>✓ Uses Stripe&apos;s official OAuth — we never see your Stripe password</p>
              <p>✓ We only request access to manage subscriptions and invoices</p>
              <p>✓ We never touch your Stripe balance or payout settings</p>
              <p>✓ You can disconnect at any time from your settings</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {connected && (
        <Button variant="accent" size="lg" onClick={onNext} className="gap-2 w-full mt-6">
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  )
}

// ─── Step 3: Brand emails ─────────────────────────────────────────────────────
function StepBrandEmails({
  onNext,
  userId,
  plan,
}: {
  onNext: () => void
  userId: string
  plan: string
}) {
  const [businessName, setBusinessName] = useState('')
  const [brandColor, setBrandColor] = useState('#c8401a')
  const [logoUrl, setLogoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const isGrowthPlus = plan === 'growth' || plan === 'scale'

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('stripe_accounts')
      .select('config_json')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data?.config_json?.businessName) setBusinessName(data.config_json.businessName)
        if (data?.config_json?.brandColor) setBrandColor(data.config_json.brandColor)
        if (data?.config_json?.logoUrl) setLogoUrl(data.config_json.logoUrl)
      })
  }, [userId])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      alert('Please upload a PNG, JPG, or WebP image.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be under 2MB.')
      return
    }
    setUploading(true)
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const supabase = createClient()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
      setLogoUrl(publicUrl)
    } else {
      alert('Upload failed: ' + error.message)
    }
    setUploading(false)
    // Reset input so same file can be re-selected
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('stripe_accounts')
      .update({
        config_json: { businessName, brandColor, logoUrl },
      })
      .eq('user_id', userId)
    setSaving(false)
    onNext()
  }

  const previewColor = isGrowthPlus ? brandColor : '#c8401a'
  const previewSubject = `Action needed: Update your ${businessName || 'Your Company'} payment`

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display text-3xl text-ink mb-2">Make the emails feel like yours</h2>
      <p className="text-muted mb-8">Your customers will see your brand, not Revorva&apos;s.</p>

      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Form */}
        <div className="space-y-5 mb-8 lg:mb-0">
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Business name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Acme Inc."
              className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">
              Brand color
              {!isGrowthPlus && (
                <span className="ml-2 text-xs text-accent font-normal">Growth+ only</span>
              )}
            </label>
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
              />
            </div>
            {!isGrowthPlus && (
              <p className="text-xs text-muted mt-1.5">
                <Link href="/billing" className="text-accent hover:underline">Upgrade to Growth</Link> to use your brand color in emails.
              </p>
            )}
          </div>

          {/* Logo upload — properly wired */}
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">
              Logo <span className="text-muted font-normal">(optional)</span>
              {!isGrowthPlus && (
                <span className="ml-2 text-xs text-accent font-normal">Growth+ only</span>
              )}
            </label>
            {isGrowthPlus ? (
              <div>
                {/* Hidden file input — triggered by the button below */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                  aria-label="Upload logo"
                />
                {logoUrl ? (
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-white">
                    <Image src={logoUrl} alt="Logo preview" width={160} height={32} className="h-8 w-auto rounded object-contain flex-shrink-0" />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="text-xs text-muted hover:text-ink underline"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full border border-dashed border-border rounded-lg p-4 text-sm text-muted hover:text-ink hover:border-ink/40 transition-colors flex items-center justify-center gap-2 bg-white disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading…' : 'Click to upload PNG / JPG / WebP (max 2MB)'}
                  </button>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-lg p-4 text-sm text-muted opacity-50 text-center">
                <Link href="/billing" className="text-accent hover:underline">Upgrade to Growth</Link> to upload your logo
              </div>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className="bg-cream rounded-xl p-4">
          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-3">Email preview</p>
          <div className="bg-white rounded-lg shadow-card overflow-hidden text-sm">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs text-muted">To: sarah@example.com</p>
              <p className="text-xs text-ink font-medium mt-0.5 truncate">{previewSubject}</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="h-1.5 rounded-full w-full" style={{ backgroundColor: previewColor }} />
              {logoUrl && isGrowthPlus && (
                <Image src={logoUrl} alt="Logo" width={140} height={28} className="h-7 w-auto object-contain" />
              )}
              <p className="text-xs text-muted">Hi Sarah,</p>
              <p className="text-xs text-muted leading-relaxed">
                Your recent payment of <strong>$79</strong> for {businessName || 'Your Company'} couldn&apos;t be processed.
              </p>
              <button
                className="text-xs text-white px-4 py-2 rounded-lg font-semibold"
                style={{ backgroundColor: previewColor }}
              >
                Update payment method
              </button>
              <p className="text-xs text-muted/60 pt-1">
                Sent by {businessName || 'Your Company'} via Revorva
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <button
          onClick={onNext}
          className="text-sm text-muted hover:text-ink transition-colors"
        >
          Skip for now
        </button>
        <Button variant="accent" size="lg" onClick={handleSave} loading={saving} className="gap-2">
          Save and continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  )
}

// ─── Step 4: All set ──────────────────────────────────────────────────────────
function StepAllSet({ userName, onFinish }: { userName: string; onFinish: () => void }) {
  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-6"
      >
        <Check className="w-8 h-8 text-white" />
      </motion.div>

      <h2 className="font-display text-4xl text-ink mb-3">
        You&apos;re all set{userName ? `, ${userName.split(' ')[0]}` : ''}!
      </h2>
      <p className="text-muted mb-10">
        Revorva is now watching your Stripe account for failed payments.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10 text-left">
        {[
          {
            icon: Zap,
            title: 'Failed payment detected',
            desc: 'Recovery starts automatically',
          },
          {
            icon: Mail,
            title: 'Customer receives email',
            desc: 'One-click payment update',
          },
          {
            icon: BarChart2,
            title: 'Revenue recovered',
            desc: 'Shown in your dashboard',
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white border border-border rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center mb-3">
              <Icon className="w-4 h-4 text-accent" />
            </div>
            <p className="text-sm font-semibold text-ink mb-1">{title}</p>
            <p className="text-xs text-muted">{desc}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center">
        <Button variant="accent" size="lg" onClick={onFinish} className="gap-2 w-full sm:w-auto">
          Go to dashboard
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [userPlan, setUserPlan] = useState('starter')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace('/login')
        return
      }

      setUserId(user.id)

      // Fetch user profile
      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_step, plan, full_name, company_name')
        .eq('id', user.id)
        .single()

      if (profile) {
        if (profile.onboarding_step === 'completed') {
          router.replace('/dashboard')
          return
        }
        setUserPlan(profile.plan || 'starter')
        setUserName(profile.full_name || profile.company_name || '')
        // Restore step from DB
        const savedStep = parseInt(profile.onboarding_step || '1')
        if (!isNaN(savedStep) && savedStep >= 1 && savedStep <= 4) {
          setStep(savedStep as Step)
        }
        // First time reaching onboarding = email just verified
        if (!profile.onboarding_step || profile.onboarding_step === '1') {
          trackEvent('email_verified')
        }
      }

      setReady(true)
    })
  }, [router])

  const saveStep = async (nextStep: Step | 'completed') => {
    const supabase = createClient()
    await supabase
      .from('users')
      .update({ onboarding_step: String(nextStep) })
      .eq('id', userId)
  }

  const handleNext = async () => {
    const next = (step + 1) as Step
    await saveStep(next)
    // Advancing past step 2 means Stripe was just connected
    if (step === 2) trackEvent('stripe_connected')
    setStep(next)
  }

  const handleFinish = async () => {
    await saveStep('completed')
    trackEvent('onboarding_complete')
    router.push('/dashboard')
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-10">
          <Logo />
        </div>

        {/* Progress */}
        <ProgressBar step={step} />

        {/* Step label */}
        <p className="text-xs text-muted text-right mb-6">Step {step} of 4</p>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 1 && <StepWelcome key="s1" onNext={handleNext} />}
          {step === 2 && <StepConnectStripe key="s2" onNext={handleNext} userId={userId} />}
          {step === 3 && (
            <StepBrandEmails key="s3" onNext={handleNext} userId={userId} plan={userPlan} />
          )}
          {step === 4 && <StepAllSet key="s4" userName={userName} onFinish={handleFinish} />}
        </AnimatePresence>
      </div>
    </div>
  )
}
