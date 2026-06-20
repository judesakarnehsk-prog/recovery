import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { springConfigs } from '../constants/animations';

type Direction = 'left' | 'right' | 'top' | 'bottom' | 'up' | 'none';

interface AnimatedTextProps {
  children: React.ReactNode;
  startFrame: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
  from?: Direction;
  config?: { damping: number; stiffness: number; mass: number };
  distance?: number;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  startFrame,
  fontSize = 32,
  fontWeight = 500,
  color = '#0F0E0C',
  textAlign = 'center',
  style,
  from = 'bottom',
  config = springConfigs.smooth,
  distance = 50,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const progress = spring({ fps, frame: lf, config });
  const opacity = interpolate(Math.min(lf, 10), [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  let tx = 0, ty = 0;
  if (from === 'left')   tx = interpolate(progress, [0, 1], [-distance, 0]);
  if (from === 'right')  tx = interpolate(progress, [0, 1], [distance, 0]);
  if (from === 'top')    ty = interpolate(progress, [0, 1], [-distance, 0]);
  if (from === 'bottom' || from === 'up')
                         ty = interpolate(progress, [0, 1], [distance, 0]);

  const scale = interpolate(progress, [0, 1], [0.97, 1]);
  const blurVal = interpolate(Math.min(lf, 10), [0, 10], [3, 0], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        color,
        textAlign,
        lineHeight: 1.2,
        opacity,
        transform: `translateX(${tx}px) translateY(${ty}px) scale(${scale})`,
        filter: blurVal > 0.2 ? `blur(${blurVal}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
