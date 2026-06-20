import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';

interface StripeNotificationProps {
  title: string;
  subtitle: string;
  badge?: string;
  startFrame?: number;
  shake?: boolean;
}

export const StripeNotification: React.FC<StripeNotificationProps> = ({
  title,
  subtitle,
  badge,
  startFrame = 0,
  shake = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const progress = spring({ fps, frame: lf, config: { damping: 10, stiffness: 160, mass: 0.7 } });
  const opacity = interpolate(Math.min(lf, 6), [0, 6], [0, 1], { extrapolateRight: 'clamp' });
  const ty = interpolate(progress, [0, 1], [-90, 0]);

  // Haptic shake after landing
  const shakeAmt = shake && lf > 8 && lf < 18
    ? Math.sin((lf - 8) * 3.5) * 4 * interpolate(lf - 8, [0, 10], [1, 0], { extrapolateRight: 'clamp' })
    : 0;

  if (badge) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 20px',
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${colors.border}`,
          boxShadow: `0 4px 16px ${colors.shadow}`,
          opacity,
          transform: `translateY(${ty}px) translateX(${shakeAmt}px)`,
        }}
      >
        <span style={{ fontFamily, fontSize: 15, fontWeight: 700, color: colors.muted }}>{badge}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 700,
        padding: '18px 22px',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid rgba(255,255,255,0.92)`,
        boxShadow: `0 8px 32px ${colors.shadow}, 0 2px 8px ${colors.shadowSoft}`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        opacity,
        transform: `translateY(${ty}px) translateX(${shakeAmt}px)`,
      }}
    >
      {/* App icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `linear-gradient(135deg, #635BFF, #7A73FF)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>S</span>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontFamily, fontSize: 13, fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>STRIPE</span>
          <span style={{ fontFamily, fontSize: 12, fontWeight: 400, color: colors.muted }}>now</span>
        </div>
        <div style={{ fontFamily, fontSize: 17, fontWeight: 700, color: colors.loss }}>{title}</div>
        <div style={{ fontFamily, fontSize: 15, fontWeight: 500, color: colors.inkMid, marginTop: 2 }}>{subtitle}</div>
      </div>
    </div>
  );
};
