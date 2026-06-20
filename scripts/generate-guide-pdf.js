/* eslint-disable @typescript-eslint/no-var-requires */
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

const OUT_PATH = path.join(__dirname, '..', 'public', 'guides', 'saas-payment-recovery-playbook.pdf')

const CREAM = '#F5F2EC'
const INK = '#0F0E0C'
const ACCENT = '#C94A1F'
const MUTED = '#7a756c'

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function bg(doc, color) {
  const [r, g, b] = hexToRgb(color)
  doc.rect(0, 0, doc.page.width, doc.page.height).fill([r, g, b])
}

function accentBar(doc) {
  const [r, g, b] = hexToRgb(ACCENT)
  doc.rect(0, 0, doc.page.width, 6).fill([r, g, b])
}

function pageFooter(doc, pageNum) {
  const [r, g, b] = hexToRgb(MUTED)
  doc.fontSize(8).fillColor([r, g, b]).font('Helvetica')
  doc.text('revorva.com', 60, doc.page.height - 42, { continued: false })
  doc.text(String(pageNum), doc.page.width - 80, doc.page.height - 42, { align: 'right', width: 20 })
}

function sectionLabel(doc, text, y) {
  const [r, g, b] = hexToRgb(ACCENT)
  doc.fontSize(8).fillColor([r, g, b]).font('Helvetica-Bold').text(text.toUpperCase(), 60, y, { characterSpacing: 1.8 })
  return doc.y + 8
}

function h1(doc, text, y, size = 28) {
  const [r, g, b] = hexToRgb(INK)
  doc.fontSize(size).fillColor([r, g, b]).font('Helvetica-Bold').text(text, 60, y, { width: doc.page.width - 120, lineGap: 5 })
  return doc.y + 12
}

function h2(doc, text, y) {
  const [r, g, b] = hexToRgb(INK)
  doc.fontSize(15).fillColor([r, g, b]).font('Helvetica-Bold').text(text, 60, y, { width: doc.page.width - 120, lineGap: 3 })
  return doc.y + 10
}

function bodyText(doc, text, y, opts = {}) {
  const [r, g, b] = hexToRgb(INK)
  doc.fontSize(10.5).fillColor([r, g, b]).font('Helvetica').text(text, 60, y, { width: doc.page.width - 120, lineGap: 5, ...opts })
  return doc.y + 10
}

function mutedText(doc, text, y) {
  const [r, g, b] = hexToRgb(MUTED)
  doc.fontSize(10).fillColor([r, g, b]).font('Helvetica').text(text, 60, y, { width: doc.page.width - 120, lineGap: 4 })
  return doc.y + 8
}

function accentText(doc, text, y) {
  const [r, g, b] = hexToRgb(ACCENT)
  doc.fontSize(10.5).fillColor([r, g, b]).font('Helvetica-Bold').text(text, 60, y, { width: doc.page.width - 120, lineGap: 4 })
  return doc.y + 6
}

function bullet(doc, text, y) {
  const [ra, ga, ba] = hexToRgb(ACCENT)
  doc.fontSize(10.5).fillColor([ra, ga, ba]).text('→', 60, y)
  const [r, g, b] = hexToRgb(INK)
  doc.fontSize(10.5).fillColor([r, g, b]).font('Helvetica').text(text, 86, y, { width: doc.page.width - 146, lineGap: 4 })
  return doc.y + 8
}

function statBox(doc, value, label, x, y, w) {
  // Subtle cream-darker background box
  const [rb, gb, bb] = hexToRgb('#e8e3d9')
  doc.rect(x, y, w, 68).fill([rb, gb, bb])
  const [ra, ga, ba] = hexToRgb(ACCENT)
  doc.fontSize(26).fillColor([ra, ga, ba]).font('Helvetica-Bold').text(value, x, y + 12, { width: w, align: 'center' })
  const [rm, gm, bm] = hexToRgb(MUTED)
  doc.fontSize(8.5).fillColor([rm, gm, bm]).font('Helvetica').text(label, x + 4, doc.y + 4, { width: w - 8, align: 'center' })
  return y + 68
}

