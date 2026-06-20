import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors } from '../constants/colors';
import { MeshGradient } from '../components/MeshGradient';
import { EdgeGradientLine } from '../components/EdgeGradientLine';
import { Wordmark } from '../components/Wordmark';
import { SnapText } from '../components/SnapText';

// Scene 3: frames 0–59 (2s local)
// The pivot — revorva slams in

export const Scene3Pivot: React.FC = () => {
  const frame = useCurrentFrame();

  // Orange flash at frame 0 (transition from red to orange)
  const orangeFlash = interpolate(frame, [0, 1, 5], [1, 1, 0], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
  });

  // Camera shake on impact (when wordmark lands ~frame 12)
  const impactShake = frame >= 10 && frame < 22
    ? Math.sin((frame - 10) * 3.8) * 7 * interpolate(frame - 10, [0, 12], [1, 0], { extrapolateRight: 'clamp' })
    : 0;

  // Particles exploding from dot area — appear frame 14-35
  const particles = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const pf = Math.max(0, frame - 13);
    const dist = pf * (2.5 + i * 0.4);
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist;
    const pOpacity = interpolate(pf, [0, 4, 20, 28], [0, 0.9, 0.6, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const pSize = 4 + (i % 3) * 2;
    return { px, py, pOpacity, pSize };
  });

  return (
    <AbsoluteFill>
      <MeshGradient />
      <EdgeGradientLine opacity={0.4} speed={250} />

      {/* Orange flash */}
      <AbsoluteFill style={{ backgroundColor: colors.accent, opacity: orangeFlash, pointerEvents: 'none' }} />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          transform: `translateX(${impactShake}px)`,
        }}
      >
        <Wordmark startFrame={4} fontSize={180} color={colors.ink} staggerFrames={1} />

        {/* Particles around dot — dot is roughly at center+right of wordmark */}
        <div style={{ position: 'absolute', top: '50%', left: '62%', pointerEvents: 'none' }}>
          {particles.map((p, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: p.pSize,
                height: p.pSize,
                borderRadius: '50%',
                backgroundColor: colors.accent,
                left: p.px,
                top: p.py,
                opacity: p.pOpacity,
                filter: 'blur(0.5px)',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        <SnapText startFrame={20} fontSize={36} fontWeight={700} color={colors.ink} from="bottom" shake>
          Stops the bleeding.
        </SnapText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
