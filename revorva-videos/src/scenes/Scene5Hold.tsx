import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors } from '../constants/colors';
import { fontFamily } from '../constants/fonts';
import { BackgroundLayer } from '../components/BackgroundLayer';
import { RevorvaIcon } from '../components/RevorvaIcon';
import { Wordmark } from '../components/Wordmark';
import { FloatingParticles } from '../components/FloatingParticles';

// Scene 5: frames 0–59 (2s local) — continuation of Scene 4.
//
// The icon, wordmark, and tagline are already fully revealed from Scene 4.
// We render them at their settled state (frame offset 9999) so no
// entrance animation fires. Only NEW elements animate in:
//   - Floating particles drift upward
//   - Subtle bottom-center orange glow expands slightly

const SETTLED = 9999; // large offset → all springs fully settled

export const Scene5Hold: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle bottom glow — very gentle expansion over the 2s hold
  const glowSize = interpolate(frame, [0, 59], [40, 52], { extrapolateRight: 'clamp' });
  const glowOpacity = interpolate(frame, [0, 20], [0, 0.08], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <BackgroundLayer
        orangeX={50}
        orangeY={92}
        orangeOpacity={0.12}
        orangeBlur={140}
        orangeSize={580}
        greenX={78}
        greenY={20}
        greenOpacity={0.05}
        greenShow
        gridOpacity={0.04}
        gradientAngleStart={175}
        gradientAngleEnd={179}
        gradientDuration={90}
      />

      {/* Subtle expanding bottom glow — only new in Scene 5 */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            bottom: '-5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${glowSize}%`,
            height: `${glowSize * 0.5}%`,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(201,74,31,0.45) 0%, transparent 70%)`,
            filter: 'blur(50px)',
            opacity: glowOpacity,
          }}
        />
      </AbsoluteFill>

      {/* Particles — new in Scene 5 */}
      <FloatingParticles count={5} startFrame={0} />

      {/* Held elements — rendered fully settled, no entrance animation */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 48,
        }}
      >
        {/* Icon: offset by SETTLED so all springs are resolved, breathe continues */}
        <RevorvaIcon
          frame={SETTLED + frame}
          fps={fps}
          startFrame={0}
          size={200}
          breathe
        />

        {/* Wordmark: offset by SETTLED — staggerFrames=0 still uses springs,
            so we need a large startFrame offset to skip the entrance. */}
        <Wordmark
          startFrame={-SETTLED}
          fontSize={160}
          color={colors.ink}
          staggerFrames={0}
        />

        {/* Tagline — always fully visible, no animation */}
        <div
          style={{
            fontFamily,
            fontSize: 28,
            fontWeight: 500,
            color: colors.inkMid,
            letterSpacing: '1px',
            marginTop: -24,
          }}
        >
          Recover what's yours.
        </div>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