function divider(doc, y) {
  const [r, g, b] = hexToRgb('#ddd8ce')
  doc.moveTo(60, y).lineTo(doc.page.width - 60, y).strokeColor([r, g, b]).lineWidth(0.75).stroke()
  return y + 16
}

function accentCallout(doc, text, y) {
  const [rb, gb, bb] = hexToRgb('#fdf0eb')
  const [ra, ga, ba] = hexToRgb('#f0c8b8')
  doc.rect(60, y, doc.page.width - 120, 1).fill([ra, ga, ba])
  doc.rect(60, y + 1, 3, 50).fill([hexToRgb(ACCENT)[0], hexToRgb(ACCENT)[1], hexToRgb(ACCENT)[2]])
  doc.rect(63, y + 1, doc.page.width - 123, 50).fill([rb, gb, bb])
  const [ri, gi, bi] = hexToRgb(INK)
  doc.fontSize(10.5).fillColor([ri, gi, bi]).font('Helvetica').text(text, 74, y + 14, { width: doc.page.width - 140, lineGap: 4 })
  return doc.y + 18
}

const doc = new PDFDocument({ size: 'A4', margin: 0 })
doc.pipe(fs.createWriteStream(OUT_PATH))

// ─── PAGE 1: COVER ──────────────────────────────────────────────────────────
bg(doc, CREAM)
accentBar(doc)

const [ra, ga, ba] = hexToRgb(ACCENT)
doc.fontSize(9).fillColor([ra, ga, ba]).font('Helvetica-Bold').text('REVORVA', 60, 75, { characterSpacing: 3 })

const [ri, gi, bi] = hexToRgb(INK)

// Main title — large, confident
doc.fontSize(38).fillColor([ri, gi, bi]).font('Helvetica-Bold').text(
  'The Silent\nRevenue Killer',
  60, 115,
  { width: 420, lineGap: 6 }
)

// Orange accent rule
doc.rect(60, doc.y + 14, 60, 4).fill([ra, ga, ba])

doc.fontSize(14).fillColor([ri, gi, bi]).font('Helvetica').text(
  'What every SaaS founder needs to know about failed payments — and the $1,200+ they\'re losing every month without knowing',
  60, doc.y + 30,
  { width: 420, lineGap: 5 }
)

// Stats row
const statsY = doc.y + 36
const sw = (doc.page.width - 140) / 3
statBox(doc, '4–9%', 'of payments fail\nevery month', 60, statsY, sw - 6)
statBox(doc, '70%', 'of failures are\nrecoverable', 60 + sw + 4, statsY, sw - 6)
statBox(doc, '$1,200+', 'lost monthly at\n$20k MRR', 60 + (sw + 4) * 2, statsY, sw - 6)

const [rm, gm, bm] = hexToRgb(MUTED)
doc.fontSize(8).fillColor([rm, gm, bm]).font('Helvetica').text(
  'Sources: Recurly 2024 SaaS Payment Recovery Report · Stripe Subscription Best Practices 2023',
  60, statsY + 76,
  { width: doc.page.width - 120, align: 'center' }
)

doc.fontSize(10).fillColor([rm, gm, bm]).font('Helvetica').text(
  'By the Revorva team · revorva.com',
  60, doc.page.height - 80,
  { align: 'center', width: doc.page.width - 120 }
)

pageFooter(doc, 1)

// ─── PAGE 2: THE STORY ──────────────────────────────────────────────────────
doc.addPage()
bg(doc, CREAM)
accentBar(doc)

let y = 65
y = sectionLabel(doc, 'The Story', y)
y = h1(doc, 'It was a Tuesday morning when I noticed it.', y, 22)

y = bodyText(doc, 'A founder I know was frustrated. His customer acquisition was working — 12 new customers a month, solid conversion, great retention signals. But his MRR barely moved. Every month he added customers, and every month the number barely budged.', y)

y = bodyText(doc, 'We sat down with his Stripe dashboard together. Looked at the obvious things first. Pricing. Downgrades. Nothing obvious.', y)

y = bodyText(doc, 'Then we went three menus deep.', y)

