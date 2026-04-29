import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateRecoveryEmail } from '@/lib/claude'
import { buildFallbackEmail } from '@/lib/emailFallback'
import { resend } from '@/lib/resend'
import { getStripe } from '@/lib/stripe'
import type { RecoveryJob } from '@/types'

interface ConnectedAccount {
  stripe_account_id: string
  config_json: {
    businessName?: string
    replyToEmail?: string
    senderName?: string
    senderLocalPart?: string
    senderDomainId?: string
    brandColor?: string
    logoUrl?: string
    dunningTone?: string
    subjectPrefix?: string
  }
}

// Schedule: Day 0 (Email + Retry) → Day 3 (Email + Retry)
//         → Day 7 (Email + Retry) → Day 14 (Final Stripe retry only, no email)
// Gaps between steps in days — index matches email_step - 1
// Step 4 trailing 0 means no further retry is scheduled after it
const RETRY_INTERVALS_DAYS = [3, 4, 7, 0]

export async function retryPayment(
  stripeAccountId: string,
  invoiceId: string
): Promise<'recovered' | 'still_open' | 'failed'> {
  try {
    const stripe = getStripe()

    // First check current invoice status — avoid unnecessary retry attempts
    const invoice = await stripe.invoices.retrieve(invoiceId, {
      stripeAccount: stripeAccountId,
    })

    if (invoice.status === 'paid') return 'recovered'
    if (invoice.status === 'void' || invoice.status === 'uncollectible') return 'failed'

    // Invoice is still open — attempt payment
    const paid = await stripe.invoices.pay(invoiceId, {
      stripeAccount: stripeAccountId,
    })
    return paid.status === 'paid' ? 'recovered' : 'still_open'
  } catch (err: any) {
    // Card declined, insufficient funds, etc. — not a system error
    if (err?.code === 'card_declined' || err?.type === 'StripeCardError') {
      return 'still_open'
    }
    console.error('[recovery] retryPayment error:', err)
    return 'still_open'
  }
}

// Returns "there" if name is empty or looks like an email address
function sanitizeCustomerName(name: string | null | undefined): string {
  if (!name) return 'there'
  const trimmed = name.trim()
  if (!trimmed || trimmed.includes('@')) return 'there'
  return trimmed.split(' ')[0]
}

interface SendRecoveryEmailResult {
  sent: boolean
  subject: string
  resendId: string | null
}

