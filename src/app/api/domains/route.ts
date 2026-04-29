import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('domains')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Return array directly (not wrapped in { domains: [] })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { domain } = body
  if (!domain || typeof domain !== 'string') {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
  }

  // Normalize: strip protocol/www
  const normalized = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .toLowerCase()
    .trim()

  if (!/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(normalized)) {
    return NextResponse.json({
      error: 'Please enter just the domain, like acmesaas.com (without https:// or www.)',
    }, { status: 400 })
  }

  // Block duplicate for this user
  const { data: existing } = await supabase
    .from('domains')
    .select('id')
    .eq('user_id', user.id)
    .eq('domain', normalized)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Domain already added' }, { status: 409 })
  }

  // Register the domain with Resend so it generates real DNS records
  const resendResult = await resend.domains.create({
    name: normalized,
    region: 'us-east-1',
  })

  if (resendResult.error) {
    console.error('Resend domain create error:', resendResult.error)
    return NextResponse.json(
      { error: `Failed to register domain with email provider: ${resendResult.error.message}` },
      { status: 500 }
    )
  }

  const resendDomain = resendResult.data
  const serviceClient = createServiceRoleClient()

  const { data: row, error: dbError } = await serviceClient
    .from('domains')
    .insert({
      user_id: user.id,
      domain: normalized,
      // Legacy token field — keep for backward compat but it's unused now
      token: '',
      verified: false,
      resend_domain_id: resendDomain?.id ?? null,
      dns_records: (resendDomain as any)?.records ?? null,
      verification_status: 'pending',
    })
    .select()
    .single()

  if (dbError) {
    console.error('DB insert error after Resend create:', dbError)
    // Try to clean up the Resend domain if DB insert failed
    if (resendDomain?.id) {
      await resend.domains.remove(resendDomain.id).catch(() => {})
    }
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(row)
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Support both ?id=xxx query param and JSON body
  const url = new URL(req.url)
  const queryId = url.searchParams.get('id')
  let id = queryId

  if (!id) {
    try {
      const body = await req.json()
      id = body.id
    } catch {}
  }

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  // Fetch the row first so we can remove from Resend too
  const { data: row } = await supabase
    .from('domains')
    .select('resend_domain_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  // Remove from Resend (best-effort — don't fail if already gone)
  if (row?.resend_domain_id) {
    await resend.domains.remove(row.resend_domain_id).catch((e: any) => {
      console.warn('Resend domain remove warning:', e?.message)
    })
  }

  await supabase.from('domains').delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ success: true })
}
