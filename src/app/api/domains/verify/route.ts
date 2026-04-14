import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { resolveTxt } from 'dns/promises'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Domain ID required' }, { status: 400 })

  const { data: domainRow, error: fetchError } = await supabase
    .from('domains')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !domainRow) {
    return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
  }

  if (domainRow.verified) {
    return NextResponse.json({ verified: true })
  }

  try {
    const records = await resolveTxt(domainRow.domain)
    const flat = records.flat()
    const matched = flat.some((r) => r === domainRow.token)

    if (matched) {
      await supabase
        .from('domains')
        .update({ verified: true })
        .eq('id', id)
        .eq('user_id', user.id)
      return NextResponse.json({ verified: true })
    }

    return NextResponse.json({ verified: false, message: 'TXT record not found yet. DNS changes can take a few minutes to propagate.' })
  } catch {
    return NextResponse.json({ verified: false, message: 'Could not resolve DNS for this domain. Make sure it exists and try again.' })
  }
}
