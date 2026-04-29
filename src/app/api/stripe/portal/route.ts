import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const account = searchParams.get('account')
  const customer = searchParams.get('customer')

  if (!account || !customer) {
    return NextResponse.json({ error: 'Missing account or customer' }, { status: 400 })
  }

  // Validate customer belongs to this connected account before creating session
  try {
    const stripeCustomer = await stripe.customers.retrieve(customer, {
      stripeAccount: account,
    })

    if (stripeCustomer.deleted) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid customer' }, { status: 400 })
  }

  try {
    const session = await stripe.billingPortal.sessions.create(
      {
        customer,
        return_url: process.env.NEXT_PUBLIC_APP_URL || 'https://revorva.com',
      },
      {
        stripeAccount: account,
      }
    )

    return NextResponse.redirect(session.url)
  } catch (err: any) {
    // Billing portal not configured — fall back to Stripe dashboard for the customer
    console.error('[portal] billing portal error:', err?.message)

    // Try to get the latest open invoice URL as fallback
    try {
      const invoices = await stripe.invoices.list(
        { customer, status: 'open', limit: 1 },
        { stripeAccount: account }
      )

      if (invoices.data.length > 0 && invoices.data[0].hosted_invoice_url) {
        return NextResponse.redirect(invoices.data[0].hosted_invoice_url)
      }
    } catch {}

    return NextResponse.json(
      { error: 'Billing portal not configured. Please contact support.' },
      { status: 500 }
    )
  }
}
