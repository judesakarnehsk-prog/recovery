import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';

type Direction = 'top' | 'bottom' | 'left' | 'right';

interface SnapTextProps {
  children: React.ReactNode;
  startFrame: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  from?: Direction;
  style?: React.CSSProperties;
  shake?: boolean;
}

export const SnapText: React.FC<SnapTextProps> = ({
  children,
  startFrame,
  fontSize = 80,
  fontWeight = 900,
  color = '#0F0E0C',
  from = 'bottom',
  style,
  shake = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const progress = spring({ fps, frame: lf, config: { damping: 6, stiffness: 200, mass: 0.5 } });
  const opacity = interpolate(Math.min(lf, 4), [0, 4], [0, 1], { extrapolateRight: 'clamp' });

  let tx = 0, ty = 0;
  const dist = 80;
  if (from === 'top')    ty = interpolate(progress, [0, 1], [-dist, 0]);
  if (from === 'bottom') ty = interpolate(progress, [0, 1], [dist, 0]);
  if (from === 'left')   tx = interpolate(progress, [0, 1], [-dist, 0]);
  if (from === 'right')  tx = interpolate(progress, [0, 1], [dist, 0]);

  // Shake on first few frames after landing
  const shakeAmt = shake && lf > 0 && lf < 10
    ? Math.sin(lf * 2.8) * 5 * interpolate(lf, [0, 10], [1, 0], { extrapolateRight: 'clamp' })
    : 0;

  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        color,
        lineHeight: 1.1,
        opacity,
        transform: `translateX(${tx + shakeAmt}px) translateY(${ty}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
