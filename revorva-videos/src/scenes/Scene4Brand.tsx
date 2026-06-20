import React from 'react';
import { AbsoluteFill } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { FadeIn } from '../components/FadeIn';
import { Wordmark } from '../components/Wordmark';

// Scene 4: local frames 0–179 (6s)
// The brand reveal. One element at a time. Hold perfectly still at the end.
//
// Local timings (mapped from absolute):
//   Wordmark:  local 40  (absolute 400 - 360 = 40)
//   Tagline:   local 90  (absolute 450 - 360 = 90)
//   URL:       local 130 (absolute 490 - 360 = 130)
//   Still hold: local 150 → 179

export const Scene4Brand: React.FC = () => (
  <AbsoluteFill
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
    }}
  >
    {/* "revorva." — all letters together, no stagger */}
    <FadeIn startFrame={40} duration={40} scaleFrom={0.97} style={{ marginBottom: 36 }}>
      <Wordmark fontSize={180} color={colors.ink} />
    </FadeIn>

    {/* "Recover what's yours." */}
    <FadeIn startFrame={90} duration={30} scaleFrom={1} style={{ marginBottom: 20 }}>
      <div
        style={{
          fontFamily,
          fontSize: 32,
          fontWeight: 500,
          color: colors.ink,
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
          textAlign: 'center',
        }}
      >
        Recover what's yours.
      </div>
    </FadeIn>

    {/* "revorva.com" */}
    <FadeIn startFrame={130} duration={20} scaleFrom={1}>
      <div
        style={{
          fontFamily,
          fontSize: 20,
          fontWeight: 500,
          color: colors.muted,
          letterSpacing: '0',
          lineHeight: 1,
          textAlign: 'center',
        }}
      >
        revorva.com
      </div>
    </FadeIn>
  </AbsoluteFill>
);
