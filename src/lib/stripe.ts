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

export async function createCheckoutSession(
  priceId: string,
  customerId: string,
  customerEmail: string
) {
  const s = getStripe()
  const session = await s.checkout.sessions.create({
    customer: customerId || undefined,
    customer_email: customerId ? undefined : customerEmail,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    allow_promotion_codes: true,
  })
  return session
}
