'use client'

import { useState } from 'react'
import { Twitter, Linkedin, Copy, Check } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

export function BlogShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const url = typeof window !== 'undefined' ? window.location.href : ''

  const handleTwitter = () => {
    trackEvent('blog_shared', { platform: 'twitter' })
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleLinkedIn = () => {
    trackEvent('blog_shared', { platform: 'linkedin' })
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      trackEvent('blog_shared', { platform: 'copy' })
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleTwitter}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-accent hover:border-accent transition-colors"
      >
        <Twitter className="w-3.5 h-3.5" />
        X / Twitter
      </button>
      <button
        onClick={handleLinkedIn}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-accent hover:border-accent transition-colors"
      >
        <Linkedin className="w-3.5 h-3.5" />
        LinkedIn
      </button>
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
          copied ? 'border-green-300 text-green-700 bg-green-50' : 'border-border text-muted hover:text-accent hover:border-accent'
        }`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  )
}
