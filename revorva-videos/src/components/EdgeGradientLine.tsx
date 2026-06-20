import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

// Animated gradient line that travels around the frame edges.
// The line "draws" itself continuously using strokeDashoffset.

interface EdgeGradientLineProps {
  opacity?: number;
  speed?: number; // frames per full revolution
}

export const EdgeGradientLine: React.FC<EdgeGradientLineProps> = ({
  opacity = 0.5,
  speed = 300,
}) => {
  const frame = useCurrentFrame();

  // Perimeter of the inner safe rect (inset 20px each side)
  // Width: 1040, Height: 1880 → perimeter = 2*(1040+1880) = 5840
  const W = 1040, H = 1880;
  const perimeter = 2 * (W + H);

  // The "head" of the line travels at `speed` frames per revolution.
  // We draw a segment of ~30% of perimeter as a moving dash.
  const segLen = perimeter * 0.28;
  const offset = -(frame / speed) * perimeter;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <linearGradient id="edgeLineGrad" x1="0%" y1="0%" x2="100%" y2="100%"
            gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C94A1F" stopOpacity="0" />
            <stop offset="30%" stopColor="#C94A1F" stopOpacity="1" />
            <stop offset="70%" stopColor="#E66B3F" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFB088" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect
          x="20" y="20"
          width={W} height={H}
          rx="0"
          fill="none"
          stroke="url(#edgeLineGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${segLen} ${perimeter - segLen}`}
          strokeDashoffset={offset}
        />
      </svg>
    </AbsoluteFill>
  );
};
