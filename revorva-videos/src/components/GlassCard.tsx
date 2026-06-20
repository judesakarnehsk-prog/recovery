import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors } from '../constants/colors';
import { springConfigs } from '../constants/animations';

interface GlassCardProps {
  children: React.ReactNode;
  startFrame?: number;
  slideFrom?: 'left' | 'right' | 'bottom';
  width?: number;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  startFrame = 0,
  slideFrom = 'bottom',
  width = 800,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  const progress = spring({ fps, frame: localFrame, config: springConfigs.smart });

  const opacity = interpolate(Math.min(localFrame, 10), [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(progress, [0, 1], [0.95, 1]);

  let tx = 0;
  let ty = 0;
  if (slideFrom === 'left') tx = interpolate(progress, [0, 1], [-60, 0]);
  if (slideFrom === 'right') tx = interpolate(progress, [0, 1], [60, 0]);
  if (slideFrom === 'bottom') ty = interpolate(progress, [0, 1], [40, 0]);

  return (
    <div
      style={{
        width,
        padding: '40px',
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.70)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid rgba(255,255,255,0.90)`,
        boxShadow: `0 8px 24px ${colors.shadowSoft}, 0 2px 8px ${colors.shadow}`,
        opacity,
        transform: `translateX(${tx}px) translateY(${ty}px) scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
