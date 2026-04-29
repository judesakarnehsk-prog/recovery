import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceRoleClient()

  // Load current config so we can preserve it and add pause state
  const { data: account, error } = await db
    .from('stripe_accounts')
    .select('config_json')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 })
  if (!account) return NextResponse.json({ error: 'No account to disconnect' }, { status: 404 })

  // Keep the row so the dashboard can show the "Stripe disconnected" banner.
  // Clear the OAuth tokens, mark paused, preserve all other config (branding etc).
  const updatedConfig = {
    ...(account.config_json || {}),
    recoveryPaused: true,
    pausedAt: new Date().toISOString(),
    pausedBy: 'stripe_disconnect',
  }

  const { error: updateErr } = await db
    .from('stripe_accounts')
    .update({
      access_token: null,
      refresh_token: null,
      stripe_account_id: null,
      config_json: updatedConfig,
    })
    .eq('user_id', user.id)

  if (updateErr) return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })

  console.log(`[disconnect] user ${user.id} disconnected Stripe — recovery paused`)
  return NextResponse.json({ success: true })
}
