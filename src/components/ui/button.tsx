'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'cta' | 'ghost' | 'outline' | 'accent'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseStyles = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50 shadow-md hover:shadow-lg',
      secondary: 'bg-white text-text-primary border border-border hover:border-primary/30 hover:bg-primary/5 focus:ring-primary/30',
      cta: 'bg-cta-gradient text-white shadow-cta hover:shadow-cta-hover focus:ring-cta/50',
      ghost: 'text-text-secondary hover:text-text-primary hover:bg-primary/5 focus:ring-primary/30',
      outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/50',
      accent: 'bg-accent-gradient text-white shadow-md hover:shadow-lg focus:ring-accent/50',
    }

    const sizes = {
      sm: 'text-sm px-4 py-2 gap-1.5',
      md: 'text-sm px-6 py-2.5 gap-2',
      lg: 'text-base px-8 py-3 gap-2.5',
      xl: 'text-lg px-10 py-4 gap-3',
    }

    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'

export { Button, type ButtonProps }
