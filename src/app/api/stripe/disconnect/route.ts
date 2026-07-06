import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceRoleClient()

  const { data: account, error } = await db
    .from('stripe_accounts')
    .select('stripe_account_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 })
  if (!account) return NextResponse.json({ error: 'No account to disconnect' }, { status: 404 })

  // Revoke the OAuth token with Stripe — non-fatal if it fails
  // (token may already be invalid or the account may have been deauthorised)
  if (account.stripe_account_id) {
    try {
      await stripe.oauth.deauthorize({
        client_id: process.env.STRIPE_CONNECT_CLIENT_ID!,
        stripe_user_id: account.stripe_account_id,
      })
    } catch (stripeErr) {
      console.error('[disconnect] Stripe revoke error (non-fatal):', stripeErr)
    }
  }

  // Delete the row — stripe_account_id and access_token are NOT NULL so we
  // cannot null them in place; a full delete is the correct disconnect path.
  const { error: deleteErr } = await db
    .from('stripe_accounts')
    .delete()
    .eq('user_id', user.id)

  if (deleteErr) {
    console.error('[disconnect] DB delete error:', deleteErr)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }

  console.log(`[disconnect] user ${user.id} disconnected Stripe`)
  return NextResponse.json({ success: true })
}
