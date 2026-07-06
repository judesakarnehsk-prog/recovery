import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { companyUrl?: string; businessName?: string; businessCategory?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { companyUrl, businessName, businessCategory } = body

  if (!companyUrl && !businessName) {
    return NextResponse.json({ error: 'companyUrl or businessName required' }, { status: 400 })
  }

  // Step 1: fetch website content if URL provided
  let websiteContent = ''
  if (companyUrl) {
    try {
      const siteRes = await fetch(companyUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Revorva/1.0)' },
        signal: AbortSignal.timeout(8000),
      })
      const rawHtml = await siteRes.text()
      websiteContent = rawHtml
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 3000)
    } catch {
      websiteContent = `Business name: ${businessName ?? ''}. Category: ${businessCategory ?? ''}`
    }
  } else {
    websiteContent = `Business name: ${businessName ?? ''}. Category: ${businessCategory ?? ''}`
  }

  // Step 2: ask Claude to analyze and return a recovery strategy
  const prompt = `You are analyzing a business to create a personalized payment recovery strategy for them.

Business name: ${businessName ?? 'Unknown'}
Business category: ${businessCategory ?? 'Unknown'}
Website URL: ${companyUrl ?? 'Not provided'}
Website content (excerpt): ${websiteContent}

Based on this, generate a recovery strategy overview.
Return ONLY valid JSON with no markdown, no backticks:

{
  "businessType": "one clear label e.g. 'B2B SaaS', 'Newsletter', 'E-commerce'",
  "whatWeDetected": "2-3 sentence description of what their business does, written to them directly as 'you'. e.g. 'You run a project management SaaS for small teams...'",
  "recoveryApproach": "2-3 sentences explaining specifically how Revorva will approach recovery for THIS type of business. Mention their industry context.",
  "emailToneRecommendation": "friendly | professional | direct | empathetic",
  "emailToneReason": "One sentence explaining why this tone fits their business.",
  "sampleSubject": "A real example subject line we might send to their customer",
  "sampleOpener": "First 1-2 sentences of the recovery email body, personalized to their business type",
  "estimatedRecoveryRate": "A realistic range like '55-70%' based on their business type",
  "keyInsight": "One sharp, specific insight about payment recovery for their business type that shows we understand their world"
}`

  const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!apiRes.ok) {
    console.error('[analyze-business] Claude API error:', apiRes.status)
    return NextResponse.json({ success: false, error: 'AI analysis failed' }, { status: 500 })
  }

  const data = await apiRes.json()
  const text: string = data.content?.[0]?.text ?? ''

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('[analyze-business] Failed to parse Claude response')
    return NextResponse.json({ success: false, error: 'Analysis parsing failed' }, { status: 500 })
  }

  try {
    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json({ success: true, analysis: parsed })
  } catch {
    return NextResponse.json({ success: false, error: 'Analysis parsing failed' }, { status: 500 })
  }
}
