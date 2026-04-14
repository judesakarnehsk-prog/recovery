import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { domainId } = await request.json()

    if (!domainId || typeof domainId !== 'string') {
      return NextResponse.json({ error: 'Domain ID is required' }, { status: 400 })
    }

    const resend = getResend()

    // Trigger verification check
    await resend.domains.verify(domainId)

    // Get domain status
    const { data, error } = await resend.domains.get(domainId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const domainStatus = (data as any)?.status
    return NextResponse.json({
      status: domainStatus === 'verified' ? 'verified' : 'pending',
    })
  } catch (err) {
    console.error('Resend domain verify error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
