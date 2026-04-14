'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette,
  RefreshCw,
  Send,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Mail,
  Globe,
  Copy,
  AlertCircle,
  Crown,
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const steps = [
  { id: 1, title: 'Sender Email', icon: Mail, description: 'Set up your sending email address' },
  { id: 2, title: 'Customize Tone', icon: Palette, description: 'Set your brand voice' },
  { id: 3, title: 'Set Retries', icon: RefreshCw, description: 'Configure retry schedule' },
  { id: 4, title: 'Test & Launch', icon: Send, description: 'Send a test and go live' },
]

const tones = [
  { value: 'friendly', label: 'Friendly', description: 'Warm, casual, and understanding' },
  { value: 'professional', label: 'Professional', description: 'Formal, polished, and business-like' },
  { value: 'direct', label: 'Direct', description: 'Clear, concise, straight to the point' },
  { value: 'empathetic', label: 'Empathetic', description: 'Caring, supportive, and personal' },
]

interface DnsRecord {
  type: string
  name: string
  value: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTone, setSelectedTone] = useState('professional')
  const [maxRetries, setMaxRetries] = useState('3')
  const [retryInterval, setRetryInterval] = useState('3')
  const [replyToEmail, setReplyToEmail] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [senderName, setSenderName] = useState('')
  const [testSent, setTestSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Domain verification state
  const [domainId, setDomainId] = useState<string | null>(null)
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([])
  const [domainStatus, setDomainStatus] = useState<'idle' | 'pending' | 'verified' | 'failed'>('idle')
  const [verifyError, setVerifyError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const domain = senderEmail.includes('@') ? senderEmail.split('@')[1] : ''

  const handleAddDomain = async () => {
    if (!domain) return
    setLoading(true)
    setVerifyError('')

    try {
      const res = await fetch('/api/resend/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      })
      const data = await res.json()

      if (!res.ok) {
        const errMsg = data.error || 'Failed to add domain'
        // Detect Resend plan limit
        if (errMsg.toLowerCase().includes('upgrade') || errMsg.toLowerCase().includes('limit') || errMsg.toLowerCase().includes('plan includes')) {
          setVerifyError('DOMAIN_LIMIT')
        } else {
          setVerifyError(errMsg)
        }
        setLoading(false)
        return
      }

      setDomainId(data.id)
      setDnsRecords(data.records || [])
      setDomainStatus('pending')
    } catch {
      setVerifyError('Network error. Please try again.')
    }
    setLoading(false)
  }

  const handleVerifyDomain = async () => {
    if (!domainId) return
    setLoading(true)
    setVerifyError('')

    try {
      const res = await fetch('/api/resend/domain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId }),
      })
      const data = await res.json()

      if (data.status === 'verified') {
        setDomainStatus('verified')
      } else {
        setVerifyError('Domain not verified yet. Please check your DNS records and try again in a few minutes.')
      }
    } catch {
      setVerifyError('Verification check failed. Please try again.')
    }
    setLoading(false)
  }

  const handleCopyDns = (value: string, index: number) => {
    navigator.clipboard.writeText(value)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTestEmail = async () => {
    setLoading(true)
    try {
      await fetch('/api/dunning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone: selectedTone, step: 1 }),
      })
      setTestSent(true)
    } catch {
      // Ignore test errors
    }
    setLoading(false)
  }

  const handleLaunch = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Save configuration to stripe_accounts config_json
      await supabase.from('stripe_accounts').update({
        config_json: {
          dunningTone: selectedTone,
          maxRetries: parseInt(maxRetries),
          retryIntervalDays: parseInt(retryInterval),
          senderEmail: senderEmail || '',
          senderName: senderName || '',
          replyToEmail: replyToEmail || '',
          resendDomainId: domainId || '',
        },
      }).eq('user_id', user.id)
    }

    setSaving(false)
    router.push('/dashboard')
  }

  // Step 1 is REQUIRED — must have sender name + email + verified domain
  const step1Complete = !!(senderEmail && senderName && domainStatus === 'verified')
  const step1HasInput = !!(senderEmail && senderName)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">Set up your recovery engine</h1>
          <p className="text-text-secondary">4 quick steps and you are live</p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-10">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                animate={{
                  scale: currentStep === step.id ? 1.1 : 1,
                }}
                className={cn(
                  'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                  currentStep > step.id
                    ? 'bg-success text-white'
                    : currentStep === step.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-border/50 text-text-secondary'
                )}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </motion.div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-colors duration-300',
                  currentStep > step.id ? 'bg-success' : 'bg-border/50'
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Sender Email + Domain Verification */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">Sender Email Setup</h2>
                    <p className="text-sm text-text-secondary">Dunning emails will be sent from this address</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="senderName">Sender Name *</Label>
                      <Input
                        id="senderName"
                        placeholder="Billing Team"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="senderEmail">Sender Email *</Label>
                      <Input
                        id="senderEmail"
                        type="email"
                        placeholder="billing@yourdomain.com"
                        value={senderEmail}
                        onChange={(e) => { setSenderEmail(e.target.value); setDomainStatus('idle'); setDnsRecords([]); }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="replyTo">Reply-to Email (optional)</Label>
                    <Input
                      id="replyTo"
                      type="email"
                      placeholder="support@yourdomain.com"
                      value={replyToEmail}
                      onChange={(e) => setReplyToEmail(e.target.value)}
                    />
                    <p className="text-xs text-text-secondary">If empty, replies go to the sender email.</p>
                  </div>

                  {/* Domain Verification */}
                  {domain && domainStatus === 'idle' && (
                    <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                      <p className="text-sm text-text-secondary mb-3">
                        To send emails from <strong className="text-text-primary">{domain}</strong>, we need to verify your domain with Resend.
                      </p>
                      <Button variant="primary" size="sm" onClick={handleAddDomain} loading={loading}>
                        <Globe className="w-4 h-4 mr-1.5" />
                        Verify Domain
                      </Button>
                    </div>
                  )}

                  {domainStatus === 'pending' && dnsRecords.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-text-primary">Add these DNS records to your domain</p>
                          <p className="text-xs text-text-secondary mt-1">
                            Go to your DNS provider (Cloudflare, Namecheap, etc.) and add these records. It may take a few minutes to propagate.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {dnsRecords.map((record, i) => (
                          <div key={i} className="bg-white rounded-lg p-3 border border-border text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <Badge variant="default">{record.type}</Badge>
                              <button
                                onClick={() => handleCopyDns(record.value, i)}
                                className="text-text-secondary hover:text-primary transition-colors"
                              >
                                {copiedIndex === i ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                            <p className="text-text-secondary"><strong>Name:</strong> {record.name}</p>
                            <p className="text-text-secondary break-all"><strong>Value:</strong> {record.value}</p>
                          </div>
                        ))}
                      </div>

                      <Button variant="primary" size="sm" onClick={handleVerifyDomain} loading={loading}>
                        Check Verification Status
                      </Button>
                    </div>
                  )}

                  {domainStatus === 'verified' && (
                    <div className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-success">Domain verified!</p>
                        <p className="text-xs text-text-secondary">Emails will be sent from {senderName} &lt;{senderEmail}&gt;</p>
                      </div>
                    </div>
                  )}

                  {verifyError && verifyError !== 'DOMAIN_LIMIT' && (
                    <p className="text-sm text-cta bg-cta/5 px-4 py-2 rounded-lg">{verifyError}</p>
                  )}

                  {verifyError === 'DOMAIN_LIMIT' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <Crown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-text-primary">Domain limit reached</p>
                          <p className="text-xs text-text-secondary mt-1">
                            Your current Resend plan only supports 1 domain. Upgrade your Resend account to add more domains for your clients.
                          </p>
                        </div>
                      </div>
                      <a
                        href="https://resend.com/settings/billing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        Upgrade Resend Plan
                      </a>
                    </div>
                  )}

                  {!step1Complete && step1HasInput && domainStatus !== 'verified' && domainStatus !== 'pending' && !verifyError && (
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                      <p className="text-xs text-text-secondary">
                        <strong className="text-text-primary">Required:</strong> You must verify your sending domain before proceeding. Click &ldquo;Verify Domain&rdquo; above to get started.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Tone */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">Choose Your Email Tone</h2>
                    <p className="text-sm text-text-secondary">This sets the voice for all your dunning emails</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {tones.map((tone) => (
                    <motion.button
                      key={tone.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTone(tone.value)}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all duration-200',
                        selectedTone === tone.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-text-primary">{tone.label}</span>
                        {selectedTone === tone.value && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">{tone.description}</p>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Retries */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">Configure Retry Schedule</h2>
                    <p className="text-sm text-text-secondary">Set how aggressively Revorva retries failed payments</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="retries">Maximum Retry Attempts</Label>
                    <Select id="retries" value={maxRetries} onChange={(e) => setMaxRetries(e.target.value)}>
                      <option value="1">1 attempt</option>
                      <option value="2">2 attempts</option>
                      <option value="3">3 attempts (recommended)</option>
                      <option value="5">5 attempts</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interval">Days Between Retries</Label>
                    <Select id="interval" value={retryInterval} onChange={(e) => setRetryInterval(e.target.value)}>
                      <option value="1">Every day</option>
                      <option value="2">Every 2 days</option>
                      <option value="3">Every 3 days (recommended)</option>
                      <option value="5">Every 5 days</option>
                      <option value="7">Every 7 days</option>
                    </Select>
                  </div>

                  <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                    <p className="text-sm text-text-secondary">
                      <strong className="text-text-primary">Your recovery timeline:</strong> Revorva will attempt up to {maxRetries} retries, spaced {retryInterval} days apart, with a personalized email at each step.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Test & Launch */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <Send className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">Test & Go Live</h2>
                    <p className="text-sm text-text-secondary">Send a test email and launch your recovery engine</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-background rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Your Configuration</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-text-secondary">Sender</p>
                        <p className="font-medium text-text-primary">{senderName || 'Revorva'} &lt;{senderEmail || 'billing@revorva.com'}&gt;</p>
                      </div>
                      <div>
                        <p className="text-text-secondary">Email Tone</p>
                        <p className="font-medium text-text-primary capitalize">{selectedTone}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary">Max Retries</p>
                        <p className="font-medium text-text-primary">{maxRetries} attempts</p>
                      </div>
                      <div>
                        <p className="text-text-secondary">Retry Interval</p>
                        <p className="font-medium text-text-primary">Every {retryInterval} days</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-4">
                    {testSent ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-2 text-success"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">Test email sent! Check your inbox.</span>
                      </motion.div>
                    ) : (
                      <Button variant="secondary" size="lg" onClick={handleTestEmail} loading={loading} className="gap-2">
                        <Send className="w-4 h-4" />
                        Send Test Email
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep < 4 ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={currentStep === 1 && !step1Complete}
              className="gap-1.5"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="cta"
              size="lg"
              onClick={handleLaunch}
              loading={saving}
              className="gap-1.5 group"
            >
              <Sparkles className="w-4 h-4" />
              Launch Recovery Engine
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
