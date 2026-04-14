import { NextRequest, NextResponse } from 'next/server'
import { createConnectedStripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    console.error('Stripe Connect OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=stripe_connect_failed`
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=missing_params`
    )
  }

  try {
    const supabase = createServerSupabaseClient()

    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?redirect=/dashboard`
      )
    }

    // Verify state matches user ID to prevent CSRF
    if (state !== user.id) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=invalid_state`
      )
    }

    // Exchange authorization code for access token
    const tokenResponse = await createConnectedStripe(code)

    // Save the connected account details
    const { error: dbError } = await supabase
      .from('stripe_accounts')
      .upsert({
        user_id: user.id,
        stripe_account_id: tokenResponse.stripe_user_id,
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        config_json: {
          dunningTone: 'professional',
          maxRetries: 3,
          retryIntervalDays: 3,
        },
      }, {
        onConflict: 'user_id',
      })

    if (dbError) {
      console.error('Error saving Stripe account:', dbError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=db_save_failed`
      )
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`
    )
  } catch (err) {
    console.error('Stripe Connect error:', err)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=connect_failed`
    )
  }
}
