import React from 'react';
import { AbsoluteFill } from 'remotion';

interface FilmGrainProps {
  opacity?: number;
}

export const FilmGrain: React.FC<FilmGrainProps> = ({ opacity = 0.03 }) => (
  <AbsoluteFill style={{ opacity, pointerEvents: 'none', mixBlendMode: 'multiply' }}>
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
      <filter id="film-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.72"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#film-grain)" />
    </svg>
  </AbsoluteFill>
);
