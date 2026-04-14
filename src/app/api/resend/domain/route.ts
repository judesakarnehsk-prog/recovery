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

    const { domain } = await request.json()

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    const resend = getResend()
    const { data, error } = await resend.domains.create({ name: domain })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const domainData = data as any
    return NextResponse.json({
      id: domainData?.id,
      records: (domainData?.records || []).map((r: any) => ({
        type: r.type,
        name: r.name,
        value: r.value,
      })),
    })
  } catch (err) {
    console.error('Resend domain create error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
