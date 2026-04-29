export type RecoveryStatus = 'pending' | 'recovered' | 'failed' | 'cancelled' | 'email_sent'

export interface RecoveryJob {
  id: string
  user_id: string
  payment_intent_id: string
  stripe_account_id: string | null
  customer_email: string
  customer_name: string | null
  amount: number
  currency: string
  status: RecoveryStatus
  email_step: number
  failure_reason: string | null
  next_retry_at: string | null
  recovered_at: string | null
  created_at: string
  updated_at: string
}

export interface ConnectedAccount {
  id: string
  user_id: string
  stripe_account_id: string
  config_json: {
    dunningTone?: string
    maxRetries?: number
    replyToEmail?: string
    senderDomainId?: string
    senderName?: string
    senderLocalPart?: string
    businessName?: string
    brandColor?: string
    logoUrl?: string
  }
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  plan: 'trial' | 'starter' | 'growth' | 'scale' | 'cancelled'
  stripe_customer_id: string | null
  trial_ends_at: string | null
}

export interface RecoveryStats {
  user_id: string
  total_recoveries: number
  recovered_count: number
  pending_count: number
  failed_count: number
  total_recovered_amount: number
  total_attempted_amount: number
  recovery_rate: number
}

export interface DunningEmailParams {
  customerName: string | null
  businessName: string
  amount: number
  currency: string
  attemptNumber: 1 | 2 | 3
  billingPortalUrl: string
  brandColor?: string
  logoUrl?: string
  dunningTone?: string
  subjectPrefix?: string
}
