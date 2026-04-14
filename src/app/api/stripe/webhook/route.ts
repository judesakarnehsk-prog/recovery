import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { generateDunningEmail } from '@/lib/claude'
import { sendDunningEmail } from '@/lib/resend'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const stripeAccountId = event.account

    if (!stripeAccountId) {
      console.log('No connected account in webhook, skipping')
      return NextResponse.json({ received: true })
    }

    try {
      const supabase = createServiceRoleClient()

      // Find the user by their connected Stripe account
      const { data: stripeAccount } = await supabase
        .from('stripe_accounts')
        .select('*, users(*)')
        .eq('stripe_account_id', stripeAccountId)
        .single()

      if (!stripeAccount) {
        console.log('No linked account found for:', stripeAccountId)
        return NextResponse.json({ received: true })
      }

      // Check if we already have a recovery for this payment intent
      const { data: existingRecovery } = await supabase
        .from('recoveries')
        .select('*')
        .eq('payment_intent_id', paymentIntent.id)
        .single()

      const emailStep = existingRecovery ? existingRecovery.email_step + 1 : 1
      const config = stripeAccount.config_json || { dunningTone: 'professional', maxRetries: 3 }

      if (emailStep > (config.maxRetries || 3)) {
        console.log('Max retries reached for:', paymentIntent.id)
        // Update recovery status to failed
        if (existingRecovery) {
          await supabase
            .from('recoveries')
            .update({ status: 'failed' })
            .eq('id', existingRecovery.id)
        }
        return NextResponse.json({ received: true })
      }

      // Get customer info from Stripe
      let customerEmail = ''
      let customerName = ''
      if (paymentIntent.customer) {
        try {
          const customer = await stripe.customers.retrieve(
            paymentIntent.customer as string,
            { stripeAccount: stripeAccountId }
          )
          if (!customer.deleted) {
            customerEmail = customer.email || ''
            customerName = customer.name || customer.email || 'Customer'
          }
        } catch {
          console.log('Could not fetch customer details')
        }
      }

      const declineCode = (paymentIntent.last_payment_error as any)?.decline_code || 'generic_decline'
      const amount = ((paymentIntent.amount || 0) / 100).toFixed(2)
      const paymentUpdateUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/portal?account=${stripeAccountId}&customer=${paymentIntent.customer}`

      // Generate AI dunning email
      const { subject, html } = await generateDunningEmail({
        step: emailStep,
        amount,
        product: 'your subscription',
        customerName,
        reason: declineCode,
        tone: config.dunningTone || 'professional',
        paymentUrl: paymentUpdateUrl,
      })

      // Resolve sender email — prefer verified custom domain
      let senderEmail = config.senderEmail || undefined
      let senderName = config.senderName || undefined
      const replyTo = config.replyToEmail || senderEmail || undefined

      if (config.senderDomainId) {
        const { data: domain } = await supabase
          .from('domains')
          .select('domain, verified')
          .eq('id', config.senderDomainId)
          .eq('user_id', stripeAccount.user_id)
          .single()

        if (domain?.verified) {
          const localPart = config.senderLocalPart || 'billing'
          senderEmail = `${localPart}@${domain.domain}`
          senderName = config.senderName || 'Billing Team'
        }
      }

      // Send via Resend — use client's verified sender email if available
      if (customerEmail) {
        await sendDunningEmail({
          to: customerEmail,
          subject,
          html,
          replyTo,
          senderEmail,
          senderName,
        })
      }

      // Upsert recovery record
      if (existingRecovery) {
        await supabase
          .from('recoveries')
          .update({
            email_step: emailStep,
            status: 'email_sent',
          })
          .eq('id', existingRecovery.id)
      } else {
        await supabase.from('recoveries').insert({
          user_id: stripeAccount.user_id,
          payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount,
          status: 'email_sent',
          email_step: emailStep,
          customer_email: customerEmail || null,
          failure_reason: declineCode || null,
        })
      }

      console.log(`Dunning email step ${emailStep} sent for PI ${paymentIntent.id}`)
    } catch (err) {
      console.error('Error processing failed payment:', err)
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    try {
      const supabase = createServiceRoleClient()

      // Mark recovery as successful
      const { data } = await supabase
        .from('recoveries')
        .update({
          status: 'recovered',
          recovered_at: new Date().toISOString(),
        })
        .eq('payment_intent_id', paymentIntent.id)
        .eq('status', 'email_sent')
        .select()

      if (data && data.length > 0) {
        console.log(`Payment recovered: ${paymentIntent.id}`)
      }
    } catch (err) {
      console.error('Error updating recovery:', err)
    }
  }

  return NextResponse.json({ received: true })
}
