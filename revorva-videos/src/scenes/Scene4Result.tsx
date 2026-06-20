import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import { colors } from '../constants/colors';
import { fontFamily } from '../constants/fonts';

const PARTICLE_COUNT = 20;

const GreenParticle: React.FC<{ seed: number }> = ({ seed }) => {
  const frame = useCurrentFrame();

  const x = 30 + ((seed * 113.7) % 40);
  const startY = 55 + ((seed * 67.3) % 20);
  const speed = 0.5 + (seed % 4) * 0.15;
  const size = 4 + (seed % 5);
  const delay = (seed * 11) % 30;

  const localFrame = Math.max(0, frame - delay);
  const y = startY - localFrame * speed;
  const opacity = interpolate(localFrame, [0, 10, 60, 90], [0, 0.15, 0.12, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: colors.successGlow,
        opacity,
      }}
    />
  );
};

export const Scene4Result: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background green tint fade in
  const bgOpacity = interpolate(Math.min(frame, 20), [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // "Recovered" label
  const labelOpacity = interpolate(Math.min(frame, 12), [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const labelProgress = spring({ fps, frame, config: { damping: 22, stiffness: 90 } });
  const labelY = interpolate(labelProgress, [0, 1], [20, 0]);

  // Counter
  const counterDelay = 12;
  const localCounter = Math.max(0, frame - counterDelay);
  const tickDuration = 60;

  const tickValue = interpolate(
    Math.min(localCounter, tickDuration * 0.75),
    [0, tickDuration * 0.75],
    [0, 1247],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const bounceProgress = spring({
    fps,
    frame: Math.max(0, localCounter - tickDuration * 0.75),
    config: { damping: 10, stiffness: 150, mass: 0.7 },
  });

  const displayValue = localCounter > tickDuration * 0.75
    ? 1247
    : Math.round(tickValue);

  const counterScale = localCounter > tickDuration * 0.75
    ? interpolate(bounceProgress, [0, 1], [0.9, 1])
    : 1;

  const counterOpacity = interpolate(Math.min(localCounter, 10), [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Sub-label
  const subLabelOpacity = interpolate(Math.max(0, frame - 55), [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      {/* Rich cream with green undertone */}
      <AbsoluteFill
        style={{
          background: colors.cream,
          opacity: bgOpacity,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 50%, rgba(26,122,64,0.06) 0%, transparent 70%)`,
          opacity: bgOpacity,
        }}
      />

      {/* Green particles floating upward */}
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <GreenParticle key={i} seed={i + 1} />
        ))}
      </AbsoluteFill>

      {/* Content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 48,
            fontWeight: 600,
            color: colors.muted,
            opacity: labelOpacity,
            transform: `translateY(${labelY}px)`,
          }}
        >
          Recovered
        </div>

        <div
          style={{
            fontFamily,
            fontSize: 140,
            fontWeight: 900,
            color: colors.successGlow,
            lineHeight: 1,
            opacity: counterOpacity,
            transform: `scale(${counterScale})`,
            textShadow: `0 0 60px ${colors.success}44`,
          }}
        >
          ${displayValue.toLocaleString()}
        </div>

        <div
          style={{
            fontFamily,
            fontSize: 28,
            fontWeight: 500,
            color: colors.muted,
            opacity: subLabelOpacity,
            marginTop: 8,
          }}
        >
          in 14 days, automatically
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
