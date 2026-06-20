import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { MeshGradient } from '../components/MeshGradient';
import { EdgeGradientLine } from '../components/EdgeGradientLine';
import { AnimatedCounter } from '../components/AnimatedCounter';

// Scene 2: frames 0–59 (2s local)
// The counter of doom

export const Scene2Counter: React.FC = () => {
  const frame = useCurrentFrame();

  // Red pulse flash at start (1 frame)
  const redFlash = interpolate(frame, [0, 1, 4], [0.35, 0.35, 0], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
  });

  // Screen vibration during counting
  const shake = frame < 48
    ? Math.sin(frame * 2.1) * 2.5 * interpolate(frame, [0, 48, 55], [1, 0.4, 0], { extrapolateRight: 'clamp' })
    : 0;

  // Label entrance
  const labelOpacity = interpolate(Math.min(frame, 8), [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  // Sub text entrance
  const subOpacity = interpolate(Math.max(0, frame - 35), [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <MeshGradient />
      <EdgeGradientLine opacity={0.35} speed={280} />

      {/* Red pulse overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: colors.loss,
          opacity: redFlash,
          pointerEvents: 'none',
        }}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          transform: `translate(${shake}px, ${shake * 0.4}px)`,
        }}
      >
        {/* LOSING label */}
        <div
          style={{
            fontFamily,
            fontSize: 18,
            fontWeight: 700,
            color: colors.accent,
            letterSpacing: '6px',
            opacity: labelOpacity,
          }}
        >
          LOSING
        </div>

        {/* Counter */}
        <AnimatedCounter
          from={0}
          to={12847}
          startFrame={4}
          durationFrames={45}
          fontSize={148}
          fontWeight={900}
          color={colors.loss}
          prefix="$"
          glowColor={`${colors.loss}66`}
        />

        {/* Sub text */}
        <div
          style={{
            fontFamily,
            fontSize: 24,
            fontWeight: 500,
            color: colors.inkMid,
            fontStyle: 'italic',
            opacity: subOpacity,
          }}
        >
          This month, silently.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
