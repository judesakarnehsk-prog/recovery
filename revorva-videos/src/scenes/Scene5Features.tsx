import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { MeshGradient } from '../components/MeshGradient';
import { EdgeGradientLine } from '../components/EdgeGradientLine';
import { FeatureCard } from '../components/FeatureCard';

// Scene 5: frames 0–89 (3s local)
// Feature blast — 6 cards rush in from all directions

const FEATURES = [
  { icon: '⚡', title: 'Smart retries',       subtitle: 'Day 0, 3, 7, 14',             from: 'top-left'     as const, delay: 0  },
  { icon: '✨', title: 'AI personalization',  subtitle: 'Each email feels human',       from: 'top-right'    as const, delay: 4  },
  { icon: '🌐', title: 'Custom domain',       subtitle: 'billing@yourdomain.com',       from: 'left'         as const, delay: 8  },
  { icon: '⏸', title: 'Customer control',    subtitle: 'Skip, pause, resume',          from: 'right'        as const, delay: 12 },
  { icon: '📈', title: 'Real-time analytics', subtitle: 'See every recovery live',      from: 'bottom-left'  as const, delay: 16 },
  { icon: '🔒', title: 'Stripe OAuth secure', subtitle: 'Bank-level encryption',        from: 'bottom-right' as const, delay: 20 },
];

export const Scene5Features: React.FC = () => {
  const frame = useCurrentFrame();

  const labelOpacity = interpolate(Math.max(0, frame - 48), [0, 12], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <MeshGradient />
      <EdgeGradientLine opacity={0.35} speed={240} />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: '0 44px',
        }}
      >
        {/* 3 rows of 2 */}
        {[0, 2, 4].map((rowStart) => (
          <div key={rowStart} style={{ display: 'flex', gap: 14, width: '100%' }}>
            {FEATURES.slice(rowStart, rowStart + 2).map((f) => (
              <FeatureCard
                key={f.title}
                icon={f.icon}
                title={f.title}
                subtitle={f.subtitle}
                from={f.from}
                startFrame={f.delay + 4}
              />
            ))}
          </div>
        ))}

        <div style={{ fontFamily, fontSize: 16, fontWeight: 600, color: colors.accent, fontStyle: 'italic', opacity: labelOpacity, marginTop: 4 }}>
          And we're just getting started.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