// Pull quote box
const [rpq, gpq, bpq] = hexToRgb('#e8e3d9')
doc.rect(60, y, doc.page.width - 120, 60).fill([rpq, gpq, bpq])
doc.fontSize(14).fillColor([ra, ga, ba]).font('Helvetica-Bold').text('47', 80, y + 14)
doc.fontSize(10.5).fillColor([ri, gi, bi]).font('Helvetica').text('customers in \'past_due\' status. Some for weeks. Some for months.', 108, y + 16, { width: doc.page.width - 170 })
y = y + 76

y = bodyText(doc, '47 customers who had said yes to his product. 47 customers whose payments had failed silently. 47 customers he was losing without ever knowing it.', y)

y = bodyText(doc, 'When we did the math, he\'d lost $8,400 in MRR over the previous six months. Money he never saw. Customers who never meant to leave.', y)

y = divider(doc, y + 4)

y = bodyText(doc, 'This isn\'t his story alone.', y)
y = bodyText(doc, 'It\'s happening to every SaaS business on Stripe right now. Most founders just don\'t know it yet. The revenue is disappearing in slow motion, a few hundred dollars at a time, in a corner of Stripe most people never visit.', y)

y = accentCallout(doc, 'This guide is about the silent leak in your subscription revenue — what it is, why it happens, what it costs you, and what the businesses that solve it do differently.', y + 4)

pageFooter(doc, 2)

// ─── PAGE 3: WHY THIS HAPPENS ───────────────────────────────────────────────
doc.addPage()
bg(doc, CREAM)
accentBar(doc)

y = 65
y = sectionLabel(doc, 'The Cause', y)
y = h1(doc, 'Failed payments aren\'t what you think.', y, 22)

y = bodyText(doc, 'When most founders hear "payment failed," they assume the customer chose to leave — that they used a failed payment as a quiet exit. The data tells a completely different story.', y)

y = h2(doc, 'Why payments actually fail', y)

y = bullet(doc, 'A card expires the day a charge runs — the customer has a new card, they just forgot to update it', y)
y = bullet(doc, 'A bank flags the transaction as unusual overnight — the customer\'s bank blocked it, not the customer', y)
y = bullet(doc, 'A customer hits their credit limit on the 1st of the month — 48 hours later, it would have cleared', y)
y = bullet(doc, 'A new card was issued after fraud — customer never thought to update their SaaS subscriptions', y)
y = bullet(doc, 'Insufficient funds on payday week — the timing was just wrong', y)

y = bodyText(doc, 'None of these customers wanted to leave. Most don\'t even know their payment failed.', y + 4)

y = divider(doc, y + 4)

y = h2(doc, 'What happens without recovery', y)

y = bodyText(doc, 'Without a proper recovery system in place, Stripe\'s default behavior takes over. A few retry attempts on a fixed schedule. A generic email the customer may not recognise. A subscription that lapses quietly.', y)

y = bodyText(doc, 'The customer logs in two weeks later and finds their account dead. By then, the moment of recovery has passed. Many never come back — not because they didn\'t want the product, but because the friction of re-onboarding is too high.', y)

y = divider(doc, y + 4)

y = h2(doc, 'The industry data confirms this', y)

const s2w = (doc.page.width - 140) / 3
statBox(doc, '4–9%', 'of subscriptions fail\nevery month', 60, y, s2w - 6)
statBox(doc, '70%', 'are fully\nrecoverable', 60 + s2w + 4, y, s2w - 6)
statBox(doc, '20–30%', 'what most businesses\nactually recover', 60 + (s2w + 4) * 2, y, s2w - 6)
y = y + 84

y = bodyText(doc, 'That gap between 70% (possible) and 20–30% (typical) is where the money disappears. Most businesses are leaving two-thirds of their recovery potential untapped.', y)

pageFooter(doc, 3)

// ─── PAGE 4: THE COST ───────────────────────────────────────────────────────
doc.addPage()
bg(doc, CREAM)
accentBar(doc)

y = 65
y = sectionLabel(doc, 'The Real Cost', y)
y = h1(doc, 'The cost is bigger than most founders realise.', y, 22)

