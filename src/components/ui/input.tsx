import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, type, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          className={cn(
            'flex h-11 w-full rounded-lg border bg-white px-4 py-2 text-sm text-ink',
            'placeholder:text-muted/60',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-cream',
            error ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-border',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
