'use client'

import { useState } from 'react'
import { Send, CheckCircle2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSent(true)
      setForm({ name: '', email: '', message: '' })
    } catch {
      setError('Something went wrong. Please try again or email us directly.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            Have a question or want to learn more? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-12">
          <div className="md:col-span-3">
            {sent ? (
              <div className="text-center py-12 bg-success/5 border border-success/20 rounded-2xl">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                <h3 className="text-xl font-bold text-text-primary mb-2">Message Sent!</h3>
                <p className="text-sm text-text-secondary">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="How can we help?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    className="flex w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button variant="primary" size="lg" loading={sending} className="gap-2">
                  <Send className="w-4 h-4" />
                  Send Message
                </Button>
              </form>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-2">Email</h3>
              <a href="mailto:hello@revorva.com" className="text-sm text-primary hover:underline">hello@revorva.com</a>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-2">Support</h3>
              <a href="mailto:support@revorva.com" className="text-sm text-primary hover:underline">support@revorva.com</a>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-2">Office</h3>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-text-secondary/50 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary leading-relaxed">
                  167-169 Great Portland Street<br />
                  5th Floor, London, W1W 5PF<br />
                  United Kingdom
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
