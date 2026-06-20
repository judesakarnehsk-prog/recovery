import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { MeshGradient } from '../components/MeshGradient';
import { EdgeGradientLine } from '../components/EdgeGradientLine';
import { SnapText } from '../components/SnapText';

// Scene 8: frames 0–59 (2s local)
// Three words slam in — Stop. Losing. Money.

export const Scene8CTA: React.FC = () => {
  const frame = useCurrentFrame();

  // URL + arrow fades in after words land
  const urlOpacity = interpolate(Math.max(0, frame - 40), [0, 12], [0, 1], { extrapolateRight: 'clamp' });

  // Arrow drawing motion
  const arrowProgress = interpolate(Math.max(0, frame - 44), [0, 16], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <MeshGradient />
      <EdgeGradientLine opacity={0.45} speed={200} />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <SnapText startFrame={4}  fontSize={96} fontWeight={900} color={colors.ink}    from="top"    shake>Stop.</SnapText>
        <SnapText startFrame={10} fontSize={96} fontWeight={900} color={colors.ink}    from="right"  shake>Losing.</SnapText>
        <SnapText
          startFrame={16}
          fontSize={96}
          fontWeight={900}
          from="bottom"
          shake
          style={{
            background: 'linear-gradient(135deg, #C94A1F 0%, #E66B3F 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Money.
        </SnapText>

        {/* CTA */}
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            opacity: urlOpacity,
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: 36,
              fontWeight: 700,
              color: colors.accent,
              filter: `drop-shadow(0 0 20px rgba(201,74,31,0.4))`,
            }}
          >
            revorva.com
          </span>
          {/* Animated arrow */}
          <span
            style={{
              fontFamily,
              fontSize: 36,
              fontWeight: 700,
              color: colors.accent,
              opacity: arrowProgress,
              transform: `translateX(${(1 - arrowProgress) * -16}px)`,
            }}
          >
            →
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
