import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createCheckoutSession } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const checkoutSchema = z.object({
  priceId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { priceId } = checkoutSchema.parse(body)

    // Look up existing Stripe customer ID
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    const session = await createCheckoutSession(
      priceId,
      userData?.stripe_customer_id || '',
      user.email || ''
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
