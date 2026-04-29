import type { DunningEmailParams } from '@/types'

interface DunningEmailResult {
  subject: string
  html: string
  text: string
}

// Legacy params interface for backward compat with old webhook handler
interface LegacyDunningParams {
  step: number
  amount: string
  product: string
  customerName: string
  reason: string
  tone: string
  paymentUrl: string
}

// Returns "there" if name is empty, looks like an email, or matches the customer email
function sanitizeCustomerName(name: string | null | undefined): string {
  if (!name) return 'there'
  const trimmed = name.trim()
  if (!trimmed) return 'there'
  if (trimmed.includes('@')) return 'there'
  return trimmed.split(' ')[0] // use first name only
}

// Maps user-facing tone labels to Claude prompt instructions per attempt number
const TONE_PROMPTS: Record<string, Record<number, string>> = {
  friendly:      { 1: 'warm, friendly and reassuring',       2: 'warm but a bit more persistent',      3: 'friendly but clearly urgent' },
  professional:  { 1: 'professional and informative',        2: 'professional and firm',                3: 'professional, firm and urgent' },
  direct:        { 1: 'direct and clear',                    2: 'direct, clear and persistent',         3: 'direct, final-notice urgency' },
  empathetic:    { 1: 'empathetic and understanding',        2: 'empathetic but gently persistent',     3: 'empathetic but clearly final notice' },
}

export async function generateRecoveryEmail(
  params: DunningEmailParams
): Promise<DunningEmailResult> {
  const { customerName, businessName, amount, currency, attemptNumber, billingPortalUrl, brandColor, logoUrl, dunningTone, subjectPrefix } = params

  const firstName = sanitizeCustomerName(customerName)
  const color = brandColor || '#c8401a'

  // Resolve tone: use user's setting if valid, fall back to per-attempt defaults
  const toneKey = dunningTone && TONE_PROMPTS[dunningTone] ? dunningTone : 'professional'
  const tone = TONE_PROMPTS[toneKey][attemptNumber] || TONE_PROMPTS.professional[attemptNumber]

  // Stripe zero-decimal currencies store amounts as whole units (no cents).
  // Dividing by 100 for JPY/KRW/etc. would give a value 100× too small.
  const currencyUpper = currency.toUpperCase()
  const ZERO_DECIMAL_CURRENCIES = new Set(['BIF','CLP','DJF','GNF','JPY','KMF','KRW','MGA','PYG','RWF','UGX','VND','VUV','XAF','XOF','XPF'])
  const divisor = ZERO_DECIMAL_CURRENCIES.has(currencyUpper) ? 1 : 100
  const amountFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyUpper,
  }).format(amount / divisor)

  console.log('[claude] generateRecoveryEmail vars:', { firstName, businessName, color, logoUrl: logoUrl || null, attemptNumber, toneKey, subjectPrefix: subjectPrefix || null })

  const prompt = `You are a billing assistant writing recovery emails for a SaaS business.
Write professional, warm, non-aggressive emails. The customer has not done anything wrong — their payment simply failed. Make it easy for them to update their payment method. Keep it short. Never mention "dunning" or "collection".

Write a ${tone} recovery email (attempt ${attemptNumber} of 3).

Business: ${businessName}
Customer first name: ${firstName}
Amount: ${amountFormatted}
Update payment URL: ${billingPortalUrl}

Return ONLY valid JSON:
{"subject": "...", "html": "...", "text": "..."}

The HTML should be minimal, clean, readable in email clients. Use inline styles.
Colors: text #0f0e0c, background #ffffff, button background ${color}, button text #ffffff.
The "Update payment" button should be a prominent anchor tag styled as a button using background-color:${color}.
${logoUrl ? `Include this logo at the top: <img src="${logoUrl}" alt="${businessName}" style="height:32px;width:auto;display:block;margin-bottom:16px;" />` : ''}
Keep the email under 120 words. Sign off as "The ${businessName} team".`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.content[0].text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse Claude response')

  const result = JSON.parse(jsonMatch[0]) as DunningEmailResult

  // Apply subject prefix if set
  if (subjectPrefix?.trim()) {
    result.subject = `${subjectPrefix.trim()} ${result.subject}`
  }

  // Footer — no Revorva branding, just business name
  const footer = `<div style="margin-top:28px;padding-top:14px;border-top:1px solid #ddd8ce;text-align:center;font-size:11px;color:#7a756c;font-family:Arial,sans-serif;">Powered by ${businessName}</div>`
  result.html = (result.html || '') + footer

  return result
}

// Legacy function for backward compat with existing webhook handler
export async function generateDunningEmail(
  params: LegacyDunningParams
): Promise<{ subject: string; html: string }> {
  const { step, amount, product, customerName, reason, tone, paymentUrl } = params

  const prompt = `Generate a step ${step} dunning email for failed $${amount}/mo ${product}. Customer: ${customerName}. Reason: ${reason}. Tone: ${tone}. Include ${paymentUrl}. Short, professional, non-spammy.

Return ONLY valid JSON: {"subject": "...", "html": "..."}

HTML should use inline styles. Colors: text #0f0e0c, button bg #c8401a, button text #ffffff.
Step ${step} tone: ${step === 1 ? 'gentle and informative' : step === 2 ? 'slightly more urgent but still friendly' : 'final notice with clear consequences'}.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`)

  const data = await response.json()
  const text = data.content[0].text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse Claude response')

  const result = JSON.parse(jsonMatch[0])
  result.html += `<div style="margin-top:28px;padding-top:14px;border-top:1px solid #ddd8ce;text-align:center;font-size:11px;color:#7a756c;font-family:Arial,sans-serif;">Sent via <a href="https://revorva.com" style="color:#c8401a;text-decoration:none;">Revorva</a></div>`
  return result
}