y = bodyText(doc, 'Let\'s translate this into real money. Not industry averages — your business.', y)

y = h2(doc, 'The monthly math at $20k MRR', y)

// Financial breakdown
const [rbox, gbox, bbox] = hexToRgb('#f0ebe3')
doc.rect(60, y, doc.page.width - 120, 110).fill([rbox, gbox, bbox])
const lineH = 18
doc.fontSize(10).fillColor([rm, gm, bm]).font('Helvetica').text('Monthly MRR', 76, y + 12)
doc.fontSize(10).fillColor([ri, gi, bi]).font('Helvetica-Bold').text('$20,000', doc.page.width - 140, y + 12, { align: 'right', width: 80 })
doc.fontSize(10).fillColor([rm, gm, bm]).font('Helvetica').text('6% failure rate → monthly at risk', 76, y + 12 + lineH)
doc.fontSize(10).fillColor([ra, ga, ba]).font('Helvetica-Bold').text('$1,200', doc.page.width - 140, y + 12 + lineH, { align: 'right', width: 80 })
doc.fontSize(10).fillColor([rm, gm, bm]).font('Helvetica').text('With poor recovery (25%)', 76, y + 12 + lineH * 2)
doc.fontSize(10).fillColor([ra, ga, ba]).font('Helvetica-Bold').text('−$900/mo lost', doc.page.width - 140, y + 12 + lineH * 2, { align: 'right', width: 80 })
doc.fontSize(10).fillColor([rm, gm, bm]).font('Helvetica').text('Annual revenue loss', 76, y + 12 + lineH * 3)
doc.fontSize(10).fillColor([ra, ga, ba]).font('Helvetica-Bold').text('−$10,800/year', doc.page.width - 140, y + 12 + lineH * 3, { align: 'right', width: 80 })

// Divider inside box
doc.moveTo(76, y + 12 + lineH * 4 - 4).lineTo(doc.page.width - 80, y + 12 + lineH * 4 - 4).strokeColor([hexToRgb('#ddd8ce')[0], hexToRgb('#ddd8ce')[1], hexToRgb('#ddd8ce')[2]]).lineWidth(0.5).stroke()
doc.fontSize(10.5).fillColor([ri, gi, bi]).font('Helvetica-Bold').text('With smart recovery (70%)', 76, y + 12 + lineH * 4)
doc.fontSize(10.5).fillColor([hexToRgb('#1a7a40')[0], hexToRgb('#1a7a40')[1], hexToRgb('#1a7a40')[2]]).font('Helvetica-Bold').text('+$840/mo recovered', doc.page.width - 140, y + 12 + lineH * 4, { align: 'right', width: 80 })
y = y + 120

y = bodyText(doc, 'But it\'s worse than that. Because the real loss isn\'t just one month\'s charge.', y + 4)

y = h2(doc, 'The LTV multiplier', y)

y = bodyText(doc, 'Every customer who churns to a failed payment was likely to pay you for an average of 14 more months. At a $79/month plan, that\'s $1,106 in lost lifetime value per customer.', y)

y = accentCallout(doc, 'For a business at $20k MRR losing just 3 customers per month to failed payment churn, the annual LTV loss is approximately $39,816 — not the $2,844 you\'d see in monthly revenue terms.', y + 4)

y = bodyText(doc, 'This is why failed payment recovery has such outsized ROI. You\'re not just recovering one month\'s charge. You\'re saving the entire customer relationship.', y + 4)

y = bodyText(doc, 'Most founders don\'t see this number anywhere because Stripe doesn\'t surface it. The failed payment data is buried. The LTV impact is invisible. The business bleeds slowly while the founder looks for the leak everywhere else.', y)

pageFooter(doc, 4)

// ─── PAGE 5: WHAT GOOD RECOVERY LOOKS LIKE ──────────────────────────────────
doc.addPage()
bg(doc, CREAM)
accentBar(doc)

y = 65
y = sectionLabel(doc, 'The Framework', y)
y = h1(doc, 'Good recovery isn\'t about trying harder. It\'s about thinking smarter.', y, 20)

