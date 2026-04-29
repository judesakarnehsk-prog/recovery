import { Resend } from 'resend'

// Named export for direct use in recovery.ts etc.
export const resend = new Resend(process.env.RESEND_API_KEY)

function getResendClient() {
  return resend
}

interface SendDunningEmailParams {
  to: string
  subject: string
  html: string
  replyTo?: string
  senderEmail?: string
  senderName?: string
}

export async function sendDunningEmail({ to, subject, html, replyTo, senderEmail, senderName }: SendDunningEmailParams) {
  const resend = getResendClient()

  // Use the client's verified sender email if available, otherwise fall back to Revorva default
  const defaultFrom = process.env.RESEND_FROM_EMAIL || 'Revorva <billing@revorva.com>'
  const from = senderEmail
    ? `${senderName || 'Billing'} <${senderEmail}>`
    : defaultFrom

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html,
    reply_to: replyTo || undefined,
    headers: {
      'X-Entity-Ref-ID': crypto.randomUUID(),
    },
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }

  return data
}
