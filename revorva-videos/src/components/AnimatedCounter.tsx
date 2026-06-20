import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { springConfigs } from '../constants/animations';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  startFrame?: number;
  durationFrames?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  prefix?: string;
  suffix?: string;
  gradientText?: boolean;
  glowColor?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from = 0,
  to,
  startFrame = 0,
  durationFrames = 45,
  fontSize = 160,
  fontWeight = 900,
  color = '#0F0E0C',
  prefix = '',
  suffix = '',
  gradientText = false,
  glowColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);

  // Rapid tick then spring lock
  const tickEnd = durationFrames * 0.78;
  const tick = interpolate(Math.min(lf, tickEnd), [0, tickEnd], [from, to], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
  });
  const lockP = spring({ fps, frame: Math.max(0, lf - tickEnd), config: springConfigs.impact });
  const val = lf > tickEnd
    ? Math.min(from + (to - from) * Math.min(lockP + 0.92, 1), to)
    : tick;

  // Bounce on each integer change
  const bounceF = (val - Math.floor(val));
  const scaleBounce = 1 + Math.sin(bounceF * Math.PI) * 0.02;

  // Lock bounce
  const lockScale = lf > tickEnd
    ? interpolate(lockP, [0, 0.3, 1], [0.9, 1.06, 1])
    : scaleBounce;

  const opacity = interpolate(Math.min(lf, 6), [0, 6], [0, 1], { extrapolateRight: 'clamp' });
  const display = Math.round(val).toLocaleString();

  const gradStyle: React.CSSProperties = gradientText ? {
    background: 'linear-gradient(135deg, #C94A1F 0%, #E66B3F 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  } : {};

  return (
    <span
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        color: gradientText ? undefined : color,
        display: 'inline-block',
        opacity,
        transform: `scale(${lockScale})`,
        lineHeight: 1,
        filter: glowColor ? `drop-shadow(0 0 30px ${glowColor}) drop-shadow(0 0 60px ${glowColor}88)` : undefined,
        ...gradStyle,
      }}
    >
      {prefix}{display}{suffix}
    </span>
  );
};
