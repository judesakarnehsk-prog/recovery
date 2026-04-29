import { resend } from '@/lib/resend'

const FROM = process.env.RESEND_FROM_EMAIL || 'Revorva <billing@revorva.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://revorva.com'

interface TrialUser {
  id: string
  email: string
  full_name?: string | null
  company_name?: string | null
}

interface TrialStats {
  recoveredCount: number
  recoveredAmount: number
  currency: string
}

function firstName(user: TrialUser): string {
  const name = user.full_name || user.company_name || ''
  return name.split(' ')[0] || 'there'
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100)
}

// ─── Trial ending in N days ───────────────────────────────────────────────────

export async function sendTrialEndingEmail(user: TrialUser, daysLeft: number, stats: TrialStats) {
  const name = firstName(user)
  const hasRecoveries = stats.recoveredCount > 0
  const recoveredStr = formatAmount(stats.recoveredAmount, stats.currency)

  const subject = `Your Revorva trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f2ec;font-family:'DM Sans',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ec;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ddd8ce;">

        <!-- Header bar -->
        <tr><td style="background:#c8401a;height:4px;"></td></tr>

        <!-- Body -->
        <tr><td style="padding:40px 40px 32px;">
          <p style="margin:0 0 8px;font-size:13px;color:#7a756c;letter-spacing:0.08em;text-transform:uppercase;">Revorva</p>
          <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#0f0e0c;line-height:1.3;">
            Your trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}, ${name}
          </h1>

          ${hasRecoveries ? `
          <div style="background:#f5f2ec;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:13px;color:#7a756c;">During your trial, Revorva has</p>
            <p style="margin:0;font-size:22px;font-weight:700;color:#c8401a;">recovered ${recoveredStr}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#7a756c;">across ${stats.recoveredCount} failed payment${stats.recoveredCount === 1 ? '' : 's'}</p>
          </div>
          ` : `
          <p style="color:#7a756c;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Your trial is still running. Add a payment method now so Revorva keeps watching your Stripe account after day 14.
          </p>
          `}

          <p style="color:#7a756c;font-size:15px;line-height:1.6;margin:0 0 28px;">
            To keep recovering revenue after your trial, add a payment method. Takes 30 seconds.
          </p>

          <a href="${APP_URL}/billing" style="display:inline-block;background:#c8401a;color:#ffffff;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;">
            Add payment method →
          </a>

          <p style="margin:28px 0 0;font-size:13px;color:#7a756c;line-height:1.6;">
            Plans start at $29/mo. Cancel anytime. No long-term contracts.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px 28px;border-top:1px solid #ddd8ce;">
          <p style="margin:0;font-size:12px;color:#7a756c;">
            © ${new Date().getFullYear()} Revorva · A Humanaira Ltd product<br>
            167–169 Great Portland St, London W1W 5PF
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [user.email],
    subject,
    html,
    headers: { 'X-Entity-Ref-ID': crypto.randomUUID() },
  })

  if (error) throw new Error(`[trial email] sendTrialEndingEmail failed: ${error.message}`)
  return data
}

// ─── Trial expired ────────────────────────────────────────────────────────────

export async function sendTrialExpiredEmail(user: TrialUser, stats: TrialStats) {
  const name = firstName(user)
  const hasRecoveries = stats.recoveredCount > 0
  const recoveredStr = formatAmount(stats.recoveredAmount, stats.currency)

  const subject = 'Your Revorva trial has ended'

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f2ec;font-family:'DM Sans',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ec;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ddd8ce;">

        <!-- Header bar -->
        <tr><td style="background:#d97706;height:4px;"></td></tr>

        <!-- Body -->
        <tr><td style="padding:40px 40px 32px;">
          <p style="margin:0 0 8px;font-size:13px;color:#7a756c;letter-spacing:0.08em;text-transform:uppercase;">Revorva</p>
          <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#0f0e0c;line-height:1.3;">
            Your trial has ended, ${name}
          </h1>

          ${hasRecoveries ? `
          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:13px;color:#92400e;">During your trial, Revorva recovered</p>
            <p style="margin:0;font-size:22px;font-weight:700;color:#c8401a;">${recoveredStr}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#92400e;">across ${stats.recoveredCount} failed payment${stats.recoveredCount === 1 ? '' : 's'}</p>
          </div>
          ` : ''}

          <p style="color:#7a756c;font-size:15px;line-height:1.6;margin:0 0 12px;">
            Recovery has been paused on your account. No new failed payments will trigger emails until you subscribe to a plan.
          </p>
          <p style="color:#7a756c;font-size:15px;line-height:1.6;margin:0 0 28px;">
            Your data is safe — all your recovery history is retained for 30 days.
          </p>

          <a href="${APP_URL}/billing" style="display:inline-block;background:#c8401a;color:#ffffff;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;">
            Choose a plan to continue →
          </a>

          <p style="margin:28px 0 0;font-size:13px;color:#7a756c;line-height:1.6;">
            Questions? Reply to this email or contact <a href="mailto:support@revorva.com" style="color:#c8401a;">support@revorva.com</a>.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px 28px;border-top:1px solid #ddd8ce;">
          <p style="margin:0;font-size:12px;color:#7a756c;">
            © ${new Date().getFullYear()} Revorva · A Humanaira Ltd product<br>
            167–169 Great Portland St, London W1W 5PF
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [user.email],
    subject,
    html,
    headers: { 'X-Entity-Ref-ID': crypto.randomUUID() },
  })

  if (error) throw new Error(`[trial email] sendTrialExpiredEmail failed: ${error.message}`)
  return data
}
