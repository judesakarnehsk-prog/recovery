import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getStripeConnectUrl } from '@/lib/stripe'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?redirect=/integrations`
    )
  }

  const url = getStripeConnectUrl(user.id)
  return NextResponse.redirect(url)
}
