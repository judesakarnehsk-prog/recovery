import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { EASE_OUT, FADE_DUR, SCALE_FROM, SCALE_TO } from '../constants/timing';

interface FadeInProps {
  children: React.ReactNode;
  startFrame: number;
  duration?: number;
  scaleFrom?: number;
  style?: React.CSSProperties;
}

// THE only animation pattern: smooth ease-out fade + tiny scale.
// No spring. No overshoot. No bounce. No translate.
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  startFrame,
  duration = FADE_DUR,
  scaleFrom = SCALE_FROM,
  style,
}) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(...EASE_OUT);

  const opacity = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    easing: ease,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(frame, [startFrame, startFrame + duration], [scaleFrom, SCALE_TO], {
    easing: ease,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ opacity, transform: `scale(${scale})`, ...style }}>
      {children}
    </div>
  );
};
