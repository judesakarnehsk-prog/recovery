import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  const customerId = profile?.stripe_customer_id

  if (!customerId) {
    return NextResponse.json(
      { error: 'No Stripe customer on file. Subscribe to a paid plan first.' },
      { status: 400 }
    )
  }

  try {
    const sessionParams: Parameters<typeof stripe.billingPortal.sessions.create>[0] = {
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    }

    if (process.env.STRIPE_PORTAL_CONFIG_ID) {
      sessionParams.configuration = process.env.STRIPE_PORTAL_CONFIG_ID
    }

    const session = await stripe.billingPortal.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[billing portal] Stripe error:', err?.message)

    // Detect unconfigured portal
    if (err?.message?.includes('configuration') || err?.code === 'portal_not_configured') {
      return NextResponse.json(
        { error: 'portal_not_configured', message: err.message },
        { status: 422 }
      )
    }

    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 })
  }
}
