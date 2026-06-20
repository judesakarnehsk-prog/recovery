import React from 'react';
import { AbsoluteFill } from 'remotion';

interface NoiseTextureProps {
  opacity?: number;
}

export const NoiseTexture: React.FC<NoiseTextureProps> = ({ opacity = 0.04 }) => {
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <filter id="noise-cinematic">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-cinematic)" />
      </svg>
    </AbsoluteFill>
  );
};
