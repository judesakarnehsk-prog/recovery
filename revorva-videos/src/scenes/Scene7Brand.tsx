import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors } from '../constants/colors';
import { BackgroundLayer } from '../components/BackgroundLayer';
import { AnimatedText } from '../components/AnimatedText';
import { Wordmark } from '../components/Wordmark';
import { GradientLine } from '../components/GradientLine';
import { fontFamily } from '../constants/fonts';

// Scene 7: frames 0–59 (2s local — the hold)

const PARTICLE_COUNT = 6;

interface ParticleProps { seed: number }

const Particle: React.FC<ParticleProps> = ({ seed }) => {
  const frame = useCurrentFrame();
  const x = 20 + ((seed * 113.7) % 60);
  const size = 3 + (seed % 3);
  const speed = 0.8 + (seed % 4) * 0.2;
  const delay = (seed * 9) % 20;
  const lf = Math.max(0, frame - delay);
  const y = 60 - lf * speed;
  const opacity = interpolate(lf, [0, 8, 40, 60], [0, 0.45, 0.35, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

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

export const Scene7Brand: React.FC = () => {
  const frame = useCurrentFrame();

  // Everything is fully settled — pass large offsets
  const SETTLED = 9999;

  // "revorva.com" fades in after 400ms
  const urlOpacity = interpolate(Math.max(0, frame - 12), [0, 14], [0, 1], { extrapolateRight: 'clamp' });

  // Expanding glow from dot area
  const glowSize = interpolate(frame, [0, 59], [30, 55], { extrapolateRight: 'clamp' });
  const glowOpacity = interpolate(frame, [0, 20, 59], [0, 0.1, 0.07], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <BackgroundLayer orangeOpacity={0.09} greenOpacity={0.04} greenShow />

      {/* Frame-edge gradient line — fully drawn already */}
      <GradientLine startFrame={-SETTLED} variant="frame-edge" progress={0.5} />

      {/* Bottom glow from dot */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: '42%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${glowSize}%`,
            height: `${glowSize * 0.5}%`,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(201,74,31,0.5) 0%, transparent 65%)`,
            filter: 'blur(40px)',
            opacity: glowOpacity,
          }}
        />
      </AbsoluteFill>

      {/* Particles */}
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <Particle key={i} seed={i + 1} />
        ))}
      </AbsoluteFill>

      {/* Center content — fully settled wordmark */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <Wordmark startFrame={-SETTLED} fontSize={240} color={colors.ink} staggerFrames={0} />

        <AnimatedText
          startFrame={-SETTLED}
          fontSize={26}
          fontWeight={500}
          color={colors.inkMid}
          from="none"
          style={{ marginTop: -8 }}
        >
          Recover what's yours.
        </AnimatedText>
      </AbsoluteFill>

      {/* "revorva.com" at bottom — new in this scene */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 80,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 22,
            fontWeight: 600,
            color: colors.accent,
            opacity: urlOpacity,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          revorva.com →
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
