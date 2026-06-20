import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors } from '../constants/colors';
import { MeshGradient } from '../components/MeshGradient';
import { EdgeGradientLine } from '../components/EdgeGradientLine';
import { DashboardMockup } from '../components/DashboardMockup';

// Scene 4: frames 0–89 (3s local)
// Dashboard slams up

export const Scene4Dashboard: React.FC = () => {
  const frame = useCurrentFrame();

  // Green glow behind dashboard
  const glowOpacity = interpolate(Math.min(frame, 30), [0, 30], [0, 0.18], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <MeshGradient />
      <EdgeGradientLine opacity={0.35} speed={260} />

      {/* Green ambient glow */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: '35%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%', height: '55%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${colors.successLight}33 0%, transparent 70%)`,
            filter: 'blur(60px)',
            opacity: glowOpacity,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 40px',
        }}
      >
        <DashboardMockup startFrame={4} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
