'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Save, CheckCircle2, Upload, Loader2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria',
  'Azerbaijan','Bahamas','Bahrain','Bangladesh','Belarus','Belgium','Belize','Benin','Bolivia',
  'Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Cambodia',
  'Cameroon','Canada','Chile','China','Colombia','Congo','Costa Rica','Croatia','Cuba','Cyprus',
  'Czech Republic','Denmark','Dominican Republic','Ecuador','Egypt','El Salvador','Estonia',
  'Ethiopia','Finland','France','Georgia','Germany','Ghana','Greece','Guatemala','Honduras',
  'Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica',
  'Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Latvia','Lebanon','Libya',
  'Lithuania','Luxembourg','Malaysia','Mali','Malta','Mexico','Moldova','Monaco','Mongolia',
  'Montenegro','Morocco','Mozambique','Myanmar','Nepal','Netherlands','New Zealand','Nicaragua',
  'Nigeria','North Macedonia','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines',
  'Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia','Senegal','Serbia',
  'Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea','Spain','Sri Lanka',
  'Sudan','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Tunisia',
  'Turkey','Turkmenistan','Uganda','Ukraine','United Arab Emirates','United Kingdom',
  'United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zimbabwe',
]

const TIMEZONES = [
  { value: 'UTC-12:00', label: '(UTC-12:00) Baker Island' },
  { value: 'UTC-11:00', label: '(UTC-11:00) American Samoa' },
  { value: 'UTC-10:00', label: '(UTC-10:00) Hawaii' },
  { value: 'UTC-08:00', label: '(UTC-08:00) Pacific Time (US & Canada)' },
  { value: 'UTC-07:00', label: '(UTC-07:00) Mountain Time (US & Canada)' },
  { value: 'UTC-06:00', label: '(UTC-06:00) Central Time (US & Canada)' },
  { value: 'UTC-05:00', label: '(UTC-05:00) Eastern Time (US & Canada)' },
  { value: 'UTC-04:00', label: '(UTC-04:00) Atlantic Time' },
  { value: 'UTC-03:00', label: '(UTC-03:00) Buenos Aires, São Paulo' },
  { value: 'UTC-01:00', label: '(UTC-01:00) Azores' },
  { value: 'UTC+00:00', label: '(UTC+00:00) London, Dublin, Lisbon' },
  { value: 'UTC+01:00', label: '(UTC+01:00) Amsterdam, Berlin, Paris, Rome' },
  { value: 'UTC+02:00', label: '(UTC+02:00) Athens, Cairo, Johannesburg' },
  { value: 'UTC+03:00', label: '(UTC+03:00) Moscow, Nairobi, Riyadh' },
  { value: 'UTC+04:00', label: '(UTC+04:00) Dubai, Baku' },
  { value: 'UTC+05:00', label: '(UTC+05:00) Karachi, Tashkent' },
  { value: 'UTC+05:30', label: '(UTC+05:30) Mumbai, New Delhi' },
  { value: 'UTC+06:00', label: '(UTC+06:00) Dhaka, Almaty' },
  { value: 'UTC+07:00', label: '(UTC+07:00) Bangkok, Jakarta' },
  { value: 'UTC+08:00', label: '(UTC+08:00) Beijing, Singapore, Perth' },
  { value: 'UTC+09:00', label: '(UTC+09:00) Tokyo, Seoul' },
  { value: 'UTC+09:30', label: '(UTC+09:30) Adelaide, Darwin' },
  { value: 'UTC+10:00', label: '(UTC+10:00) Sydney, Melbourne' },
  { value: 'UTC+11:00', label: '(UTC+11:00) Solomon Islands' },
  { value: 'UTC+12:00', label: '(UTC+12:00) Auckland, Fiji' },
]

const selectClass = 'w-full border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/30'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [userId, setUserId] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [timezone, setTimezone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    setEmail(user.email || '')

    const { data } = await supabase
      .from('users')
      .select('first_name, last_name, phone, country, timezone, avatar_url')
      .eq('id', user.id)
      .single()

    if (data) {
      setFirstName(data.first_name || '')
      setLastName(data.last_name || '')
      setPhone(data.phone || '')
      setCountry(data.country || '')
      setTimezone(data.timezone || '')
      setAvatarUrl(data.avatar_url || '')
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('users').update({
      first_name: firstName,
      last_name: lastName,
      phone,
      country,
      timezone,
      avatar_url: avatarUrl,
    }).eq('id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    const allowed = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowed.includes(file.type)) {
      alert('Only PNG, JPG, or WebP files are supported.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Avatar must be under 2MB.')
      return
    }

    setUploading(true)
    const supabase = createClient()
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const path = `${userId}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) {
      alert(`Upload failed: ${uploadError.message}`)
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const urlWithBust = `${publicUrl}?t=${Date.now()}`
    setAvatarUrl(urlWithBust)
    const { error: dbError } = await supabase.from('users').update({ avatar_url: urlWithBust }).eq('id', userId)
    if (dbError) {
      alert(`Saved photo but failed to update profile: ${dbError.message}`)
    }
    setUploading(false)
  }

  const initials = [firstName, lastName].filter(Boolean).map(n => n[0]).join('').toUpperCase() || email[0]?.toUpperCase() || '?'

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
      <h1 className="text-2xl font-semibold text-ink">My Profile</h1>

      {/* Avatar */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-base font-semibold text-ink mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-accent-light border border-accent/20 flex items-center justify-center">
                <span className="text-lg font-semibold text-accent">{initials}</span>
              </div>
            )}
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading…' : 'Upload photo'}
            </Button>
            <p className="text-xs text-muted mt-1.5">PNG, JPG or WebP — max 2MB</p>
            {avatarUrl && (
              <button onClick={() => setAvatarUrl('')} className="text-xs text-red-500 hover:text-red-700 mt-1 underline">
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-white border border-border rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-semibold text-ink">Personal Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="first-name"
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
          />
          <Input
            id="last-name"
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Smith"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">Email address</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm text-muted bg-cream cursor-not-allowed"
          />
          <p className="text-xs text-muted mt-1">Email cannot be changed here. Contact support if needed.</p>
        </div>

        <Input
          id="phone"
          label="Phone number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555 000 0000"
        />

        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
            <option value="">Select your country...</option>
            {COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">Timezone</label>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={selectClass}>
            <option value="">Select your timezone...</option>
            {TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>

        <div className="pt-1">
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save changes</>}
          </Button>
        </div>
      </div>
    </div>
  )
}
