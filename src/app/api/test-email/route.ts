import { NextRequest, NextResponse } from 'next/server'
import { sendDunningEmail } from '@/lib/resend'
import { buildFallbackEmail } from '@/lib/emailFallback'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const to = request.nextUrl.searchParams.get('to')
  const step = (Number(request.nextUrl.searchParams.get('step')) || 1) as 1 | 2 | 3
  if (!to) return NextResponse.json({ error: 'Missing ?to=email' }, { status: 400 })

  const supabase = createServiceRoleClient()

  const { data: account } = await supabase
    .from('stripe_accounts')
    .select('user_id, config_json')
    .limit(1)
    .single()

  const { data: user } = await supabase
    .from('users')
    .select('company_name, config_json')
    .eq('id', account?.user_id || '')
    .single()

  const userCfg = user?.config_json || {}
  const acctCfg = account?.config_json || {}

  const businessName = userCfg.businessName || acctCfg.businessName || user?.company_name || 'Your Company'
  const brandColor = userCfg.brandColor || acctCfg.brandColor || '#c8401a'
  const logoUrl = userCfg.logoUrl || acctCfg.logoUrl || ''

  const { subject, html } = buildFallbackEmail({
    attemptNumber: Math.min(step, 3) as 1 | 2 | 3,
    customerName: 'Sarah',
    businessName,
    amount: '$49.00',
    brandColor,
    logoUrl: logoUrl || undefined,
    paymentUrl: 'https://revorva.com',
  })

  try {
    await sendDunningEmail({
      to,
      subject,
      html,
      replyTo: userCfg.replyToEmail || acctCfg.replyToEmail || undefined,
    })
    return NextResponse.json({ success: true, sentTo: to, subject, businessName, brandColor, step })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
