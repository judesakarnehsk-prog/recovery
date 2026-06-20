import React from 'react';
import { AbsoluteFill } from 'remotion';

interface GridPatternProps {
  opacity?: number;
  cellSize?: number;
}

export const GridPattern: React.FC<GridPatternProps> = ({
  opacity = 0.03,
  cellSize = 54,
}) => (
  <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <pattern
          id="launch-grid"
          width={cellSize}
          height={cellSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
            fill="none"
            stroke="#0F0E0C"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#launch-grid)" />
    </svg>
  </AbsoluteFill>
);
