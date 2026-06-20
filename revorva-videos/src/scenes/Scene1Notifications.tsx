import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { MeshGradient } from '../components/MeshGradient';
import { EdgeGradientLine } from '../components/EdgeGradientLine';
import { StripeNotification } from '../components/StripeNotification';

// Scene 1: frames 0–59 (2s local)
// Notification stack slides in — "this is overwhelming"

const NOTIFS = [
  { title: 'Payment Failed', subtitle: '$2,400 — Sarah Mitchell', startFrame: 4  },
  { title: 'Payment Failed', subtitle: '$847 — David Park',       startFrame: 18 },
  { title: 'Payment Failed', subtitle: '$1,200 — Lisa Thompson',  startFrame: 30 },
];

export const Scene1Notifications: React.FC = () => {
  const frame = useCurrentFrame();

  // Stack shakes together at frame 45
  const shakeAmt = frame >= 45 && frame < 55
    ? Math.sin((frame - 45) * 3.2) * 6 * interpolate(frame - 45, [0, 10], [1, 0], { extrapolateRight: 'clamp' })
    : 0;

  return (
    <AbsoluteFill>
      <MeshGradient />
      <EdgeGradientLine opacity={0.35} speed={280} />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: '0 80px',
          transform: `translateX(${shakeAmt}px)`,
        }}
      >
        {NOTIFS.map((n, i) => (
          <StripeNotification
            key={i}
            title={n.title}
            subtitle={n.subtitle}
            startFrame={n.startFrame}
            shake={i === 0}
          />
        ))}

        {/* +24 more badge */}
        {frame >= 42 && (
          <StripeNotification
            title=""
            subtitle=""
            badge="+24 more payment failures"
            startFrame={42}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
