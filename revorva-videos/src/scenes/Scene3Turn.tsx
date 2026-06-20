import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { springConfigs } from '../constants/animations';
import { NoiseTexture } from '../components/NoiseTexture';

// Scene 3: frames 0–89 (3s local)

interface UpParticleProps {
  seed: number;
}

const OrangeParticle: React.FC<UpParticleProps> = ({ seed }) => {
  const frame = useCurrentFrame();
  const x = 20 + ((seed * 113.7) % 60);
  const speed = 0.8 + (seed % 5) * 0.3;
  const delay = (seed * 7) % 30;
  const size = 3 + (seed % 5);
  const localFrame = Math.max(0, frame - delay);
  const startY = 65 + (seed % 20);
  const y = startY - localFrame * speed;
  const opacity = interpolate(localFrame, [0, 8, 60, 90], [0, 0.6, 0.4, 0], {
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
        backgroundColor: colors.accentGlow,
        opacity,
        filter: `blur(${0.5 + (seed % 2) * 0.5}px)`,
        pointerEvents: 'none',
      }}
    />
  );
};

export const Scene3Turn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1-frame white flash at start
  const flashOpacity = interpolate(frame, [0, 1, 4], [1, 1, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  // Orange dot → expanding circle explosion
  const explosionProgress = spring({
    fps,
    frame: Math.max(0, frame - 2),
    config: { damping: 14, stiffness: 80, mass: 1 },
  });

  const dotSize = interpolate(explosionProgress, [0, 0.3, 1], [0, 12, 160]); // % of viewport width
  const dotOpacity = interpolate(explosionProgress, [0, 0.05, 0.6, 1], [0, 1, 0.7, 0]);
  const ringSize = interpolate(explosionProgress, [0, 1], [0, 220]);
  const ringOpacity = interpolate(explosionProgress, [0, 0.2, 0.7, 1], [0, 0.5, 0.2, 0]);

  // Background orange undertone comes in with explosion
  const bgOpacity = interpolate(explosionProgress, [0, 0.4, 1], [0, 0.08, 0.05]);

  // "What if you could" text
  const line1Progress = spring({ fps, frame: Math.max(0, frame - 28), config: springConfigs.gentle });
  const line1Opacity = interpolate(Math.max(0, frame - 28), [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const line1Y = interpolate(line1Progress, [0, 1], [20, 0]);
  const line1Blur = interpolate(Math.max(0, frame - 28), [0, 12], [4, 0], { extrapolateRight: 'clamp' });

  // "recover it all?" text
  const line2Progress = spring({ fps, frame: Math.max(0, frame - 46), config: springConfigs.snappy });
  const line2Opacity = interpolate(Math.max(0, frame - 46), [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const line2Y = interpolate(line2Progress, [0, 1], [24, 0]);
  const line2Scale = interpolate(line2Progress, [0, 1], [0.94, 1]);
  const line2Blur = interpolate(Math.max(0, frame - 46), [0, 12], [4, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.inkDeep }}>
      <NoiseTexture opacity={0.03} />

      {/* Orange bg undertone */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${colors.accent}, transparent 70%)`,
          opacity: bgOpacity,
        }}
      />

      {/* Explosion ring */}
      <AbsoluteFill
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
      >
        <div
          style={{
            width: `${ringSize}%`,
            height: `${ringSize}%`,
            borderRadius: '50%',
            border: `2px solid ${colors.accentGlow}`,
            opacity: ringOpacity,
            position: 'absolute',
          }}
        />
        {/* Expanding glow dot */}
        <div
          style={{
            width: `${dotSize}%`,
            height: `${dotSize}%`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.accentGlow} 0%, ${colors.accent} 40%, transparent 70%)`,
            opacity: dotOpacity,
            position: 'absolute',
          }}
        />
      </AbsoluteFill>

      {/* Particles */}
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        {Array.from({ length: 8 }, (_, i) => (
          <OrangeParticle key={i} seed={i + 1} />
        ))}
      </AbsoluteFill>

      {/* Text */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 60,
            fontWeight: 700,
            color: colors.whiteAlpha,
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px)`,
            filter: line1Blur > 0.1 ? `blur(${line1Blur}px)` : undefined,
          }}
        >
          What if you could
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 96,
            fontWeight: 900,
            color: colors.accent,
            opacity: line2Opacity,
            transform: `translateY(${line2Y}px) scale(${line2Scale})`,
            filter: [
              line2Blur > 0.1 ? `blur(${line2Blur}px)` : '',
              `drop-shadow(0 0 30px ${colors.accent}88)`,
            ].filter(Boolean).join(' '),
          }}
        >
          recover it all?
        </div>
      </AbsoluteFill>

      {/* 1-frame white flash overlay */}
      <AbsoluteFill
        style={{ backgroundColor: 'white', opacity: flashOpacity, pointerEvents: 'none' }}
      />
    </AbsoluteFill>
  );
};
