'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, CheckCircle2, Building, Globe, Phone, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Logo, LogoMark } from '@/components/Logo'
import { createClient } from '@/lib/supabase/client'
import { NoiseTexture } from '@/components/InteractiveBackground'

const benefits = [
  '14-day free trial, no credit card',
  'Recovers 5-10x subscription cost',
  'Personalized dunning emails that convert',
  '5-minute setup, instant results',
]

const businessCategories = [
  'SaaS / Software',
  'E-commerce / Subscriptions',
  'Digital Products',
  'Media / Publishing',
  'Education / Courses',
  'Health & Fitness',
  'Finance / Fintech',
  'Other',
]

function PasswordStrength({ password }: { password: string }) {
  const checks = useMemo(() => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /\d/.test(password) },
    { label: 'One special character (!@#$...)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ], [password])

  const metCount = checks.filter((c) => c.met).length

  if (!password) return null

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < metCount
                ? metCount <= 2
                  ? 'bg-cta'
                  : metCount <= 3
                  ? 'bg-amber-400'
                  : 'bg-success'
                : 'bg-border'
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${check.met ? 'bg-success' : 'bg-border'}`}>
              {check.met && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className={`text-xs ${check.met ? 'text-success' : 'text-text-secondary'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyUrl, setCompanyUrl] = useState('')
  const [businessCategory, setBusinessCategory] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const passwordValid = useMemo(() => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    )
  }, [password])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordValid) {
      setError('Password does not meet all requirements')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          company_name: companyName,
          company_url: companyUrl,
          business_category: businessCategory,
          country,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex relative">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-dark-gradient relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-[15%] left-[15%] w-[400px] h-[400px] rounded-full bg-accent/15 blur-3xl animate-pulse" />
          <div className="absolute bottom-[15%] right-[15%] w-[350px] h-[350px] rounded-full bg-primary/20 blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        </div>
        <div className="absolute inset-0 grid-bg opacity-20" />
        <NoiseTexture opacity={0.05} />
        <div className="relative max-w-md px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-8">
              <LogoMark size="lg" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Join 500+ SaaS teams recovering revenue
            </h2>
            <p className="text-white/60 leading-relaxed mb-8">
              Start your free trial today. Most teams see their first recovery within 48 hours.
            </p>
            <ul className="space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-white/80 text-sm">{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 lg:px-8 py-12 lg:py-16 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="lg:hidden mb-6">
            <Logo size="md" />
          </div>

          <h1 className="text-2xl font-extrabold text-text-primary mb-2">Create your account</h1>
          <p className="text-text-secondary mb-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-8 bg-success/5 border border-success/20 rounded-2xl"
            >
              <Mail className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text-primary mb-2">Check your email</h3>
              <p className="text-sm text-text-secondary">
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name *</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                    <Input id="name" type="text" placeholder="Jane Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                    <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                  <Input id="email" type="email" placeholder="jane@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50 hover:text-text-secondary">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <p className="text-sm font-semibold text-text-primary mb-3">Business Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company name *</Label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                      <Input id="company" type="text" placeholder="Acme Inc." value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyUrl">Company website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                      <Input id="companyUrl" type="url" placeholder="https://acme.com" value={companyUrl} onChange={(e) => setCompanyUrl(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Business category *</Label>
                  <Select id="category" value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)} required>
                    <option value="">Select category</option>
                    {businessCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select id="country" value={country} onChange={(e) => setCountry(e.target.value)} required>
                    <option value="">Select country</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="NL">Netherlands</option>
                    <option value="SE">Sweden</option>
                    <option value="IE">Ireland</option>
                    <option value="SG">Singapore</option>
                    <option value="IN">India</option>
                    <option value="BR">Brazil</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-cta bg-cta/5 px-4 py-2 rounded-lg">
                  {error}
                </motion.p>
              )}

              <Button type="submit" variant="cta" size="lg" className="w-full group" loading={loading}>
                Start Free Trial
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>

              <p className="text-xs text-text-secondary text-center leading-relaxed">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
