import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';

type Direction = 'top-left' | 'top-right' | 'left' | 'right' | 'bottom-left' | 'bottom-right';

interface FeatureCardProps {
  icon: string;
  title: string;
  subtitle: string;
  startFrame?: number;
  from?: Direction;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  subtitle,
  startFrame = 0,
  from = 'left',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const progress = spring({ fps, frame: lf, config: { damping: 9, stiffness: 140, mass: 0.6 } });
  const opacity = interpolate(Math.min(lf, 8), [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(progress, [0, 0.5, 1], [0.8, 1.05, 1.0]);

  const dist = 60;
  let tx = 0, ty = 0;
  if (from === 'top-left')     { tx = -dist; ty = -dist; }
  if (from === 'top-right')    { tx =  dist; ty = -dist; }
  if (from === 'left')         { tx = -dist; }
  if (from === 'right')        { tx =  dist; }
  if (from === 'bottom-left')  { tx = -dist; ty =  dist; }
  if (from === 'bottom-right') { tx =  dist; ty =  dist; }

  const enterTx = interpolate(progress, [0, 1], [tx, 0]);
  const enterTy = interpolate(progress, [0, 1], [ty, 0]);

  return (
    <div
      style={{
        padding: '22px 20px',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.92)',
        boxShadow: `0 8px 24px ${colors.shadow}, 0 2px 6px ${colors.shadowSoft}`,
        opacity,
        transform: `translateX(${enterTx}px) translateY(${enterTy}px) scale(${scale})`,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        flex: 1,
      }}
    >
      <div style={{ fontSize: 26 }}>{icon}</div>
      <div style={{ fontFamily, fontSize: 16, fontWeight: 700, color: colors.ink, lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontFamily, fontSize: 12, fontWeight: 500, color: colors.muted, lineHeight: 1.35 }}>{subtitle}</div>
    </div>
  );
};