y = bodyText(doc, 'The businesses recovering 65–70% of failed payments aren\'t doing anything exotic. They\'ve just got five fundamentals right that most businesses miss entirely.', y)

const principles = [
  {
    num: 'ONE',
    title: 'Timing matters more than frequency',
    text: 'A failed payment retried immediately has a 12% chance of success. Retried when bank cycles have processed — it can jump to 28%. The right timing doubles recovery rates without a single extra email. Wrong timing burns customer goodwill.',
  },
  {
    num: 'TWO',
    title: 'The email is more important than the retry',
    text: 'Most failures need the customer to take action — update a card, contact their bank, increase a limit. Retries alone won\'t fix this. The email is what triggers customer action. Without a good email at the right moment, you\'re just retrying into a wall.',
  },
  {
    num: 'THREE',
    title: 'Personalisation is the force multiplier',
    text: 'A generic "payment failed" email from noreply@stripe.com is ignored. A personal note from billing@yourcompany.com with the customer\'s name and exact amount gets opened 4x more often. Every percentage point of open rate is recovered revenue.',
  },
  {
    num: 'FOUR',
    title: 'Know when to stop',
    text: 'After 14 days of failed retries, recovery probability drops below 5%. Smart systems stop retrying at the right time and trigger different workflows — win-back sequences, account pause, or manual outreach for high-value customers.',
  },
  {
    num: 'FIVE',
    title: 'Track everything',
    text: 'You can\'t improve what you can\'t see. The businesses at 70%+ recovery all have one thing in common: they know exactly what\'s recovered, what\'s pending, and why they\'re losing what they lose. Measurement drives improvement.',
  },
]

for (const p of principles) {
  if (doc.y > doc.page.height - 100) {
    pageFooter(doc, 5)
    doc.addPage()
    bg(doc, CREAM)
    accentBar(doc)
    y = 65
  }
  const [ra2, ga2, ba2] = hexToRgb(ACCENT)
  doc.fontSize(8).fillColor([ra2, ga2, ba2]).font('Helvetica-Bold').text(p.num, 60, doc.y + 4, { characterSpacing: 1.5 })
  const [ri2, gi2, bi2] = hexToRgb(INK)
  doc.fontSize(11).fillColor([ri2, gi2, bi2]).font('Helvetica-Bold').text(p.title, 60, doc.y + 6)
  const [rm2, gm2, bm2] = hexToRgb(MUTED)
  doc.fontSize(10).fillColor([rm2, gm2, bm2]).font('Helvetica').text(p.text, 60, doc.y + 4, { width: doc.page.width - 120, lineGap: 4 })
  y = doc.y + 14
}

pageFooter(doc, 5)

// ─── PAGE 6: THE HIDDEN COMPLEXITY ──────────────────────────────────────────
doc.addPage()
bg(doc, CREAM)
accentBar(doc)

y = 65
y = sectionLabel(doc, 'The Reality Check', y)
y = h1(doc, 'At this point, you might be thinking: "I could build this."', y, 20)

y = bodyText(doc, 'You probably could. Most engineering-capable SaaS teams could. But here\'s what founders consistently underestimate about building payment recovery in-house.', y)

y = h2(doc, 'What\'s actually involved', y)

const complexity = [
  'Stripe webhook handling across a dozen different event types — which change with every API update',
  'Retry orchestration with bank-cycle-aware timing logic',
  'Email infrastructure with proper DNS records, DKIM signing, SPF, and DMARC configuration',
  'Domain reputation management — one bad send can kill your deliverability for months',
  'Personalisation logic that handles 50+ edge cases (cancelled before retry, updated card, hard decline)',
  'Recovery analytics with proper attribution so you can improve over time',
  'Per-customer controls — skip, pause, escalate for high-value accounts',
  'Ongoing maintenance as Stripe evolves their API (they update frequently)',
]

for (const item of complexity) {
  y = bullet(doc, item, y)
}

y = divider(doc, y + 4)

y = h2(doc, 'What this actually costs', y)

