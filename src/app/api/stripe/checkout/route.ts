import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createCheckoutSession } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const checkoutSchema = z.object({
  priceId: z.string().min(1),
})

function getAllowedPriceIds(): string[] {
  return [
    process.env.STRIPE_STARTER_PRICE_ID,
    process.env.STRIPE_GROWTH_PRICE_ID,
    process.env.STRIPE_SCALE_PRICE_ID,
  ].filter(Boolean) as string[]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { priceId } = checkoutSchema.parse(body)

    // Security: only accept known price IDs — prevent arbitrary price manipulation
    const allowedPriceIds = getAllowedPriceIds()
    if (allowedPriceIds.length > 0 && !allowedPriceIds.includes(priceId)) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 })
    }

    // Look up existing Stripe customer ID
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    const session = await createCheckoutSession(
      priceId,
      userData?.stripe_customer_id || '',
      user.email || '',
      user.id
    )

    return NextResponse.json({ url: session.url })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
