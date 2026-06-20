import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { resend } from '@/lib/resend'

export const runtime = 'nodejs'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'unknown' } = body

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Upsert — don't error on duplicate email
    const { error: dbError } = await supabase
      .from('lead_captures')
      .upsert(
        { email: email.toLowerCase(), source, captured_at: new Date().toISOString() },
        { onConflict: 'email', ignoreDuplicates: true }
      )

    if (dbError) {
      console.error('[lead-capture] DB error:', dbError)
    }

    // Read PDF for attachment (gracefully degrade if missing)
    let pdfAttachment: { filename: string; content: string } | null = null
    try {
      const pdfPath = join(process.cwd(), 'public', 'guides', 'saas-payment-recovery-playbook.pdf')
      const pdfBuffer = readFileSync(pdfPath)
      pdfAttachment = {
        filename: 'SaaS-Payment-Recovery-Playbook-Revorva.pdf',
        content: pdfBuffer.toString('base64'),
      }
    } catch {
      console.error('[lead-capture] PDF not found — sending email without attachment')
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Revorva <billing@revorva.com>'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://revorva.com'

    await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'The Silent Revenue Killer (your playbook is attached)',
      attachments: pdfAttachment ? [pdfAttachment] : [],
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#F5F2EC;font-family:'DM Sans',sans-serif;">
          <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #ddd8ce;overflow:hidden;">
            <div style="height:4px;background:#C94A1F;"></div>
            <div style="padding:40px 40px 32px;">
              <h1 style="font-size:22px;font-weight:700;color:#0F0E0C;margin:0 0 20px;">
                Hey — your playbook is attached.
              </h1>
              <p style="font-size:15px;color:#7a756c;line-height:1.7;margin:0 0 16px;">
                Quick story before you read it.
              </p>
              <p style="font-size:15px;color:#7a756c;line-height:1.7;margin:0 0 16px;">
                A few months ago I was looking at a SaaS founder's Stripe dashboard with him. He was complaining about slow MRR growth despite hitting his customer acquisition goals.
              </p>
              <p style="font-size:15px;color:#7a756c;line-height:1.7;margin:0 0 16px;">
                Three menus deep, we found it. <strong style="color:#0F0E0C;">47 customers in 'past_due' status.</strong> Some had been failing for months. He'd never seen any of them.
              </p>
              <p style="font-size:15px;color:#7a756c;line-height:1.7;margin:0 0 20px;">
                When we did the math, he'd lost over $8,400 in MRR over six months. Customers who never meant to leave.
              </p>
              <p style="font-size:14px;color:#0F0E0C;font-weight:600;margin:0 0 12px;">The playbook explains:</p>
              <ul style="padding-left:0;list-style:none;margin:0 0 24px;">
                <li style="font-size:14px;color:#7a756c;line-height:1.7;padding:4px 0;">→ Why payments fail (it's almost never what you think)</li>
                <li style="font-size:14px;color:#7a756c;line-height:1.7;padding:4px 0;">→ The hidden cost beyond the missed charge</li>
                <li style="font-size:14px;color:#7a756c;line-height:1.7;padding:4px 0;">→ Why most DIY recovery only works 20–30% of the time</li>
                <li style="font-size:14px;color:#7a756c;line-height:1.7;padding:4px 0;">→ What good recovery actually looks like — and what it's worth</li>
              </ul>
              <p style="font-size:15px;color:#7a756c;line-height:1.7;margin:0 0 24px;">
                It's 7 pages. Should take about 10 minutes to read. If you want to skip building it yourself, Revorva does all of this automatically — $29/month, 2 minutes to set up, 14 days free.
              </p>
              <a href="${appUrl}/signup" style="display:inline-block;background:#C94A1F;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">
                Try Revorva free →
              </a>
              <p style="font-size:13px;color:#7a756c;margin:32px 0 4px;line-height:1.6;">
                — The Revorva team
              </p>
              <p style="font-size:13px;color:#7a756c;margin:0 0 4px;line-height:1.6;">
                <a href="mailto:support@revorva.com" style="color:#C94A1F;text-decoration:none;">support@revorva.com</a>
              </p>
              <p style="font-size:12px;color:#9e9890;margin:16px 0 0;line-height:1.6;">
                P.S. Even if you never sign up for Revorva, read the playbook. Knowing this stuff makes you a smarter founder. Reply to this email if you have questions — we read every one.
              </p>
            </div>
            <div style="padding:16px 40px;border-top:1px solid #ddd8ce;background:#F5F2EC;">
              <p style="font-size:11px;color:#7a756c;margin:0;">
                Revorva · A Humanaira Ltd product · 167–169 Great Portland St, London, W1W 5PF, UK
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[lead-capture] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
