'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  light?: boolean
}

export function Logo({ size = 'md', className, light = false }: LogoProps) {
  const sizes = {
    sm: 'text-[20px]',
    md: 'text-[24px]',
    lg: 'text-[30px]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-baseline leading-none select-none',
        sizes[size],
        className
      )}
      style={{ letterSpacing: '-0.03em' }}
    >
      <span
        className="font-black"
        style={{
          background: 'linear-gradient(70deg, #6D28D9 0%, #8B5CF6 40%, #C4B5FD 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          paddingRight: '0.1em',
        }}
      >
        revorva
      </span>
    </span>
  )
}

export function LogoLink({ size = 'md', showText = true, className, light = false }: LogoProps) {
  return (
    <Link href="/" className={cn('group inline-flex', className)}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Logo size={size} light={light} />
      </motion.div>
    </Link>
  )
}

// LogoMark — full wordmark at larger size (login/signup panels)
export function LogoMark({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-3xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  }

  return (
    <span
      className={cn(
        'inline-flex items-baseline leading-none select-none',
        sizes[size],
        className
      )}
      style={{ letterSpacing: '-0.03em' }}
    >
      <span
        className="font-black"
        style={{
          background: 'linear-gradient(70deg, #6D28D9 0%, #8B5CF6 40%, #C4B5FD 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          paddingRight: '0.1em',
        }}
      >
        revorva
      </span>
    </span>
  )
}
