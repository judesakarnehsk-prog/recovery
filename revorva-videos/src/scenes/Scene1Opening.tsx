import React from 'react';
import { AbsoluteFill } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { FadeIn } from '../components/FadeIn';
import { S1 } from '../constants/timing';

// Scene 1: 0–119 (4s local)
// Silence → INTRODUCING → "A new standard" → subtitle

export const Scene1Opening: React.FC = () => (
  <AbsoluteFill
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
    }}
  >
    {/* "INTRODUCING" — accent, small caps feel */}
    <FadeIn startFrame={S1.label} duration={20} scaleFrom={1} style={{ marginBottom: 48 }}>
      <div
        style={{
          fontFamily,
          fontSize: 14,
          fontWeight: 700,
          color: colors.accent,
          letterSpacing: '6px',
          textTransform: 'uppercase',
        }}
      >
        Introducing
      </div>
    </FadeIn>

    {/* Main headline — all letters together, no stagger */}
    <FadeIn startFrame={S1.headline} duration={30} scaleFrom={0.97} style={{ marginBottom: 28 }}>
      <div
        style={{
          fontFamily,
          fontSize: 80,
          fontWeight: 700,
          color: colors.ink,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          textAlign: 'center',
        }}
      >
        A new standard
      </div>
    </FadeIn>

    {/* Subtitle */}
    <FadeIn startFrame={S1.sub} duration={30} scaleFrom={1}>
      <div
        style={{
          fontFamily,
          fontSize: 32,
          fontWeight: 400,
          color: colors.muted,
          lineHeight: 1.4,
          textAlign: 'center',
        }}
      >
        for SaaS payment recovery
      </div>
    </FadeIn>
  </AbsoluteFill>
);
