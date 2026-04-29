'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'ghost' | 'outline' | 'cta' | 'secondary'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 disabled:pointer-events-none select-none'

    const variants = {
      primary: 'bg-ink text-white hover:bg-ink/90 shadow-btn active:scale-[0.98] rounded-lg',
      accent: 'bg-accent text-white hover:bg-accent/90 shadow-btn-accent active:scale-[0.98] rounded-lg',
      ghost: 'text-ink/70 hover:text-ink hover:bg-cream rounded-lg',
      outline: 'border border-border text-ink bg-white hover:bg-cream active:scale-[0.98] rounded-lg',
      // Legacy aliases
      cta: 'bg-accent text-white hover:bg-accent/90 shadow-btn-accent active:scale-[0.98] rounded-lg',
      secondary: 'border border-border text-ink bg-white hover:bg-cream active:scale-[0.98] rounded-lg',
    }

    const sizes = {
      sm: 'text-sm px-4 py-2',
      md: 'text-sm px-5 py-2.5',
      lg: 'text-base px-6 py-3',
      xl: 'text-lg px-8 py-4',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, type ButtonProps }
