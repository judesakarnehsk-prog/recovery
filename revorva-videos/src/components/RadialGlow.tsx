import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { springConfigs } from '../constants/animations';

interface RadialGlowProps {
  color: string;
  startFrame?: number;
  startSize?: number;
  endSize?: number;
  maxOpacity?: number;
}

export const RadialGlow: React.FC<RadialGlowProps> = ({
  color,
  startFrame = 0,
  startSize = 0,
  endSize = 200,
  maxOpacity = 0.6,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - startFrame);

  const progress = spring({
    fps,
    frame: localFrame,
    config: springConfigs.burst,
  });

  const size = interpolate(progress, [0, 1], [startSize, endSize]);
  const opacity = interpolate(progress, [0, 0.2, 0.7, 1], [0, maxOpacity, maxOpacity * 0.8, 0]);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: `${size}%`,
          height: `${size}%`,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
          opacity,
          position: 'absolute',
        }}
      />
    </AbsoluteFill>
  );
};
