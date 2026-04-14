import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCurrencyPrecise(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function getFailureReason(declineCode?: string): string {
  const reasons: Record<string, string> = {
    insufficient_funds: 'Insufficient funds',
    card_declined: 'Card declined',
    expired_card: 'Expired card',
    incorrect_cvc: 'Incorrect CVC',
    processing_error: 'Processing error',
    authentication_required: 'Authentication required',
    do_not_honor: 'Card issuer declined',
    lost_card: 'Lost card',
    stolen_card: 'Stolen card',
    generic_decline: 'Generic decline',
  }
  return reasons[declineCode || ''] || 'Payment failed'
}

export function getStepLabel(step: number): string {
  const labels = ['First notice', 'Follow-up', 'Final notice']
  return labels[step - 1] || `Step ${step}`
}

export function generatePaymentUpdateUrl(
  stripeAccountId: string,
  customerId: string
): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/portal?account=${stripeAccountId}&customer=${customerId}`
}
