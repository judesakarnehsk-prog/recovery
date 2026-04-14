import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            'flex min-h-[100px] w-full rounded-xl border bg-white px-4 py-3 text-sm text-text-primary',
            'placeholder:text-text-secondary/50',
            'transition-all duration-200 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-cta/50' : 'border-border',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-cta">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
