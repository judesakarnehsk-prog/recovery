import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Revorva – Recover Failed Payments Automatically'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#f5f2ec',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          padding: 80,
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 64,
            height: 64,
            background: '#c8401a',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 36,
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          R
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#0f0e0c',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: 20,
            letterSpacing: '-0.02em',
          }}
        >
          Stop losing revenue to
          <span style={{ color: '#c8401a', fontStyle: 'italic' }}> failed payments</span>
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: 24,
            color: '#7a756c',
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          Smart dunning that recovers subscription revenue on autopilot.
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            fontSize: 18,
            color: '#7a756c',
            letterSpacing: '0.02em',
          }}
        >
          revorva.com
        </div>
      </div>
    ),
    { ...size }
  )
}
