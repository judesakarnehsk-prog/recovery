'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ size = 'md', className }: LogoProps) {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }
  return (
    <span className={cn('font-bold text-ink font-sans', sizes[size], className)}>
      Revorva<span className="text-accent">.</span>
    </span>
  )
}

export function LogoLink({ size = 'md', className }: LogoProps) {
  return (
    <Link href="/" className={cn('inline-flex', className)}>
      <Logo size={size} />
    </Link>
  )
}

export function LogoMark({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'text-3xl', md: 'text-4xl', lg: 'text-5xl' }
  return (
    <span className={cn('font-bold text-ink font-sans', sizes[size], className)}>
      Revorva<span className="text-accent">.</span>
    </span>
  )
}
