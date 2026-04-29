import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceRoleClient()

  const { data: account, error } = await db
    .from('stripe_accounts')
    .select('config_json')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 })
  if (!account) return NextResponse.json({ error: 'No Stripe account connected' }, { status: 404 })

  const updatedConfig = {
    ...(account.config_json || {}),
    recoveryPaused: false,
    pausedAt: null,
  }

  const { error: updateErr } = await db
    .from('stripe_accounts')
    .update({ config_json: updatedConfig })
    .eq('user_id', user.id)

  if (updateErr) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })

  return NextResponse.json({ recoveryPaused: false, pausedAt: null })
}
