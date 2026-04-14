import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

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
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { domain } = await req.json()
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

  if (!/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/.test(normalized)) {
    return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
  }

  // Check if already added by this user
  const { data: existing } = await supabase
    .from('domains')
    .select('id')
    .eq('user_id', user.id)
    .eq('domain', normalized)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Domain already added' }, { status: 409 })
  }

  const token = `revorva-verification=${randomBytes(20).toString('hex')}`

  const { data, error } = await supabase
    .from('domains')
    .insert({ user_id: user.id, domain: normalized, token, verified: false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await supabase.from('domains').delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ success: true })
}
