import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface CursorAnimationProps {
  // Path: array of [x%, y%, frameArrival]
  waypoints: Array<{ x: number; y: number; frame: number }>;
  clickFrame?: number;
}

export const CursorAnimation: React.FC<CursorAnimationProps> = ({
  waypoints,
  clickFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find current segment
  let x = waypoints[0].x;
  let y = waypoints[0].y;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      const seg = (frame - a.frame) / (b.frame - a.frame);
      x = a.x + (b.x - a.x) * seg;
      y = a.y + (b.y - a.y) * seg;
    }
    if (frame > b.frame) {
      x = b.x;
      y = b.y;
    }
  }

  // Click ripple
  const isClicking = clickFrame !== undefined && frame >= clickFrame && frame < clickFrame + 20;
  const clickLf = clickFrame !== undefined ? Math.max(0, frame - clickFrame) : 0;
  const clickP = spring({ fps, frame: clickLf, config: { damping: 8, stiffness: 200, mass: 0.4 } });
  const clickScale = isClicking ? interpolate(clickP, [0, 0.3, 1], [0.85, 1.15, 1.0]) : 1;
  const rippleScale = interpolate(clickLf, [0, 20], [0, 2.5], { extrapolateRight: 'clamp' });
  const rippleOpacity = interpolate(clickLf, [0, 5, 20], [0, 0.5, 0], { extrapolateRight: 'clamp' });

  const opacity = interpolate(Math.min(frame - waypoints[0].frame, 8), [0, 8], [0, 1], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        opacity,
        zIndex: 100,
      }}
    >
      {/* Ripple */}
      {isClicking && (
        <div
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '2px solid rgba(201,74,31,0.6)',
            transform: `translate(-50%, -50%) scale(${rippleScale})`,
            opacity: rippleOpacity,
            left: '50%',
            top: '50%',
          }}
        />
      )}
      {/* Cursor arrow */}
      <svg
        width="28"
        height="32"
        viewBox="0 0 28 32"
        style={{ transform: `scale(${clickScale})`, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
      >
        <path
          d="M4 2 L4 24 L10 18 L15 28 L18 26.5 L13 16.5 L22 16.5 Z"
          fill="#0F0E0C"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