y = bodyText(doc, 'Teams that have built this well estimate 2–4 weeks of dedicated senior engineering time to build version 1. For an engineer earning $120k/year, that\'s $5,500–$11,000 of engineering cost upfront.', y)

y = bodyText(doc, 'Then ongoing maintenance: approximately $1,500–$3,000 per year, plus the opportunity cost of every week that engineer isn\'t building the features your customers actually pay for.', y)

y = accentCallout(doc, 'For most SaaS businesses, the total 3-year cost of building and maintaining payment recovery in-house is $20,000–$40,000. The cost of using a dedicated tool: $1,044–$2,844. The math is uncomfortable.', y + 4)

y = bodyText(doc, 'The question isn\'t whether you CAN build this. It\'s whether building it is the highest-value use of your engineering capacity — or whether paying $29/month for a tool that does it better is the obvious business decision.', y + 4)

y = bodyText(doc, 'Your engineering hours are finite. Every hour spent on payment infrastructure is an hour not spent on the product features that win you new customers.', y)

pageFooter(doc, 6)

// ─── PAGE 7: HOW REVORVA CHANGES YOUR LIFE ──────────────────────────────────
doc.addPage()
bg(doc, CREAM)
accentBar(doc)

y = 65
y = sectionLabel(doc, 'The Solution', y)
y = h1(doc, 'There\'s a simpler way.', y, 22)

y = bodyText(doc, 'Revorva was built specifically for this problem. For founders who have better things to do than build payment infrastructure.', y)

y = h2(doc, 'The morning it gets installed', y)
y = bodyText(doc, 'You go to revorva.com. Sign up with your email. Click \'Connect Stripe\'. Authorise via OAuth. Done. Total time: 2 minutes. You go back to building your product.', y)

y = h2(doc, 'The first week', y)
y = bodyText(doc, 'Revorva starts working immediately. Every failed payment is detected. Smart retries trigger automatically. Personalised emails are sent from your domain — your customers never see Revorva, they see your brand. You check your dashboard once and see: recoveries happening, revenue coming back.', y)

y = h2(doc, 'The first month', y)
y = bodyText(doc, 'You realise you haven\'t thought about failed payments at all. You haven\'t manually chased a single customer. You haven\'t written a line of recovery code. Meanwhile, Revorva has recovered revenue you would have lost entirely.', y)

y = h2(doc, 'The first year', y)
y = bodyText(doc, 'At a $20k MRR business recovering 65% of failed payments with Revorva (vs 25% before), you\'ve added back approximately $8,400/year in recovered MRR. On the Starter plan ($29/month, $348/year), that\'s a 24x return. On the Growth plan ($79/month), it\'s still 8x.', y)

y = divider(doc, y + 4)

// CTA box
const [ra3, ga3, ba3] = hexToRgb(ACCENT)
doc.rect(60, y, doc.page.width - 120, 100).fill([ra3, ga3, ba3])
doc.fontSize(18).fillColor('white').font('Helvetica-Bold').text('Try Revorva free for 14 days', 80, y + 16, { width: doc.page.width - 160, align: 'center' })
doc.fontSize(10).fillColor('white').font('Helvetica').text('No credit card · Setup in 2 minutes · Cancel anytime · Plans from $29/month', 80, doc.y + 6, { width: doc.page.width - 160, align: 'center' })
doc.fontSize(13).fillColor('white').font('Helvetica-Bold').text('→ revorva.com', 80, doc.y + 12, { width: doc.page.width - 160, align: 'center' })

y = y + 112

const [rm2, gm2, bm2] = hexToRgb(MUTED)
doc.fontSize(9).fillColor([rm2, gm2, bm2]).font('Helvetica').text(
  'P.S. If you\'ve read this far, you\'re the kind of founder who takes the long view. We built Revorva for founders exactly like you.',
  60, y,
  { width: doc.page.width - 120, align: 'center', lineGap: 3 }
)

pageFooter(doc, 7)

doc.end()

doc.on('finish', () => {
  console.log('PDF generated:', OUT_PATH)
  const stats = fs.statSync(OUT_PATH)
  console.log('File size:', Math.round(stats.size / 1024) + 'KB')
})
