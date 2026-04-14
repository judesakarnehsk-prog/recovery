import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateDunningEmail } from '@/lib/claude'
import { sendDunningEmail } from '@/lib/resend'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const testEmailSchema = z.object({
  tone: z.enum(['friendly', 'professional', 'direct', 'empathetic']),
  step: z.number().min(1).max(5),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tone, step } = testEmailSchema.parse(body)

    // Load user's sender config
    const { data: stripeAccount } = await supabase
      .from('stripe_accounts')
      .select('config_json')
      .eq('user_id', user.id)
      .single()

    const cfg = stripeAccount?.config_json || {}

    // Resolve sender email: prefer verified custom domain config
    let senderEmail = cfg.senderEmail || undefined
    let senderName = cfg.senderName || undefined
    const replyTo = cfg.replyToEmail || undefined

    // If senderDomainId set, verify it's still verified in domains table
    if (cfg.senderDomainId) {
      const { data: domain } = await supabase
        .from('domains')
        .select('domain, verified')
        .eq('id', cfg.senderDomainId)
        .eq('user_id', user.id)
        .single()

      if (domain?.verified) {
        const localPart = cfg.senderLocalPart || 'billing'
        senderEmail = `${localPart}@${domain.domain}`
        senderName = cfg.senderName || 'Billing Team'
      }
    }

    const { subject, html } = await generateDunningEmail({
      step,
      amount: '49.00',
      product: 'Your SaaS Product',
      customerName: 'Test Customer',
      reason: 'insufficient_funds',
      tone,
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/update-payment/test`,
    })

    await sendDunningEmail({
      to: user.email!,
      subject: `[TEST] ${subject}`,
      html,
      senderEmail,
      senderName,
      replyTo,
    })

    return NextResponse.json({ success: true, subject })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    console.error('Dunning test error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
