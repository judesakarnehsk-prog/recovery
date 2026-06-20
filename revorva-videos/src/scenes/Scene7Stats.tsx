import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors } from '../constants/colors';
import { MeshGradient } from '../components/MeshGradient';
import { EdgeGradientLine } from '../components/EdgeGradientLine';
import { ImpactStat } from '../components/ImpactStat';


// Scene 7: frames 0–89 (3s local)
// Three rapid-fire stats, each ~30 frames

export const Scene7Stats: React.FC = () => {
  const frame = useCurrentFrame();

  // Black flash at frame 0
  const blackFlash = interpolate(frame, [0, 2, 4], [1, 1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  const showStat1 = frame >= 2 && frame < 32;
  const showStat2 = frame >= 30 && frame < 62;
  const showStat3 = frame >= 60;

  // Stat 2 exit
  const stat2Exit = frame >= 58 ? interpolate(frame, [58, 62], [1, 0], { extrapolateRight: 'clamp' }) : 1;
  const stat1Exit = frame >= 28 ? interpolate(frame, [28, 32], [1, 0], { extrapolateRight: 'clamp' }) : 1;

  return (
    <AbsoluteFill>
      <MeshGradient />
      <EdgeGradientLine opacity={0.4} speed={220} />

      {/* Black flash */}
      <AbsoluteFill style={{ backgroundColor: '#000', opacity: blackFlash, pointerEvents: 'none' }} />

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {showStat1 && (
          <div style={{ opacity: stat1Exit }}>
            <ImpactStat
              value="70%"
              label="Recovery rate"
              sub="vs 30% industry average"
              gradient
              startFrame={2}
            />
          </div>
        )}

        {showStat2 && (
          <div style={{ opacity: stat2Exit, position: 'absolute' }}>
            <ImpactStat
              value="$29"
              label="Starting per month"
              sub={undefined}
              valueColor={colors.ink}
              startFrame={30}
            />
          </div>
        )}

        {showStat3 && (
          <div style={{ position: 'absolute' }}>
            <ImpactStat
              value="2 min"
              label="Setup time"
              sub="Connect Stripe, done."
              valueColor={colors.accent}
              startFrame={60}
            />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
