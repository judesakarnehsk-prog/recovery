import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceClient = createServiceRoleClient()

  try {
    // 1. Cancel any active Stripe subscription
    const { data: profile } = await serviceClient
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profile?.stripe_customer_id) {
      const subs = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'active',
        limit: 5,
      })
      await Promise.all(subs.data.map(s => stripe.subscriptions.cancel(s.id)))

      const trialing = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'trialing',
        limit: 5,
      })
      await Promise.all(trialing.data.map(s => stripe.subscriptions.cancel(s.id)))
    }

    // 2. Delete all user data from Supabase.
    // email_log and subscriptions must be deleted before recoveries/users
    // in case their FKs don't have ON DELETE CASCADE.
    await Promise.all([
      serviceClient.from('email_log').delete().eq('user_id', user.id),
      serviceClient.from('subscriptions').delete().eq('user_id', user.id),
    ])
    await Promise.all([
      serviceClient.from('recoveries').delete().eq('user_id', user.id),
      serviceClient.from('stripe_accounts').delete().eq('user_id', user.id),
      serviceClient.from('domains').delete().eq('user_id', user.id),
      serviceClient.from('users').delete().eq('id', user.id),
    ])

    // 3. Delete the auth user record
    await serviceClient.auth.admin.deleteUser(user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[account delete] error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
