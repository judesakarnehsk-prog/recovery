import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

interface GradientBackgroundProps {
  startColor?: string;
  endColor?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  angleStart?: number;
  angleEnd?: number;
  animDuration?: number;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  startColor = '#F5F2EC',
  endColor = '#EFEBE3',
  overlayColor,
  overlayOpacity = 0,
  angleStart = 145,
  angleEnd = 155,
  animDuration = 90,
}) => {
  const frame = useCurrentFrame();

  const angle = interpolate(frame, [0, animDuration], [angleStart, angleEnd], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(${angle}deg, ${startColor} 0%, ${endColor} 50%, ${startColor} 100%)`,
        }}
      />
      {overlayColor && overlayOpacity > 0 && (
        <AbsoluteFill
          style={{
            background: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
