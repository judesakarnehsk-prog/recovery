import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { MeshGradient } from '../components/MeshGradient';
import { EdgeGradientLine } from '../components/EdgeGradientLine';
import { Wordmark } from '../components/Wordmark';

// Scene 9: frames 0–59 (2s local — the final hold)
// Confident brand mark, breathing, particle drift

const PARTICLE_COUNT = 6;

interface ParticleProps { seed: number }

const Particle: React.FC<ParticleProps> = ({ seed }) => {
  const frame = useCurrentFrame();
  const x = 22 + ((seed * 113.7) % 56);
  const size = 3 + (seed % 3);
  const speed = 0.7 + (seed % 4) * 0.18;
  const delay = (seed * 7) % 20;
  const lf = Math.max(0, frame - delay);
  const y = 58 - lf * speed;
  const opacity = interpolate(lf, [0, 6, 42, 60], [0, 0.5, 0.35, 0], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
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
        backgroundColor: colors.accent,
        opacity,
        filter: 'blur(0.5px)',
        pointerEvents: 'none',
      }}
    />
  );
};

export const Scene9Brand: React.FC = () => {
  const frame = useCurrentFrame();

  const SETTLED = 9999;

  const taglineOpacity = interpolate(Math.min(frame, 18), [0, 18], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <MeshGradient />
      <EdgeGradientLine opacity={0.3} speed={320} />

      {/* Particles */}
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <Particle key={i} seed={i + 1} />
        ))}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        {/* Fully settled wordmark — large, confident */}
        <Wordmark
          startFrame={-SETTLED}
          fontSize={220}
          color={colors.ink}
          staggerFrames={0}
        />

        {/* Tagline */}
        <div
          style={{
            fontFamily,
            fontSize: 28,
            fontWeight: 600,
            color: colors.inkMid,
            opacity: taglineOpacity,
          }}
        >
          Recover what's yours.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
