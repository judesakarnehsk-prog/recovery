import React from 'react';
import { AbsoluteFill } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { FadeIn } from '../components/FadeIn';

// Scene 2: local frames 0–119 (via Sequence, so frame resets to 0)
// Staggered elements — each appears alone, one at a time.

export const Scene2Problem: React.FC = () => (
  <AbsoluteFill
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
    }}
  >
    {/* "Failed payments cost" — appears at local frame 30 */}
    <FadeIn startFrame={30} duration={30} scaleFrom={1} style={{ marginBottom: 24 }}>
      <div
        style={{
          fontFamily,
          fontSize: 56,
          fontWeight: 400,
          color: colors.ink,
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        Failed payments cost
      </div>
    </FadeIn>

    {/* "$1,200+ monthly" — at local frame 60. $ in accent. */}
    <FadeIn startFrame={60} duration={30} scaleFrom={0.96} style={{ marginBottom: 28 }}>
      <div
        style={{
          fontFamily,
          fontSize: 96,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'baseline',
          gap: 0,
        }}
      >
        <span style={{ color: colors.accent }}>$</span>
        <span style={{ color: colors.ink }}>1,200+ monthly</span>
      </div>
    </FadeIn>

    {/* "for the average $20k MRR business" — at local frame 80 */}
    <FadeIn startFrame={80} duration={20} scaleFrom={1}>
      <div
        style={{
          fontFamily,
          fontSize: 24,
          fontWeight: 400,
          color: colors.muted,
          lineHeight: 1.5,
          textAlign: 'center',
        }}
      >
        for the average $20k MRR business
      </div>
    </FadeIn>
  </AbsoluteFill>
);
