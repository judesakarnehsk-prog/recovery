import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { recoveryId } = body
  if (!recoveryId) return NextResponse.json({ error: 'recoveryId required' }, { status: 400 })

  const db = createServiceRoleClient()

  // Verify this recovery belongs to the authenticated user before modifying
  const { data: recovery, error: fetchErr } = await db
    .from('recoveries')
    .select('id, status, user_id')
    .eq('id', recoveryId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchErr) return NextResponse.json({ error: 'DB error' }, { status: 500 })
  if (!recovery) return NextResponse.json({ error: 'Recovery not found' }, { status: 404 })

  if (!['pending', 'email_sent'].includes(recovery.status)) {
    return NextResponse.json({ error: 'Can only skip active recoveries' }, { status: 400 })
  }

  const { error: updateErr } = await db
    .from('recoveries')
    .update({ status: 'skipped', next_retry_at: null })
    .eq('id', recoveryId)

  if (updateErr) return NextResponse.json({ error: 'Failed to skip' }, { status: 500 })

  return NextResponse.json({ success: true })
}
