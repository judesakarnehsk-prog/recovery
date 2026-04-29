import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { processRecoveryJob } from '@/lib/recovery'
import { sendTrialEndingEmail, sendTrialExpiredEmail } from '@/lib/emails/trial'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Accept either:
  //   1. Vercel's own cron runner (sends x-vercel-cron: 1, no auth header)
  //   2. Manual trigger with Authorization: Bearer {CRON_SECRET} (for testing)
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const isBearerAuth = cronSecret && authHeader === `Bearer ${cronSecret}`

  if (!isVercelCron && !isBearerAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()

  // Find all pending recoveries where next_retry_at has passed (or is null = immediate)
  const { data: jobs, error } = await supabase
    .from('recoveries')
    .select('id, user_id')
    .in('status', ['pending', 'email_sent'])
    .or('next_retry_at.is.null,next_retry_at.lte.' + new Date().toISOString())
    .limit(50) // Process max 50 per cron run to stay within timeout

  if (error) {
    console.error('[cron] failed to fetch jobs:', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No jobs ready' })
  }

  // Fetch pause state for all distinct users in this batch in one query
  const userIds = Array.from(new Set(jobs.map(j => j.user_id)))
  const { data: accounts } = await supabase
    .from('stripe_accounts')
    .select('user_id, config_json')
    .in('user_id', userIds)

  const pausedUserIds = new Set(
    (accounts ?? [])
      .filter(a => a.config_json?.recoveryPaused === true)
      .map(a => a.user_id)
  )

  const activeJobs = jobs.filter(j => !pausedUserIds.has(j.user_id))
  const skippedCount = jobs.length - activeJobs.length

  if (skippedCount > 0) {
    console.log(`[cron] skipping ${skippedCount} job(s) — recovery paused for their users`)
  }

  if (activeJobs.length === 0) {
    return NextResponse.json({ processed: 0, skipped: skippedCount, message: 'All jobs paused' })
  }

  const results = await Promise.allSettled(
    activeJobs.map((job) => processRecoveryJob(job.id))
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  console.log(`[cron] processed ${activeJobs.length} jobs: ${succeeded} succeeded, ${failed} failed, ${skippedCount} skipped (paused)`)

  // ─── Trial lifecycle checks ───────────────────────────────────────────────
  // Run daily alongside recovery processing.

  let remindersSent = 0
  let expiriesProcessed = 0

  try {
    const now = new Date()

    // 1. Send 3-day warning to users whose trial ends in the next 2–3 days
    //    and haven't received a reminder yet.
    const warningWindowStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
    const warningWindowEnd   = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()

    const { data: endingSoon } = await supabase
      .from('users')
      .select('id, email, full_name, company_name, trial_ends_at')
      .eq('plan', 'trial')
      .eq('trial_reminder_sent', false)
      .gte('trial_ends_at', warningWindowStart)
      .lte('trial_ends_at', warningWindowEnd)

    for (const user of endingSoon ?? []) {
      try {
        // Fetch recovery stats for this user
        const { data: statsRow } = await supabase
          .from('user_recovery_stats')
          .select('recovered_count, total_recovered_amount')
          .eq('user_id', user.id)
          .single()

        await sendTrialEndingEmail(
          user,
          3,
          {
            recoveredCount: statsRow?.recovered_count ?? 0,
            recoveredAmount: statsRow?.total_recovered_amount ?? 0,
            currency: 'usd',
          }
        )

        await supabase
          .from('users')
          .update({ trial_reminder_sent: true })
          .eq('id', user.id)

        remindersSent++
        console.log(`[cron] trial reminder sent to user ${user.id}`)
      } catch (err) {
        console.error(`[cron] failed to send trial reminder to user ${user.id}:`, err)
      }
    }

    // 2. Handle trials that have already expired but plan is still 'trial'
    //    (webhook may have been missed or delayed).
    const { data: justExpired } = await supabase
      .from('users')
      .select('id, email, full_name, company_name')
      .eq('plan', 'trial')
      .lt('trial_ends_at', now.toISOString())

    for (const user of justExpired ?? []) {
      try {
        const { data: statsRow } = await supabase
          .from('user_recovery_stats')
          .select('recovered_count, total_recovered_amount')
          .eq('user_id', user.id)
          .single()

        // Downgrade plan first so we don't send the email twice if cron reruns
        await supabase
          .from('users')
          .update({ plan: 'expired' })
          .eq('id', user.id)

        await sendTrialExpiredEmail(
          user,
          {
            recoveredCount: statsRow?.recovered_count ?? 0,
            recoveredAmount: statsRow?.total_recovered_amount ?? 0,
            currency: 'usd',
          }
        )

        expiriesProcessed++
        console.log(`[cron] trial expired — user ${user.id} downgraded and notified`)
      } catch (err) {
        console.error(`[cron] failed to process trial expiry for user ${user.id}:`, err)
      }
    }
  } catch (err) {
    console.error('[cron] trial lifecycle check failed:', err)
  }

  return NextResponse.json({
    processed: activeJobs.length,
    succeeded,
    failed,
    skipped: skippedCount,
    trial_reminders_sent: remindersSent,
    trial_expiries_processed: expiriesProcessed,
  })
}
