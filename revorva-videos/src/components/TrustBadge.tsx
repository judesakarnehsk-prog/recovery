import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';

interface TrustBadgeProps {
  text: string;
  startFrame?: number;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ text, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const progress = spring({ fps, frame: lf, config: { damping: 14, stiffness: 90, mass: 1 } });
  const opacity = interpolate(Math.min(lf, 10), [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const ty = interpolate(progress, [0, 1], [16, 0]);
  const scale = interpolate(progress, [0, 1], [0.92, 1]);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 18px',
        borderRadius: 999,
        backgroundColor: colors.successSoft,
        border: `1px solid rgba(26,122,64,0.15)`,
        opacity,
        transform: `translateY(${ty}px) scale(${scale})`,
      }}
    >
      <span style={{ color: colors.success, fontSize: 14, fontWeight: 700 }}>✓</span>
      <span style={{ fontFamily, fontSize: 14, fontWeight: 500, color: colors.success }}>
        {text}
      </span>
    </div>
  );
};
