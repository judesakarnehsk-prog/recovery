import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { springConfigs } from '../constants/animations';

interface AnimatedNumberProps {
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
  decimals?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  from = 0,
  to,
  startFrame = 0,
  durationFrames = 60,
  fontSize = 96,
  fontWeight = 900,
  color = '#0F0E0C',
  prefix = '',
  suffix = '',
  gradientText = false,
  decimals = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const tickEnd = durationFrames * 0.82;

  const tick = interpolate(Math.min(lf, tickEnd), [0, tickEnd], [from, to], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  const lockProgress = spring({ fps, frame: Math.max(0, lf - tickEnd), config: springConfigs.snappy });
  const val = lf > tickEnd
    ? Math.min(from + (to - from) * Math.min(lockProgress + 0.95, 1), to)
    : tick;

  const scale = lf > tickEnd ? interpolate(lockProgress, [0, 0.5, 1], [0.95, 1.02, 1]) : 1;
  const opacity = interpolate(Math.min(lf, 8), [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();

  const gradStyle: React.CSSProperties = gradientText
    ? {
        background: 'linear-gradient(135deg, #C94A1F, #E66B3F)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }
    : {};

  return (
    <span
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        color: gradientText ? undefined : color,
        display: 'inline-block',
        opacity,
        transform: `scale(${scale})`,
        lineHeight: 1,
        ...gradStyle,
      }}
    >
      {prefix}{display}{suffix}
    </span>
  );
};