export async function sendRecoveryEmail(
  job: RecoveryJob,
  account: ConnectedAccount,
  attemptNumber: 1 | 2 | 3,
  senderDomain?: string | null
): Promise<SendRecoveryEmailResult> {
  try {
    const businessName = account.config_json?.businessName || 'Your service'
    const brandColor = account.config_json?.brandColor || '#c8401a'
    const logoUrl = account.config_json?.logoUrl || undefined
    const replyTo = account.config_json?.replyToEmail
    const dunningTone = account.config_json?.dunningTone || 'professional'
    const subjectPrefix = account.config_json?.subjectPrefix || ''
    const safeCustomerName = sanitizeCustomerName(job.customer_name)

    console.log('[recovery] sendRecoveryEmail — branding config:', {
      businessName,
      brandColor,
      logoUrl: logoUrl || null,
      replyTo: replyTo || null,
      dunningTone,
      subjectPrefix: subjectPrefix || null,
    })

    // Use Stripe hosted invoice URL for payment link
    const stripe = getStripe()
    let billingPortalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/portal?account=${account.stripe_account_id}&customer=${job.customer_email}`
    try {
      const invoice = await stripe.invoices.retrieve(job.payment_intent_id, {
        stripeAccount: account.stripe_account_id,
      })
      if (invoice.hosted_invoice_url) {
        billingPortalUrl = invoice.hosted_invoice_url
      }
    } catch {}

    let subject: string
    let html: string

    try {
      const result = await generateRecoveryEmail({
        customerName: safeCustomerName,
        businessName,
        amount: job.amount,
        currency: job.currency,
        attemptNumber,
        billingPortalUrl,
        brandColor,
        logoUrl,
        dunningTone,
        subjectPrefix,
      })
      subject = result.subject
      html = result.html
    } catch (claudeErr) {
      console.error('[recovery] Claude failed, using branded fallback:', claudeErr)
      const currencyUpper = (job.currency || 'usd').toUpperCase()
      const ZERO_DECIMAL_CURRENCIES = new Set(['BIF','CLP','DJF','GNF','JPY','KMF','KRW','MGA','PYG','RWF','UGX','VND','VUV','XAF','XOF','XPF'])
      const divisor = ZERO_DECIMAL_CURRENCIES.has(currencyUpper) ? 1 : 100
      const amountFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyUpper,
      }).format((job.amount || 0) / divisor)
      const fallback = buildFallbackEmail({
        attemptNumber,
        customerName: safeCustomerName,
        businessName,
        amount: amountFormatted,
        brandColor,
        logoUrl,
        paymentUrl: billingPortalUrl,
      })
      subject = fallback.subject
      html = fallback.html
    }

    // Determine sender email
    const localPart = account.config_json?.senderLocalPart || 'billing'
    const displayName = account.config_json?.senderName || businessName
    const fromDomain = senderDomain || 'revorva.com'
    const fromEmail = `${displayName} <${localPart}@${fromDomain}>`

    console.log('[recovery] Using from address:', fromEmail)
    console.log('[recovery] Sending to:', job.customer_email, '| subject:', subject)

    const { data: sendData, error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: job.customer_email,
      reply_to: replyTo || undefined,
      subject,
      html,
    })

    if (sendError) {
      console.error('[recovery] Resend error:', sendError)
      return { sent: false, subject, resendId: null }
    }

    return { sent: true, subject, resendId: sendData?.id ?? null }
  } catch (err) {
    console.error('[recovery] sendRecoveryEmail error:', err)
    return { sent: false, subject: '', resendId: null }
  }
}

export async function processRecoveryJob(jobId: string): Promise<void> {
  const supabase = createServiceRoleClient()

  const { data: job, error } = await supabase
    .from('recoveries')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error || !job) {
    console.error('[recovery] job not found:', jobId)
    return
  }

  if (job.status === 'recovered' || job.status === 'failed' || job.status === 'cancelled' || job.status === 'skipped') return

  // Get user's Stripe account config
  const { data: account } = await supabase
    .from('stripe_accounts')
    .select('stripe_account_id, config_json')
    .eq('user_id', job.user_id)
    .single()

  if (!account) {
    console.error('[recovery] no stripe account for user:', job.user_id)
    return
  }

  // Pause guard: if the user has paused recovery, leave next_retry_at unchanged and return
  if (account.config_json?.recoveryPaused === true) {
    console.log('[recovery] paused for user, skipping job:', jobId)
    return
  }

  // Check invoice status before attempting retry — skip if already resolved
  const invoiceStatus = await retryPayment(account.stripe_account_id, job.payment_intent_id)

  if (invoiceStatus === 'recovered') {
    await supabase
      .from('recoveries')
      .update({ status: 'recovered', recovered_at: new Date().toISOString() })
      .eq('id', jobId)
    console.log('[recovery] job recovered on retry:', jobId)
    return
  }

  if (invoiceStatus === 'failed') {
    await supabase
      .from('recoveries')
      .update({ status: 'failed', failure_reason: 'invoice_voided_or_uncollectible' })
      .eq('id', jobId)
    console.log('[recovery] job failed (invoice voided):', jobId)
    return
  }

  // Invoice still open — proceed with next dunning email
  const emailStep = (job.email_step || 0) + 1
  const maxRetries = account.config_json?.maxRetries || 4

  if (emailStep > maxRetries) {
    await supabase
      .from('recoveries')
      .update({ status: 'failed', failure_reason: 'max_retries_reached' })
      .eq('id', jobId)
    console.log('[recovery] max retries reached:', jobId)
    return
  }

  console.log(`[recovery] processing step ${emailStep} of ${maxRetries} for job:`, jobId)

  // Step 4 is a final Stripe retry only — no email sent
  const isFinalRetryOnly = emailStep === 4

  if (!isFinalRetryOnly) {
    // Steps 1–3: schedule next step or mark final
    const daysUntilNext = RETRY_INTERVALS_DAYS[emailStep - 1] ?? 0
    const nextRetryAt = daysUntilNext > 0
      ? new Date(Date.now() + daysUntilNext * 24 * 60 * 60 * 1000).toISOString()
      : null

    // ── Layer 2 idempotency: atomic UPDATE with optimistic lock ────────────
    // Only advance if email_step still matches what we read. If two cron runs
    // overlap, the second one sees 0 rows updated and skips — no duplicate email.
    const currentStep = job.email_step || 0
    const { data: advanced, error: advanceErr } = await supabase
      .from('recoveries')
      .update({
        email_step: emailStep,
        status: 'email_sent',
        next_retry_at: nextRetryAt,
      })
      .eq('id', jobId)
      .eq('email_step', currentStep) // optimistic lock
      .select('id')

    if (advanceErr) {
      console.error('[recovery] DB advance error:', advanceErr)
      return
    }

    if (!advanced || advanced.length === 0) {
      // Another cron invocation already advanced this job — skip
      console.log('[recovery] job already advanced by another process, skipping:', jobId)
      return
    }

    // ── Layer 3 idempotency: check email_log before sending ───────────────
    const { data: existingLog } = await supabase
      .from('email_log')
      .select('id')
      .eq('recovery_id', jobId)
      .eq('step', emailStep)
      .eq('status', 'sent')
      .maybeSingle()

    if (existingLog) {
      console.log(`[recovery] email already logged for job ${jobId} step ${emailStep}, skipping send`)
      return
    }

    // Resolve sender domain and send email
    const attemptNumber = emailStep as 1 | 2 | 3

    const { data: verifiedDomain, error: domainErr } = await supabase
      .from('domains')
      .select('domain, verified, verification_status, verified_at')
      .eq('user_id', job.user_id)
      .eq('verification_status', 'verified')
      .order('verified_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    console.log('[recovery] Verified domain lookup result:', verifiedDomain?.domain ?? 'none', '| error:', domainErr?.message ?? null)

    const senderDomain = verifiedDomain?.domain || null
    const result = await sendRecoveryEmail(job, account, attemptNumber, senderDomain)

    if (result.sent) {
      // Write email_log entry — unique on (recovery_id, step), so a parallel insert
      // hitting 23505 here is harmless (email already sent by the other process)
      await supabase.from('email_log').insert({
        recovery_id: jobId,
        user_id: job.user_id,
        step: emailStep,
        to_email: job.customer_email,
        subject: result.subject,
        status: 'sent',
        resend_id: result.resendId,
      })
    } else {
      console.error('[recovery] failed to send email for job:', jobId)
      // Don't abort — step is already advanced in DB, next cron will retry
    }

    console.log(`[recovery] step ${emailStep} complete, next retry at:`, nextRetryAt ?? 'none scheduled')
  } else {
    // Step 4: final Stripe retry, no email
    console.log('[recovery] Step 4 — final Stripe retry only, no email sent')
    const retryResult = await retryPayment(account.stripe_account_id, job.payment_intent_id)
    console.log('[recovery] Final retry result:', retryResult)
    if (retryResult === 'recovered') {
      await supabase
        .from('recoveries')
        .update({ status: 'recovered', recovered_at: new Date().toISOString(), email_step: emailStep })
        .eq('id', jobId)
      console.log('[recovery] job recovered on final retry:', jobId)
    } else {
      await supabase
        .from('recoveries')
        .update({ status: 'failed', failure_reason: 'max_retries_reached', email_step: emailStep, next_retry_at: null })
        .eq('id', jobId)
      console.log('[recovery] job failed after final retry:', jobId)
    }
  }
}
