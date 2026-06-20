import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';

interface FallingNumberProps {
  value: string;
  startX: number;   // % from left
  startDelay: number; // frames
  speed: number;    // px per frame
  fontSize: number;
  fontWeight: number;
  opacity: number;
}

export const FallingNumber: React.FC<FallingNumberProps> = ({
  value,
  startX,
  startDelay,
  speed,
  fontSize,
  fontWeight,
  opacity,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startDelay);

  const y = interpolate(localFrame, [0, 120], [-80, 2100], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  // Motion blur proportional to speed
  const blurAmount = speed * 0.35;
  const fadeOpacity = interpolate(localFrame, [0, 6, 100, 120], [0, opacity, opacity, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: `${startX}%`,
        top: 0,
        transform: `translateY(${y}px)`,
        fontFamily,
        fontSize,
        fontWeight,
        color: colors.loss,
        opacity: fadeOpacity,
        filter: `blur(${blurAmount}px) drop-shadow(0 0 12px rgba(220,38,38,0.6))`,
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </div>
  );
};
