'use client'

import { useState } from 'react'
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ConnectPage() {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    window.location.href = '/api/stripe/connect/start'
  }

  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-xs font-medium text-muted uppercase tracking-wider">Step 1 of 1</span>
          <div className="flex-1 h-1 bg-border rounded-full">
            <div className="h-full bg-accent rounded-full w-full" />
          </div>
        </div>

        <h1 className="font-display text-3xl text-ink mb-2">Connect your Stripe account</h1>
        <p className="text-muted mb-8 leading-relaxed">
          We'll start listening for failed payments immediately. Takes 30 seconds.
        </p>

        {/* Connect button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          onClick={handleConnect}
        >
          Connect Stripe account
          <ArrowRight className="w-4 h-4" />
        </Button>

        {/* Security note */}
        <div className="mt-5 flex items-start gap-2.5 p-4 bg-cream border border-border rounded-xl">
          <Lock className="w-4 h-4 text-muted flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-ink font-medium mb-0.5">Read-only access to payments</p>
            <p className="text-xs text-muted">
              We never touch your Stripe balance. We use Stripe OAuth — you authorize Revorva directly in Stripe's secure interface.
            </p>
          </div>
        </div>

        {/* What happens next */}
        <div className="mt-6 space-y-3">
          {[
            'Authorize Revorva in Stripe (30 seconds)',
            'We start listening for failed payments instantly',
            'First recovery email goes out automatically',
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm text-muted">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
