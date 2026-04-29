import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { undo } = await request.json().catch(() => ({ undo: false }))

  // Get user's Stripe customer ID
  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
  }

  // Find active subscription
  const subscriptions = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status: 'active',
    limit: 1,
  })

  if (subscriptions.data.length === 0) {
    // Check for trialing subscriptions too
    const trialing = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'trialing',
      limit: 1,
    })
    if (trialing.data.length === 0) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }
    subscriptions.data.push(...trialing.data)
  }

  const subscription = subscriptions.data[0]

  // Toggle cancel_at_period_end
  const updated = await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: !undo,
  })

  return NextResponse.json({
    cancelled: updated.cancel_at_period_end,
    cancelAt: updated.cancel_at ? new Date(updated.cancel_at * 1000).toISOString() : null,
    currentPeriodEnd: new Date(updated.current_period_end * 1000).toISOString(),
  })
}
