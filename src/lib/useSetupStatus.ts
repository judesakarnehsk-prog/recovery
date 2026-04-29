'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SetupStatus {
  stripeConnected: boolean
  businessNameSet: boolean
  businessTypeSet: boolean
  replyToSet: boolean
  brandingConfigured: boolean
  loading: boolean
}

export function useSetupStatus() {
  const [status, setStatus] = useState<SetupStatus>({
    stripeConnected: false,
    businessNameSet: false,
    businessTypeSet: false,
    replyToSet: false,
    brandingConfigured: false,
    loading: true,
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return

      const [profileRes, stripeRes] = await Promise.all([
        supabase
          .from('users')
          .select('company_name, business_category, config_json')
          .eq('id', user.id)
          .single(),
        supabase
          .from('stripe_accounts')
          .select('stripe_account_id')
          .eq('user_id', user.id)
          .single(),
      ])

      const cfg = profileRes.data?.config_json || {}

      setStatus({
        stripeConnected: !!stripeRes.data,
        businessNameSet: !!(profileRes.data?.company_name?.trim()),
        businessTypeSet: !!(profileRes.data?.business_category?.trim()),
        replyToSet: !!(cfg.replyToEmail?.trim()),
        brandingConfigured: !!(cfg.dunningTone || cfg.brandColor),
        loading: false,
      })
    })
  }, [])

  return status
}
