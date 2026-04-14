interface DunningEmailParams {
  step: number
  amount: string
  product: string
  customerName: string
  reason: string
  tone: string
  paymentUrl: string
}

interface DunningEmailResult {
  subject: string
  html: string
}

export async function generateDunningEmail(
  params: DunningEmailParams
): Promise<DunningEmailResult> {
  const { step, amount, product, customerName, reason, tone, paymentUrl } = params

  const prompt = `Generate a step ${step} dunning email for failed $${amount}/mo ${product}. Customer: ${customerName}. Reason: ${reason}. Tone: ${tone}. Include ${paymentUrl}. Short, professional, non-spammy. Output subject + HTML body.

Return ONLY valid JSON in this format:
{"subject": "...", "html": "..."}

The HTML should be a complete email body with inline styles, using these brand colors:
- Primary purple: #6D28D9
- Accent light purple: #A78BFA
- Text: #111827
- Light gray bg: #F9FAFB

Make the payment link a prominent button. Keep it concise and ${tone}. Step ${step} should be ${
    step === 1 ? 'gentle and informative' :
    step === 2 ? 'slightly more urgent but still friendly' :
    'final notice with clear consequences'
  }.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.content[0].text

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse Claude response')
  }

  const result = JSON.parse(jsonMatch[0]) as DunningEmailResult

  // Append "Sent via Revorva" disclaimer footer
  result.html += `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #E5E7EB;text-align:center;font-size:11px;color:#9CA3AF;font-family:Arial,sans-serif;">Sent via <a href="https://revorva.com" style="color:#6D28D9;text-decoration:none;">Revorva</a></div>`

  return result
}
