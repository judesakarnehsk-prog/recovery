import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { springConfigs } from '../constants/animations';

interface StatCardProps {
  big: string;
  bigGradient?: boolean;
  bigColor?: string;
  label: string;
  source?: string;
  accent?: string;
  startFrame?: number;
  from?: 'top' | 'bottom' | 'left' | 'right';
}

export const StatCard: React.FC<StatCardProps> = ({
  big,
  bigGradient,
  bigColor,
  label,
  source,
  accent,
  startFrame = 0,
  from = 'top',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const progress = spring({ fps, frame: lf, config: springConfigs.smooth });
  const opacity = interpolate(Math.min(lf, 12), [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(progress, [0, 1], [0.95, 1]);

  let tx = 0, ty = 0;
  if (from === 'top')    ty = interpolate(progress, [0, 1], [-80, 0]);
  if (from === 'bottom') ty = interpolate(progress, [0, 1], [80, 0]);
  if (from === 'left')   tx = interpolate(progress, [0, 1], [-80, 0]);
  if (from === 'right')  tx = interpolate(progress, [0, 1], [80, 0]);

  const gradStyle: React.CSSProperties = bigGradient
    ? {
        background: 'linear-gradient(135deg, #C94A1F, #E66B3F)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }
    : {};

  return (
    <div
      style={{
        width: 800,
        padding: '48px 56px',
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.90)',
        boxShadow: `0 8px 32px ${colors.shadow}, 0 2px 8px ${colors.shadowSoft}`,
        opacity,
        transform: `translateX(${tx}px) translateY(${ty}px) scale(${scale})`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: 120,
          fontWeight: 900,
          lineHeight: 1,
          color: bigGradient ? undefined : (bigColor ?? colors.ink),
          ...gradStyle,
        }}
      >
        {big}
      </div>
      <div style={{ fontFamily, fontSize: 24, fontWeight: 500, color: colors.ink, lineHeight: 1.3 }}>
        {label}
      </div>
      {source && (
        <div style={{ fontFamily, fontSize: 13, fontWeight: 400, color: colors.muted }}>
          {source}
        </div>
      )}
      {accent && (
        <div style={{ fontFamily, fontSize: 16, fontWeight: 400, color: colors.accent, fontStyle: 'italic' }}>
          {accent}
        </div>
      )}
    </div>
  );
};
