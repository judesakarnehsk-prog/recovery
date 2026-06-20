import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { springConfigs } from '../constants/animations';
import { MeshGradient } from '../components/MeshGradient';
import { EdgeGradientLine } from '../components/EdgeGradientLine';
import { CursorAnimation } from '../components/CursorAnimation';

// Scene 6: frames 0–89 (3s local)
// Live demo of the pause feature

export const Scene6PauseDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Customer card entrance
  const cardP = spring({ fps, frame, config: springConfigs.impact });
  const cardOpacity = interpolate(Math.min(frame, 10), [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const cardTy = interpolate(cardP, [0, 1], [60, 0]);
  const cardScale = interpolate(cardP, [0, 0.4, 1], [0.85, 1.04, 1]);

  // Click happens at frame 45
  const CLICK_FRAME = 45;
  const clicked = frame >= CLICK_FRAME;

  // Button morphs after click
  const morphP = spring({ fps, frame: Math.max(0, frame - CLICK_FRAME), config: springConfigs.snappy });
  const btnColorProgress = interpolate(morphP, [0, 1], [0, 1]);

  // Status update after click
  const statusOpacity = interpolate(Math.max(0, frame - CLICK_FRAME - 5), [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  // Toast notification at frame 50
  const toastP = spring({ fps, frame: Math.max(0, frame - 50), config: { damping: 9, stiffness: 150, mass: 0.6 } });
  const toastOpacity = interpolate(Math.max(0, frame - 50), [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const toastTy = interpolate(toastP, [0, 1], [-50, 0]);

  const btnBg = clicked
    ? `rgba(${Math.round(201 + (139 - 201) * btnColorProgress)}, ${Math.round(74 + (135 - 74) * btnColorProgress)}, ${Math.round(31 + (128 - 31) * btnColorProgress)}, 0.12)`
    : 'rgba(201,74,31,0.12)';

  return (
    <AbsoluteFill>
      <MeshGradient />
      <EdgeGradientLine opacity={0.35} speed={255} />

      {/* Toast notification */}
      <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 120, pointerEvents: 'none' }}>
        <div
          style={{
            padding: '12px 20px',
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}`,
            boxShadow: `0 8px 24px ${colors.shadow}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            opacity: toastOpacity,
            transform: `translateY(${toastTy}px)`,
          }}
        >
          <span style={{ fontSize: 16 }}>✓</span>
          <div>
            <div style={{ fontFamily, fontSize: 14, fontWeight: 600, color: colors.ink }}>Recovery paused for Lisa Thompson</div>
            <div style={{ fontFamily, fontSize: 12, fontWeight: 400, color: colors.accent }}>Resume anytime from the dashboard</div>
          </div>
        </div>
      </AbsoluteFill>

      {/* Customer card */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 80px',
        }}
      >
        <div
          style={{
            width: 780,
            padding: '40px 44px',
            borderRadius: 28,
            backgroundColor: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.94)',
            boxShadow: `0 16px 48px ${colors.shadow}, 0 4px 12px ${colors.shadowSoft}`,
            opacity: cardOpacity,
            transform: `translateY(${cardTy}px) scale(${cardScale})`,
          }}
        >
          {/* Customer header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.accentSoft}, ${colors.creamDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily, fontSize: 20, fontWeight: 700, color: colors.accent }}>L</div>
            <div>
              <div style={{ fontFamily, fontSize: 22, fontWeight: 700, color: colors.ink }}>Lisa Thompson</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: clicked ? colors.muted : colors.accent, boxShadow: clicked ? 'none' : `0 0 8px ${colors.accent}` }} />
                <span style={{ fontFamily, fontSize: 13, fontWeight: 500, color: clicked ? colors.muted : colors.accent, opacity: clicked ? statusOpacity : 1 }}>
                  {clicked ? 'Paused' : 'Recovery in progress'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32, marginBottom: 32, paddingBottom: 28, borderBottom: `1px solid ${colors.border}` }}>
            <div>
              <div style={{ fontFamily, fontSize: 11, fontWeight: 700, color: colors.muted, letterSpacing: '2px' }}>PENDING</div>
              <div style={{ fontFamily, fontSize: 32, fontWeight: 800, color: colors.ink }}>$899</div>
            </div>
            <div>
              <div style={{ fontFamily, fontSize: 11, fontWeight: 700, color: colors.muted, letterSpacing: '2px' }}>PROGRESS</div>
              <div style={{ fontFamily, fontSize: 32, fontWeight: 800, color: colors.ink }}>Day 7 of 14</div>
            </div>
          </div>

          {/* Pause button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '16px 32px',
              borderRadius: 14,
              backgroundColor: btnBg,
              border: `1.5px solid ${clicked ? colors.muted + '40' : colors.accent + '40'}`,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 18 }}>{clicked ? '⏸' : '▶'}</span>
            <span style={{ fontFamily, fontSize: 16, fontWeight: 700, color: clicked ? colors.muted : colors.accent }}>
              {clicked ? 'Recovery Paused' : 'Pause Recovery'}
            </span>
          </div>
        </div>
      </AbsoluteFill>

      {/* Cursor */}
      <CursorAnimation
        waypoints={[
          { x: 80, y: 80,   frame: 0  },
          { x: 50, y: 73,   frame: 30 },
          { x: 50, y: 73,   frame: 60 },
        ]}
        clickFrame={CLICK_FRAME}
      />
    </AbsoluteFill>
  );
};
