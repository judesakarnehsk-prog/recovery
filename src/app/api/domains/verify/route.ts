import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  // Accept either 'id' (domain row id) or 'domainId' for backward compat
  const id = body.id || body.domainId
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

  // Already verified — return early
  if (domainRow.verified || domainRow.verification_status === 'verified') {
    return NextResponse.json({ verified: true, domain: domainRow })
  }

  const serviceClient = createServiceRoleClient()

  // If we have a Resend domain ID, use Resend's verify API
  if (domainRow.resend_domain_id) {
    try {
      const result = await resend.domains.verify(domainRow.resend_domain_id)

      if (result.error) {
        // Resend returned an error — domain not verified yet, return the message
        await serviceClient
          .from('domains')
          .update({ last_verification_check: new Date().toISOString() })
          .eq('id', id)

        return NextResponse.json({
          verified: false,
          message: 'DNS records not found yet. This can take up to 24 hours to propagate.',
        })
      }

      // Fetch the updated domain from Resend to get current record statuses
      const getResult = await resend.domains.get(domainRow.resend_domain_id)
      const updatedRecords = (getResult.data as any)?.records ?? domainRow.dns_records
      const resendStatus = (getResult.data as any)?.status ?? 'not_started'
      const isVerified = resendStatus === 'verified'

      await serviceClient
        .from('domains')
        .update({
          verified: isVerified,
          verification_status: isVerified ? 'verified' : 'pending',
          verified_at: isVerified ? new Date().toISOString() : null,
          last_verification_check: new Date().toISOString(),
          dns_records: updatedRecords,
        })
        .eq('id', id)

      // Re-fetch so we return the complete updated row
      const { data: updated } = await serviceClient
        .from('domains')
        .select('*')
        .eq('id', id)
        .single()

      if (isVerified) {
        return NextResponse.json({ verified: true, domain: updated })
      }

      return NextResponse.json({
        verified: false,
        domain: updated,
        message: 'DNS records not found yet. This can take 5 minutes to 24 hours to propagate.',
      })
    } catch (err: any) {
      console.error('Resend verify error:', err)
      return NextResponse.json({
        verified: false,
        message: 'Verification check failed. Please try again in a few minutes.',
      }, { status: 500 })
    }
  }

  // Legacy path: domain added before Resend integration — no resend_domain_id
  return NextResponse.json({
    verified: false,
    message: 'This domain was added before the current email provider was set up. Please remove it and re-add it.',
  })
}
