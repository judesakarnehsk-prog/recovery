import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';

interface ImpactStatProps {
  value: string;
  label: string;
  sub?: string;
  valueColor?: string;
  startFrame?: number;
  gradient?: boolean;
}

export const ImpactStat: React.FC<ImpactStatProps> = ({
  value,
  label,
  sub,
  valueColor = colors.ink,
  startFrame = 0,
  gradient = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const progress = spring({ fps, frame: lf, config: { damping: 7, stiffness: 160, mass: 0.6 } });
  const opacity = interpolate(Math.min(lf, 6), [0, 6], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(progress, [0, 0.4, 1], [0.6, 1.08, 1.0]);
  const ty = interpolate(progress, [0, 1], [60, 0]);

  const gradStyle: React.CSSProperties = gradient ? {
    background: 'linear-gradient(135deg, #C94A1F 0%, #E66B3F 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  } : {};

  return (
    <div
      style={{
        width: 780,
        padding: '48px 56px',
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.90)',
        boxShadow: `0 24px 60px ${colors.shadow}, 0 4px 16px ${colors.shadowSoft}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        opacity,
        transform: `translateY(${ty}px) scale(${scale})`,
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: 160,
          fontWeight: 900,
          lineHeight: 1,
          color: gradient ? undefined : valueColor,
          ...gradStyle,
        }}
      >
        {value}
      </div>
      <div style={{ fontFamily, fontSize: 28, fontWeight: 700, color: colors.ink }}>{label}</div>
      {sub && (
        <div style={{ fontFamily, fontSize: 16, fontWeight: 500, color: colors.muted }}>{sub}</div>
      )}
    </div>
  );
};
