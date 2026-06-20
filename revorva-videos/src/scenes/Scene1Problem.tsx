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
import { GradientBackground } from '../components/GradientBackground';

const PARTICLES_COUNT = 18;

const RedParticle: React.FC<{ seed: number }> = ({ seed }) => {
  const frame = useCurrentFrame();
  const x = ((seed * 137.5) % 100);
  const startY = ((seed * 73.1) % 30);
  const speed = 0.3 + (seed % 5) * 0.1;
  const size = 3 + (seed % 4);
  const delay = (seed * 17) % 40;

  const localFrame = Math.max(0, frame - delay);
  const y = startY + localFrame * speed;
  const opacity = 0.08 + (seed % 3) * 0.04;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y % 110}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: colors.loss,
        opacity,
      }}
    />
  );
};

const WordFadeIn: React.FC<{
  text: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  startFrame: number;
  glow?: boolean;
}> = ({ text, fontSize, fontWeight, color, startFrame, glow }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - startFrame);

  const progress = spring({
    fps,
    frame: localFrame,
    config: { damping: 20, stiffness: 100, mass: 0.8 },
  });

  const opacity = interpolate(Math.min(localFrame, 8), [0, 8], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const translateY = interpolate(progress, [0, 1], [24, 0]);

  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        color,
        lineHeight: 1.1,
        opacity,
        transform: `translateY(${translateY}px)`,
        textShadow: glow ? `0 0 40px ${colors.loss}88, 0 0 80px ${colors.loss}44` : undefined,
      }}
    >
      {text}
    </div>
  );
};

// Ticking counter for Scene 1
const TickingNumber: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - startFrame);
  const durationFrames = 75; // ~2.5s of ticking

  const tickValue = interpolate(
    Math.min(localFrame, durationFrames * 0.7),
    [0, durationFrames * 0.7],
    [200, 1247],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const bounce = spring({
    fps,
    frame: Math.max(0, localFrame - durationFrames * 0.7),
    config: { damping: 12, stiffness: 120, mass: 0.6 },
  });

  const finalValue = localFrame > durationFrames * 0.7
    ? 1247
    : Math.round(tickValue);

  const scale = localFrame > durationFrames * 0.7
    ? interpolate(bounce, [0, 1], [0.92, 1])
    : 1;

  const opacity = interpolate(Math.min(localFrame, 8), [0, 8], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        fontFamily,
        fontSize: 140,
        fontWeight: 900,
        color: colors.loss,
        lineHeight: 1,
        opacity,
        transform: `scale(${scale})`,
        textShadow: `0 0 60px ${colors.loss}66, 0 0 120px ${colors.loss}33`,
      }}
    >
      ${finalValue.toLocaleString()}
    </div>
  );
};

export const Scene1Problem: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientBackground
        startColor={colors.cream}
        endColor="#EFEBE3"
        angleStart={145}
        angleEnd={152}
        animDuration={90}
      />

      {/* Falling red particles */}
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        {Array.from({ length: PARTICLES_COUNT }, (_, i) => (
          <RedParticle key={i} seed={i + 1} />
        ))}
      </AbsoluteFill>

      {/* Text content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '0 80px',
        }}
      >
        <WordFadeIn
          text="Every month"
          fontSize={96}
          fontWeight={700}
          color={colors.ink}
          startFrame={5}
        />
        <WordFadeIn
          text="you're losing"
          fontSize={96}
          fontWeight={700}
          color={colors.ink}
          startFrame={14}
        />

        <div style={{ marginTop: 16 }}>
          <TickingNumber startFrame={24} />
        </div>

        <WordFadeIn
          text="to failed payments"
          fontSize={32}
          fontWeight={500}
          color={colors.muted}
          startFrame={36}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
