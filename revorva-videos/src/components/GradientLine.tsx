import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

type LineVariant = 'bottom' | 'frame-edge' | 'none';

interface GradientLineProps {
  startFrame?: number;
  variant?: LineVariant;
  progress?: number; // 0–1 override
}

export const GradientLine: React.FC<GradientLineProps> = ({
  startFrame = 0,
  variant = 'bottom',
  progress: progressOverride,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);

  const progress = progressOverride !== undefined
    ? progressOverride
    : spring({ fps, frame: lf, config: { damping: 16, stiffness: 60, mass: 1 } });

  const lineLength = interpolate(progress, [0, 1], [0, 1080]);
  const opacity = interpolate(Math.min(lf, 8), [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  if (variant === 'none') return null;

  if (variant === 'bottom') {
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <svg
          width="1080"
          height="1080"
          style={{ position: 'absolute', inset: 0 }}
          viewBox="0 0 1080 1080"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C94A1F" />
              <stop offset="100%" stopColor="#E66B3F" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1="1072"
            x2={lineLength}
            y2="1072"
            stroke="url(#lineGrad)"
            strokeWidth="3"
            opacity={opacity}
            strokeLinecap="round"
          />
        </svg>
      </AbsoluteFill>
    );
  }

  if (variant === 'frame-edge') {
    // Perimeter: top(1080) + right(1080) + bottom(1080) + left(1080) = 4320
    const perimeter = 4320;
    const drawn = interpolate(progress, [0, 1], [0, perimeter]);
    const dashOffset = perimeter - drawn;

    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <svg
          width="1080"
          height="1080"
          style={{ position: 'absolute', inset: 0 }}
          viewBox="0 0 1080 1080"
        >
          <defs>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C94A1F" />
              <stop offset="100%" stopColor="#E66B3F" />
            </linearGradient>
          </defs>
          <rect
            x="4"
            y="4"
            width="1072"
            height="1072"
            rx="0"
            fill="none"
            stroke="url(#edgeGrad)"
            strokeWidth="2.5"
            strokeDasharray={perimeter}
            strokeDashoffset={dashOffset}
            opacity={opacity * 0.6}
            strokeLinecap="round"
          />
        </svg>
      </AbsoluteFill>
    );
  }

  return null;
};
