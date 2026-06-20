import React from 'react';
import { AbsoluteFill } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { FadeIn } from '../components/FadeIn';

// Scene 3: local frames 0–119
// The stat integrated into the sentence. "70%" is the ONE orange element.

export const Scene3Solution: React.FC = () => (
  <AbsoluteFill
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
      padding: '0 80px',
    }}
  >
    {/* Integrated sentence — appears at local frame 30 */}
    {/* "70%" rendered in accent; the rest in ink */}
    <FadeIn startFrame={30} duration={30} scaleFrom={0.97} style={{ marginBottom: 28 }}>
      <div
        style={{
          fontFamily,
          textAlign: 'center',
          lineHeight: 1.15,
        }}
      >
        {/* Line 1: the number */}
        <span
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: colors.accent,
            letterSpacing: '-0.02em',
            display: 'block',
          }}
        >
          70%
        </span>
        {/* Line 2: context */}
        <span
          style={{
            fontSize: 56,
            fontWeight: 400,
            color: colors.ink,
            display: 'block',
            marginTop: 8,
          }}
        >
          of those are recoverable
        </span>
      </div>
    </FadeIn>

    {/* "with the right system" — at local frame 80 */}
    <FadeIn startFrame={80} duration={20} scaleFrom={1}>
      <div
        style={{
          fontFamily,
          fontSize: 32,
          fontWeight: 400,
          color: colors.muted,
          lineHeight: 1.5,
          textAlign: 'center',
        }}
      >
        with the right system
      </div>
    </FadeIn>
  </AbsoluteFill>
);
