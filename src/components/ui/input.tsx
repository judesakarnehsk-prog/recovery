import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex h-11 w-full rounded-xl border bg-white px-4 py-2 text-sm text-text-primary',
            'placeholder:text-text-secondary/50',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-red-400 focus:ring-red-200 focus:border-red-500' : 'border-border',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-500">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
