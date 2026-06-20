import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { colors } from '../constants/colors';

interface ParticleProps {
  seed: number;
  startFrame?: number;
}

const Particle: React.FC<ParticleProps> = ({ seed, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame - (seed * 11) % 40);

  const x = 15 + ((seed * 137.5) % 70);
  const size = 3 + (seed % 4);
  const speed = 0.6 + (seed % 3) * 0.25;
  const startY = 85 + (seed % 10);

  const y = startY - localFrame * speed;
  const opacity = interpolate(localFrame, [0, 10, 60, 90], [0, 0.5, 0.35, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  const wobble = Math.sin(localFrame * 0.08 + seed) * 6;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: seed % 3 === 0 ? colors.accent : colors.cream,
        opacity,
        transform: `translateX(${wobble}px)`,
        filter: 'blur(0.5px)',
        pointerEvents: 'none',
      }}
    />
  );
};

interface FloatingParticlesProps {
  count?: number;
  startFrame?: number;
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 6,
  startFrame = 0,
}) => {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: count }, (_, i) => (
        <Particle key={i} seed={i + 1} startFrame={startFrame} />
      ))}
    </div>
  );
};
