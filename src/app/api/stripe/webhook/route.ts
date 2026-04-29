export const runtime = 'nodejs'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendRecoveryEmail } from '@/lib/recovery'

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

  const supabase = createServiceRoleClient()

  // ─── invoice.payment_failed ───────────────────────────────────────────────
  // Primary trigger for subscription recovery. Fires every time Stripe fails
  // to collect payment on a subscription invoice.
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const stripeAccountId = event.account

    try {
      // Look up the stripe account — by connected account ID if present,
      // otherwise fall back to the first account (handles direct CLI test triggers)
      let stripeAccount: any = null
      if (stripeAccountId) {
        const { data } = await supabase
          .from('stripe_accounts')
          .select('*, users(*)')
          .eq('stripe_account_id', stripeAccountId)
          .single()
        stripeAccount = data
      } else {
        // No connected account — use the first stripe_account row (test/dev mode)
        const { data } = await supabase
          .from('stripe_accounts')
          .select('*, users(*)')
          .limit(1)
          .single()
        stripeAccount = data
      }

      if (!stripeAccount) {
        console.log('No linked account found, skipping')
        return NextResponse.json({ received: true })
      }

      // Pause guard: if the user has paused recovery, acknowledge the webhook without creating a job
      if (stripeAccount.config_json?.recoveryPaused === true) {
        console.log(`[webhook] recovery paused for user ${stripeAccount.user_id}, skipping invoice ${invoice.id}`)
        return NextResponse.json({ received: true })
      }

      const paymentIntentId = typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent
        : invoice.payment_intent?.id || invoice.id

      const config = stripeAccount.config_json || {}
      const maxRetries = config.maxRetries || 3
      const declineCode = (invoice.last_finalization_error as any)?.decline_code || 'payment_failed'

      // Get customer info
      let customerEmail = ''
      let customerName = ''
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
      if (customerId) {
        try {
          const customer = await stripe.customers.retrieve(customerId, { stripeAccount: stripeAccountId })
          if (!customer.deleted) {
            customerEmail = (customer as Stripe.Customer).email || ''
            customerName = (customer as Stripe.Customer).name || ''
          }
        } catch {
          console.log('[webhook] Could not fetch customer details')
        }
      }

      // Resolve verified sender domain: query by verification_status (text column)
      const { data: verifiedDomain } = await supabase
        .from('domains')
        .select('domain')
        .eq('user_id', stripeAccount.user_id)
        .eq('verification_status', 'verified')
        .order('verified_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      console.log('[webhook] Verified domain lookup:', verifiedDomain?.domain ?? 'none — will use revorva.com')

      const senderDomain = verifiedDomain?.domain || null
      const fromDomain = senderDomain || 'revorva.com'
      const businessName = config.businessName || 'Billing'
      const localPart = config.senderLocalPart || 'billing'
      const fromAddress = `${businessName} <${localPart}@${fromDomain}>`

      console.log('[webhook] fromAddress (used for both Claude + fallback):', fromAddress)

      // ── Layer 1 idempotency: DB-first insert ──────────────────────────────
      // We attempt to INSERT first. If a duplicate already exists (unique constraint
      // on payment_intent_id, Postgres error 23505), this is a retried webhook —
      // skip entirely. This prevents race conditions where two near-simultaneous
      // invocations both pass a "does row exist?" check before either inserts.
      //
      // For step 1 (new recovery): INSERT → on 23505, skip.
      // For steps 2+: the row already exists, so we use an atomic UPDATE
      //   WHERE email_step = currentStep - 1 (optimistic locking).
      //   0 rows updated = another invocation already advanced it → skip.

      // Check if recovery already exists
      const { data: existingRecovery } = await supabase
        .from('recoveries')
        .select('*')
        .eq('payment_intent_id', paymentIntentId)
        .maybeSingle()

      const emailStep = existingRecovery ? existingRecovery.email_step + 1 : 1

      if (emailStep > maxRetries) {
        console.log('[webhook] Max retries reached for:', paymentIntentId)
        if (existingRecovery) {
          await supabase
            .from('recoveries')
            .update({ status: 'failed', failure_reason: 'max_retries_reached' })
            .eq('id', existingRecovery.id)
        }
        return NextResponse.json({ received: true })
      }

      // Build the recovery job object — matches RecoveryJob shape from @/types
      const RETRY_INTERVALS_DAYS = [3, 4, 7]
      const daysUntilNext = RETRY_INTERVALS_DAYS[emailStep - 1] ?? null
      const nextRetryAt = daysUntilNext !== null
        ? new Date(Date.now() + daysUntilNext * 24 * 60 * 60 * 1000).toISOString()
        : null

      let recoveryId: string

      if (!existingRecovery) {
        // Step 1: attempt INSERT — check for 23505 to detect duplicate webhook
        const { data: inserted, error: insertErr } = await supabase
          .from('recoveries')
          .insert({
            user_id: stripeAccount.user_id,
            payment_intent_id: paymentIntentId,
            stripe_account_id: stripeAccountId || null,
            amount: invoice.amount_due,
            currency: invoice.currency || 'usd',
            status: 'email_sent',
            email_step: emailStep,
            customer_email: customerEmail || null,
            customer_name: customerName || null,
            failure_reason: declineCode || null,
            next_retry_at: nextRetryAt,
          })
          .select('id')
          .single()

        if (insertErr) {
          if ((insertErr as any).code === '23505') {
            // Duplicate webhook — another invocation already inserted this row
            console.log(`[webhook] duplicate event for invoice ${invoice.id}, skipping`)
            return NextResponse.json({ received: true })
          }
          console.error('[webhook] DB insert error:', insertErr)
          return NextResponse.json({ received: true })
        }

        recoveryId = inserted!.id
        console.log('[webhook] Recovery row saved, user_id:', stripeAccount.user_id)
      } else {
        // Steps 2+: atomic UPDATE with optimistic locking on current email_step
        // If 0 rows updated, another invocation already advanced it → skip
        const currentStep = existingRecovery.email_step
        const { data: updated, error: updateErr } = await supabase
          .from('recoveries')
          .update({ email_step: emailStep, status: 'email_sent', next_retry_at: nextRetryAt })
          .eq('id', existingRecovery.id)
          .eq('email_step', currentStep) // optimistic lock: only update if step hasn't changed
          .select('id')

        if (updateErr) {
          console.error('[webhook] DB update error:', updateErr)
          return NextResponse.json({ received: true })
        }

        if (!updated || updated.length === 0) {
          // Another invocation already advanced this row — skip
          console.log(`[webhook] duplicate event for invoice ${invoice.id} (step already advanced), skipping`)
          return NextResponse.json({ received: true })
        }

        recoveryId = existingRecovery.id
      }

      // ── Layer 3 idempotency: check email_log before sending ──────────────
      // Guards against re-sends if the process crashes between DB write and email send
      // on the first invocation, or if Layer 1 check somehow passes both instances.
      const { data: existingLog } = await supabase
        .from('email_log')
        .select('id')
        .eq('recovery_id', recoveryId)
        .eq('step', emailStep)
        .eq('status', 'sent')
        .maybeSingle()

      if (existingLog) {
        console.log(`[webhook] email already logged for recovery ${recoveryId} step ${emailStep}, skipping send`)
        return NextResponse.json({ received: true })
      }

      // Send email via sendRecoveryEmail — handles Claude + fallback with correct branding
      if (customerEmail) {
        const job = {
          id: recoveryId,
          user_id: stripeAccount.user_id,
          payment_intent_id: paymentIntentId,
          stripe_account_id: stripeAccountId || null,
          customer_email: customerEmail,
          customer_name: customerName || null,
          amount: invoice.amount_due,
          currency: invoice.currency || 'usd',
          status: 'email_sent' as const,
          email_step: emailStep,
          failure_reason: declineCode || null,
          next_retry_at: nextRetryAt,
          recovered_at: null,
          created_at: existingRecovery?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        const attemptNumber = Math.min(emailStep, 3) as 1 | 2 | 3
        const emailResult = await sendRecoveryEmail(job, stripeAccount, attemptNumber, senderDomain)

        if (emailResult.sent) {
          // Write email_log entry — unique on (recovery_id, step), parallel 23505 is harmless
          await supabase.from('email_log').insert({
            recovery_id: recoveryId,
            user_id: stripeAccount.user_id,
            step: emailStep,
            to_email: customerEmail,
            subject: emailResult.subject,
            status: 'sent',
            resend_id: emailResult.resendId,
          })
          console.log(`[webhook] step ${emailStep} email dispatched for invoice ${invoice.id}`)
        } else {
          console.error(`[webhook] email send failed for invoice ${invoice.id} step ${emailStep}`)
        }
      } else {
        console.log('[webhook] No customer email — skipping send')
      }
    } catch (err) {
      console.error('Error processing invoice.payment_failed:', err)
    }
  }

  // ─── invoice.paid ─────────────────────────────────────────────────────────
  // Fires when a previously failing invoice is finally paid — mark recovered.
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice

    try {
      const paymentIntentId = typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent
        : invoice.payment_intent?.id || invoice.id

      const { data } = await supabase
        .from('recoveries')
        .update({
          status: 'recovered',
          recovered_at: new Date().toISOString(),
        })
        .eq('payment_intent_id', paymentIntentId)
        .in('status', ['pending', 'email_sent', 'skipped'])
        .select()

      if (data && data.length > 0) {
        console.log(`Recovery marked as recovered: invoice ${invoice.id}`)
      }
    } catch (err) {
      console.error('Error processing invoice.paid:', err)
    }
  }

  // ─── customer.subscription.deleted ───────────────────────────────────────
  // Fires when: (a) trial ends with no payment method (if Stripe is set to
  // "Cancel immediately"), or (b) a paid subscription is cancelled.
  // In both cases: downgrade the Revorva user's plan to 'expired' and cancel
  // any open recovery jobs for their customers.
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id

    try {
      // This event fires on the platform account (not a connected account),
      // so we look up the user by their stripe_customer_id.
      if (!customerId) {
        return NextResponse.json({ received: true })
      }

      const { data: revorvaUser } = await supabase
        .from('users')
        .select('id, plan')
        .eq('stripe_customer_id', customerId)
        .single()

      if (revorvaUser) {
        await supabase
          .from('users')
          .update({ plan: 'expired' })
          .eq('id', revorvaUser.id)

        console.log(`[webhook] subscription deleted — user ${revorvaUser.id} downgraded from '${revorvaUser.plan}' to 'expired'`)
      }

      // Also cancel any open recovery jobs on their *connected* Stripe account
      const stripeAccountId = event.account
      if (stripeAccountId) {
        const { data: stripeAccount } = await supabase
          .from('stripe_accounts')
          .select('user_id')
          .eq('stripe_account_id', stripeAccountId)
          .single()

        if (stripeAccount) {
          let customerEmail: string | null = null
          try {
            const customer = await stripe.customers.retrieve(customerId, {
              stripeAccount: stripeAccountId,
            })
            if (!customer.deleted) {
              customerEmail = (customer as Stripe.Customer).email
            }
          } catch {}

          if (customerEmail) {
            await supabase
              .from('recoveries')
              .update({ status: 'cancelled' })
              .eq('user_id', stripeAccount.user_id)
              .eq('customer_email', customerEmail)
              .in('status', ['pending', 'email_sent'])
          }
        }
      }
    } catch (err) {
      console.error('Error processing customer.subscription.deleted:', err)
    }
  }

  // ─── customer.subscription.updated ───────────────────────────────────────
  // Fires when subscription status changes: trialing → active (trial converted),
  // active → past_due (payment failed after trial), etc.
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id

    // Only handle platform-level subscriptions (Revorva's own billing),
    // not connected account subscription changes.
    if (event.account) {
      return NextResponse.json({ received: true })
    }

    if (!customerId) {
      return NextResponse.json({ received: true })
    }

    try {
      const { data: revorvaUser } = await supabase
        .from('users')
        .select('id, plan')
        .eq('stripe_customer_id', customerId)
        .single()

      if (!revorvaUser) {
        return NextResponse.json({ received: true })
      }

      const newStatus = subscription.status

      if (newStatus === 'past_due' || newStatus === 'unpaid') {
        // Payment failed after trial converted — show upgrade prompt but don't
        // hard-block yet (grace period handled in middleware).
        await supabase
          .from('users')
          .update({ plan: 'past_due' })
          .eq('id', revorvaUser.id)

        console.log(`[webhook] subscription ${newStatus} — user ${revorvaUser.id} plan set to 'past_due'`)
      } else if (newStatus === 'active') {
        // Subscription became active — trial successfully converted to paid,
        // OR a past_due subscription was resolved. Resolve the correct plan
        // from the subscription's price ID.
        const priceId = subscription.items.data[0]?.price?.id

        const planMap: Record<string, string> = {
          [process.env.STRIPE_STARTER_PRICE_ID || '']: 'starter',
          [process.env.STRIPE_GROWTH_PRICE_ID || '']: 'growth',
          [process.env.STRIPE_SCALE_PRICE_ID || '']: 'scale',
        }

        const plan = (priceId && planMap[priceId]) ? planMap[priceId] : revorvaUser.plan

        if (['starter', 'growth', 'scale'].includes(plan)) {
          await supabase
            .from('users')
            .update({ plan })
            .eq('id', revorvaUser.id)

          console.log(`[webhook] subscription active — user ${revorvaUser.id} plan confirmed as '${plan}'`)
        }
      } else if (newStatus === 'canceled') {
        await supabase
          .from('users')
          .update({ plan: 'expired' })
          .eq('id', revorvaUser.id)

        console.log(`[webhook] subscription canceled via update — user ${revorvaUser.id} downgraded to 'expired'`)
      }
    } catch (err) {
      console.error('Error processing customer.subscription.updated:', err)
    }
  }

  // ─── checkout.session.completed ──────────────────────────────────────────
  // Fires when a Revorva user completes their own subscription checkout.
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Only process sessions for Revorva's own billing (not connected accounts)
    if (event.account) {
      return NextResponse.json({ received: true })
    }

    const userId = session.metadata?.userId
    const customerId = typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id

    if (!userId || !customerId) {
      return NextResponse.json({ received: true })
    }

    try {
      // Fetch the full session with line_items expanded.
      // Stripe does NOT include line_items in the webhook payload by default —
      // accessing session.line_items directly always returns undefined.
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      })

      const priceId = fullSession.line_items?.data?.[0]?.price?.id

      const planMap: Record<string, string> = {
        [process.env.STRIPE_STARTER_PRICE_ID || '']: 'starter',
        [process.env.STRIPE_GROWTH_PRICE_ID || '']: 'growth',
        [process.env.STRIPE_SCALE_PRICE_ID || '']: 'scale',
      }

      let plan = 'starter'
      if (priceId) {
        const mapped = planMap[priceId]
        if (mapped) {
          plan = mapped
        } else {
          console.error(`checkout.session.completed: unrecognised priceId "${priceId}" — defaulting to starter. Check STRIPE_*_PRICE_ID env vars.`)
        }
      } else {
        console.error(`checkout.session.completed: no priceId found in line_items for session ${session.id} — defaulting to starter`)
      }

      await supabase
        .from('users')
        .update({
          stripe_customer_id: customerId,
          plan,
        })
        .eq('id', userId)

      console.log(`checkout.session.completed: user ${userId} → plan "${plan}" (priceId: ${priceId ?? 'none'})`)
    } catch (err) {
      console.error('Error processing checkout.session.completed:', err)
    }
  }

  // ─── payment_intent.payment_failed ───────────────────────────────────────
  // Skip entirely if this PI is attached to an invoice — invoice.payment_failed
  // already fired (or will fire) for the same event and is the canonical handler.
  // Handling both causes duplicate recovery rows (error 23505) and duplicate emails.
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    if (paymentIntent.invoice) {
      console.log(`[webhook] Skipping payment_intent.payment_failed for PI ${paymentIntent.id} — invoice-attached, handled by invoice.payment_failed`)
      return NextResponse.json({ received: true })
    }
    // One-off (non-invoice) payment failure — log but don't trigger recovery.
    // Revorva focuses on subscription invoice recovery; one-off failures are out of scope.
    console.log(`[webhook] Standalone payment_intent.payment_failed for PI ${paymentIntent.id} — no invoice attached, not triggering recovery`)
    return NextResponse.json({ received: true })
  }

  // ─── charge.failed ───────────────────────────────────────────────────────
  // Same as above: fires as a side-effect of invoice payment failures.
  // Always skip — recovery is driven from invoice events only.
  if (event.type === 'charge.failed') {
    const charge = event.data.object as Stripe.Charge
    const invoiceId = (charge as any).invoice
    if (invoiceId) {
      console.log(`[webhook] Skipping charge.failed for charge ${charge.id} — invoice-attached, handled by invoice.payment_failed`)
    } else {
      console.log(`[webhook] Skipping charge.failed for charge ${charge.id} — standalone charge, not in scope`)
    }
    return NextResponse.json({ received: true })
  }

  // ─── payment_intent.succeeded (fallback for non-subscription) ────────────
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    try {
      await supabase
        .from('recoveries')
        .update({
          status: 'recovered',
          recovered_at: new Date().toISOString(),
        })
        .eq('payment_intent_id', paymentIntent.id)
        .in('status', ['pending', 'email_sent', 'skipped'])
    } catch (err) {
      console.error('Error processing payment_intent.succeeded:', err)
    }
  }

  return NextResponse.json({ received: true })
}
