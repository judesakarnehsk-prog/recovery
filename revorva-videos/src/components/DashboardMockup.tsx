import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';

import { AnimatedCounter } from './AnimatedCounter';

const ROWS = [
  { initial: 'J', name: 'John D.',   badge: 'recovered $79',  success: true  },
  { initial: 'S', name: 'Sarah M.',  badge: 'recovered $149', success: true  },
  { initial: 'M', name: 'Marcus K.', badge: 'recovery sent',  success: false },
];

interface RowProps {
  initial: string;
  name: string;
  badge: string;
  success: boolean;
  startFrame: number;
}

const ActivityRow: React.FC<RowProps> = ({ initial, name, badge, success, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const progress = spring({ fps, frame: lf, config: { damping: 8, stiffness: 140, mass: 0.6 } });
  const opacity = interpolate(Math.min(lf, 6), [0, 6], [0, 1], { extrapolateRight: 'clamp' });
  const tx = interpolate(progress, [0, 1], [50, 0]);
  const scale = interpolate(progress, [0, 0.4, 1], [0.9, 1.04, 1]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${colors.border}`, opacity, transform: `translateX(${tx}px) scale(${scale})` }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.creamLight}, ${colors.creamDark})`, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily, fontSize: 12, fontWeight: 700, color: colors.inkMid, flexShrink: 0 }}>{initial}</div>
      <div style={{ flex: 1, fontFamily, fontSize: 15, fontWeight: 600, color: colors.ink }}>{name}</div>
      <div style={{ padding: '4px 12px', borderRadius: 999, backgroundColor: success ? colors.successSoft : colors.accentSoft, fontFamily, fontSize: 13, fontWeight: 600, color: success ? colors.success : colors.accent, whiteSpace: 'nowrap' }}>{badge}</div>
    </div>
  );
};

interface DashboardMockupProps {
  startFrame?: number;
}

export const DashboardMockup: React.FC<DashboardMockupProps> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const progress = spring({ fps, frame: lf, config: { damping: 8, stiffness: 120, mass: 0.8 } });
  const opacity = interpolate(Math.min(lf, 12), [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const ty = interpolate(progress, [0, 1], [120, 0]);
  const scale = interpolate(progress, [0, 0.4, 1], [0.82, 1.04, 1.0]);
  const bob = Math.sin((frame / 30) * 2 * Math.PI / 4) * 5;

  return (
    <div
      style={{
        width: 860,
        opacity,
        transform: `translateY(${ty + bob}px) scale(${scale}) perspective(1200px) rotateX(12deg) rotateY(-10deg)`,
      }}
    >
      <div
        style={{
          padding: '28px 32px',
          borderRadius: 24,
          backgroundColor: 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.95)',
          boxShadow: `0 40px 80px ${colors.shadow}, 0 8px 24px ${colors.shadowSoft}, 0 80px 100px rgba(201,74,31,0.06)`,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontFamily, fontSize: 18, fontWeight: 900, color: colors.ink, letterSpacing: '-0.5px' }}>revorva</span>
            <span style={{ fontFamily, fontSize: 18, fontWeight: 900, color: colors.accent }}>.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: colors.successLight, boxShadow: `0 0 8px ${colors.successLight}` }} />
            <span style={{ fontFamily, fontSize: 12, fontWeight: 600, color: colors.success }}>Live</span>
          </div>
        </div>

        {/* Hero stat */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily, fontSize: 10, fontWeight: 700, color: colors.muted, letterSpacing: '2.5px', marginBottom: 4 }}>RECOVERED</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <AnimatedCounter to={8247} startFrame={startFrame + 8} durationFrames={30} fontSize={52} fontWeight={800} color={colors.success} prefix="$" glowColor={`${colors.successLight}44`} />
            <span style={{ fontFamily, fontSize: 14, fontWeight: 600, color: colors.success }}>+$2,847 today</span>
          </div>
        </div>

        {/* Activity */}
        <div style={{ fontFamily, fontSize: 10, fontWeight: 700, color: colors.muted, letterSpacing: '2px', marginBottom: 4 }}>RECENT</div>
        {ROWS.map((r, i) => (
          <ActivityRow key={r.name} {...r} startFrame={startFrame + 20 + i * 5} />
        ))}
      </div>
    </div>
  );
};
