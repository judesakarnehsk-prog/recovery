import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { springConfigs } from '../constants/animations';
import { FallingNumber } from '../components/FallingNumber';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { NoiseTexture } from '../components/NoiseTexture';

// Scene 2: frames 0–119 (4s local)

const FALLING = [
  { value: '$47',  startX: 4,  delay: 0,  speed: 16, fontSize: 52, fontWeight: 700, opacity: 0.85 },
  { value: '$129', startX: 18, delay: 8,  speed: 20, fontSize: 64, fontWeight: 900, opacity: 0.9 },
  { value: '$83',  startX: 62, delay: 3,  speed: 14, fontSize: 48, fontWeight: 600, opacity: 0.75 },
  { value: '$251', startX: 78, delay: 12, speed: 22, fontSize: 72, fontWeight: 900, opacity: 0.95 },
  { value: '$94',  startX: 38, delay: 5,  speed: 18, fontSize: 56, fontWeight: 700, opacity: 0.8 },
  { value: '$176', startX: 55, delay: 18, speed: 13, fontSize: 60, fontWeight: 800, opacity: 0.85 },
  { value: '$312', startX: 84, delay: 2,  speed: 24, fontSize: 68, fontWeight: 900, opacity: 0.9 },
  { value: '$58',  startX: 28, delay: 14, speed: 17, fontSize: 44, fontWeight: 600, opacity: 0.7 },
];

export const Scene2Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Central "$" sign appears first
  const dollarProgress = spring({ fps, frame, config: springConfigs.burst });
  const dollarOpacity = interpolate(Math.min(frame, 10), [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const dollarScale = interpolate(dollarProgress, [0, 1], [0.4, 1]);
  // fades out at frame 25
  const dollarFadeOut = interpolate(frame, [20, 35], [1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // "This month alone:" label
  const labelProgress = spring({ fps, frame: Math.max(0, frame - 18), config: springConfigs.gentle });
  const labelOpacity = interpolate(Math.min(Math.max(0, frame - 18), 10), [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const labelY = interpolate(labelProgress, [0, 1], [16, 0]);

  // Sub-label below counter
  const subOpacity = interpolate(Math.max(0, frame - 80), [0, 12], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.inkDeep }}>
      <NoiseTexture opacity={0.04} />

      {/* Falling dollar amounts */}
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        {FALLING.map((f, i) => (
          <FallingNumber key={i} {...f} startDelay={f.delay} />
        ))}
      </AbsoluteFill>

      {/* Center content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {/* Big "$" icon */}
        <div
          style={{
            fontFamily,
            fontSize: 200,
            fontWeight: 900,
            color: colors.loss,
            lineHeight: 1,
            opacity: dollarOpacity * dollarFadeOut,
            transform: `scale(${dollarScale})`,
            filter: `drop-shadow(0 0 40px ${colors.loss}88) drop-shadow(0 0 80px ${colors.loss}44)`,
            position: 'absolute',
          }}
        >
          $
        </div>

        {/* Label */}
        <div
          style={{
            fontFamily,
            fontSize: 40,
            fontWeight: 600,
            color: colors.whiteAlpha,
            opacity: labelOpacity,
            transform: `translateY(${labelY}px)`,
            marginBottom: 8,
          }}
        >
          This month alone:
        </div>

        {/* Counter */}
        <AnimatedCounter
          from={0}
          to={5127}
          startFrame={22}
          durationFrames={65}
          fontSize={180}
          fontWeight={900}
          color={colors.loss}
          glowColor={`${colors.loss}88`}
        />

        {/* Sub-label */}
        <div
          style={{
            fontFamily,
            fontSize: 32,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.55)',
            opacity: subOpacity,
            marginTop: 8,
          }}
        >
          lost to failed payments
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
