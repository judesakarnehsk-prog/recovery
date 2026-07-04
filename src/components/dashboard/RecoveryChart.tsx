'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export interface ChartEntry {
  date: string
  recovered: number
  emails: number
}

interface Props {
  data: ChartEntry[]
  period: '7d' | '30d' | 'all'
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  // Pull raw values back from the normalised payload
  const recoveredEntry = payload.find((p: any) => p.dataKey === 'recoveredNorm')
  const emailsEntry = payload.find((p: any) => p.dataKey === 'emailsNorm')
  return (
    <div style={{
      background: 'var(--surface-2, #161616)',
      border: '1px solid var(--border-mid, #282828)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13,
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    }}>
      <p style={{ color: 'var(--text-2, #888)', margin: '0 0 6px', fontSize: 12 }}>{label}</p>
      {recoveredEntry && (
        <p style={{ color: '#C94A1F', margin: '3px 0', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
          ${recoveredEntry.payload.recovered.toLocaleString()} recovered
        </p>
      )}
      {emailsEntry && (
        <p style={{ color: '#60A5FA', margin: '3px 0', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
          {emailsEntry.payload.emails} email{emailsEntry.payload.emails !== 1 ? 's' : ''} sent
        </p>
      )}
    </div>
  )
}

export function RecoveryChart({ data, period }: Props) {
  // Compute maxes for normalisation
  const maxRecovered = Math.max(...data.map((d) => d.recovered), 1)
  const maxEmails = Math.max(...data.map((d) => d.emails), 1)

  // Normalise both series to 0–100 so they share one scale without a visible Y axis
  const normData = data.map((d) => ({
    ...d,
    recoveredNorm: (d.recovered / maxRecovered) * 100,
    emailsNorm: (d.emails / maxEmails) * 100,
  }))

  // X-axis tick interval: always show ~6 evenly spaced labels
  const totalDays = data.length
  const xInterval = period === '7d'
    ? 0                                      // all 7 days
    : period === '30d'
    ? 4                                      // every 5th → ~6 labels
    : Math.max(1, Math.floor(totalDays / 6)) // all-time: ~6 labels

  return (
    <div
      className="rounded-xl"
      style={{
        background: 'var(--surface, #111)',
        border: '1px solid var(--border, #1E1E1E)',
        padding: 24,
        margin: '0 32px 24px',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1, #F2F2F2)', margin: '0 0 4px' }}>Recovery Activity</p>
          <p style={{ fontSize: 12, color: 'var(--text-3, #444)', margin: 0 }}>Revenue recovered and emails sent over time</p>
        </div>
        <div className="flex gap-4" style={{ fontSize: 12 }}>
          <span style={{ color: '#C94A1F' }}>● Revenue recovered</span>
          <span style={{ color: 'var(--blue, #60A5FA)' }}>● Emails sent</span>
        </div>
      </div>

      <div style={{ height: 220, padding: '0 10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={normData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRecovered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C94A1F" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#C94A1F" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradEmails" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="var(--border, #1E1E1E)"
              vertical={false}
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--text-3, #444)', fontSize: 11 } as any}
              axisLine={false}
              tickLine={false}
              interval={xInterval}
            />
            {/* Both Y axes hidden — normalised 0-100 scale, no labels needed */}
            <YAxis yAxisId="left" hide={true} domain={[0, 100]} />
            <YAxis yAxisId="right" orientation="right" hide={true} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="recoveredNorm"
              stroke="#C94A1F"
              strokeWidth={2}
              fill="url(#gradRecovered)"
              dot={false}
              activeDot={{ r: 4, fill: '#C94A1F', strokeWidth: 0 }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="emailsNorm"
              stroke="#60A5FA"
              strokeWidth={1.5}
              fill="url(#gradEmails)"
              dot={false}
              activeDot={{ r: 3, fill: '#60A5FA', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
