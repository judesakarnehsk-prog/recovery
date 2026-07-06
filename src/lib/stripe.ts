import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  }
  return _stripe
}

// Named export for convenience — use in API routes only
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop]
  },
})

export function getStripeConnectUrl(state: string): string {
  const baseUrl = 'https://connect.stripe.com/oauth/authorize'
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.STRIPE_CONNECT_CLIENT_ID!,
    scope: 'read_write',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/connect`,
    state,
  })
  return `${baseUrl}?${params.toString()}`
}

export async function createConnectedStripe(code: string) {
  const s = getStripe()
  const response = await s.oauth.token({
    grant_type: 'authorization_code',
    code,
  })
  return response
}

export async function retryPaymentIntent(
  paymentIntentId: string,
  stripeAccountId: string
) {
  const s = getStripe()
  const paymentIntent = await s.paymentIntents.retrieve(
    paymentIntentId,
    { stripeAccount: stripeAccountId }
  )

  if (paymentIntent.status === 'requires_payment_method') {
    const confirmed = await s.paymentIntents.confirm(
      paymentIntentId,
      { stripeAccount: stripeAccountId }
    )
    return confirmed
  }

  return paymentIntent
}

export async function createCheckoutSession({
  priceId,
  customerId,
  customerEmail,
  userId,
  trialEndsAt,
}: {
  priceId: string
  customerId?: string
  customerEmail?: string
  userId?: string
  trialEndsAt?: string
}) {
  const s = getStripe()

  // Compute remaining trial from the user's existing trial_ends_at so the
  // Stripe subscription ends on the same day as the Supabase trial clock.
  // Fallback to 14 days only when no trial_ends_at exists (should not happen
  // in normal flow since the DB trigger sets it on signup).
  let trialData: { trial_end: number } | { trial_period_days: number }

  if (trialEndsAt) {
    const trialEndDate = new Date(trialEndsAt)
    const remainingMs = trialEndDate.getTime() - Date.now()
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24))

    if (remainingDays > 0) {
      // Pass exact Unix timestamp — Stripe uses this end date verbatim
      trialData = { trial_end: Math.floor(trialEndDate.getTime() / 1000) }
    } else {
      // Trial already expired — subscribe without a trial period
      trialData = { trial_period_days: 0 }
    }
  } else {
    // No trial_ends_at on record — give the full 14-day default
    trialData = { trial_period_days: 14 }
  }

  const session = await s.checkout.sessions.create({
    customer: customerId || undefined,
    customer_email: customerId ? undefined : customerEmail,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      ...trialData,
      metadata: userId ? { userId } : undefined,
    },
    metadata: userId ? { userId } : undefined,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    allow_promotion_codes: true,
  })
  return session
}
