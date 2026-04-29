import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'recovered' | 'in-progress' | 'failed' | 'pending' | 'skipped' | 'accent' | 'success' | 'warning' | 'error'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-cream text-ink border border-border',
    recovered: 'bg-green-50 text-green-700 border border-green-200',
    'in-progress': 'bg-amber-50 text-amber-700 border border-amber-200',
    failed: 'bg-red-50 text-red-700 border border-red-200',
    pending: 'bg-cream text-muted border border-border',
    skipped: 'bg-slate-50 text-slate-500 border border-slate-200',
    accent: 'bg-accent-light text-accent border border-accent/20',
    // Legacy aliases
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
