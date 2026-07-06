'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

export default function ConnectPage() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [connectedSince, setConnectedSince] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setChecking(false); return }
      supabase
        .from('stripe_accounts')
        .select('stripe_account_id, created_at')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.stripe_account_id) {
            setIsConnected(true)
            setConnectedSince(data.created_at ?? null)
          }
          setChecking(false)
        })
    })
  }, [])

  const handleConnect = async () => {
    setLoading(true)
    window.location.href = '/api/stripe/connect/start'
  }

  const handleDisconnect = async () => {
    const confirmed = window.confirm(
      'Are you sure? This will stop all active recovery sequences immediately.'
    )
    if (!confirmed) return
    setDisconnecting(true)
    try {
      await fetch('/api/stripe/disconnect', { method: 'POST' })
      window.location.reload()
    } catch (err) {
      console.error('Disconnect failed:', err)
      setDisconnecting(false)
    }
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 40, background: 'var(--surface-3)', borderRadius: 8, opacity: 0.5 }} />
          ))}
        </div>
      </div>
    )
  }

  // ── Connected state ───────────────────────────────────────────────────────
  if (isConnected) {
    return (
      <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ maxWidth: 520, width: '100%' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
            <div style={{
              width: 48, height: 48, flexShrink: 0,
              background: 'var(--green-dim)', border: '1px solid var(--green-border)',
              borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--green)',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-sora), system-ui, sans-serif',
                fontSize: 20, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4,
              }}>
                Stripe account connected
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-2)', margin: 0 }}>
                Revorva is actively monitoring your failed payments.
              </p>
            </div>
          </div>

          {/* Details table */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '4px 0', marginBottom: 20,
          }}>
            {[
              {
                label: 'Status',
                value: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontSize: 13, fontWeight: 500 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--green)',
                      display: 'inline-block',
                      animation: 'pulse 2s ease-in-out infinite',
                    }} />
                    Active
                  </span>
                ),
              },
              {
                label: 'Access level',
                value: <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>Read-only · OAuth</span>,
              },
              connectedSince ? {
                label: 'Connected since',
                value: <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{format(new Date(connectedSince), 'MMM d, yyyy')}</span>,
              } : null,
            ].filter(Boolean).map((row, i, arr) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 20px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{(row as any).label}</span>
                {(row as any).value}
              </div>
            ))}
          </div>

          {/* Disconnect */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '11px 16px',
                background: 'transparent',
                border: '1px solid var(--border-mid)',
                borderRadius: 8, fontSize: 14, fontWeight: 500,
                color: 'var(--text-2)',
                cursor: disconnecting ? 'wait' : 'pointer',
                transition: 'all 0.15s',
                opacity: disconnecting ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!disconnecting) {
                  e.currentTarget.style.borderColor = 'var(--red)'
                  e.currentTarget.style.color = 'var(--red)'
                  e.currentTarget.style.background = 'var(--red-dim)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-mid)'
                e.currentTarget.style.color = 'var(--text-2)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                <line x1="2" y1="2" x2="22" y2="22"/>
              </svg>
              {disconnecting ? 'Disconnecting…' : 'Disconnect Stripe'}
            </button>
            <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', margin: 0 }}>
              Disconnecting will stop all active recovery sequences immediately.
            </p>
          </div>

        </div>
      </div>
    )
  }

  // ── Not connected state ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ maxWidth: 440, width: '100%' }}>

        {/* Step indicator — only shown pre-connection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
            Step 1 of 1
          </span>
          <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: '100%', background: '#C94A1F', borderRadius: 99 }} />
          </div>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-sora), system-ui, sans-serif',
          fontSize: 26, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8,
        }}>
          Connect your Stripe account
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 28 }}>
          We'll start listening for failed payments immediately. Takes 30 seconds.
        </p>

        {/* Connect button */}
        <button
          onClick={handleConnect}
          disabled={loading}
          style={{
            width: '100%', padding: '13px 20px',
            background: loading ? 'rgba(201,74,31,0.7)' : '#C94A1F',
            border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 600, color: '#fff',
            cursor: loading ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'opacity 0.15s',
            marginBottom: 16,
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          {loading ? 'Redirecting to Stripe…' : 'Connect Stripe account'}
          {!loading && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          )}
        </button>

        {/* Security note */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '14px 16px',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 10, marginBottom: 24,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: 'var(--text-3)', flexShrink: 0, marginTop: 1 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', margin: '0 0 3px' }}>Read-only access to payments</p>
            <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>
              We never touch your Stripe balance. We use Stripe OAuth — you authorize Revorva directly in Stripe's secure interface.
            </p>
          </div>
        </div>

        {/* What happens next */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Authorize Revorva in Stripe (30 seconds)',
            'We start listening for failed payments instantly',
            'First recovery email goes out automatically',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: 'var(--green)', flexShrink: 0 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{step}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
