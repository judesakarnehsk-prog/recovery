import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors } from '../constants/colors';
import { BackgroundLayer } from '../components/BackgroundLayer';

// Scene 3: frames 0–59 (2s local)
// Emptiness. A single dot. Anticipation.

export const Scene3Pause: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Orange orb expands and brightens over the scene
  const orbOpacity = interpolate(frame, [0, 50], [0.08, 0.15], { extrapolateRight: 'clamp' });

  // Tiny dot appears at frame 15
  const dotF = Math.max(0, frame - 15);
  const dotOpacity = interpolate(Math.min(dotF, 10), [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  // Dot pulses once (single spring bounce at frame 20)
  const pulseF = Math.max(0, frame - 20);
  const pulseProgress = spring({ fps, frame: pulseF, config: { damping: 6, stiffness: 80, mass: 1 } });
  const pulseScale = interpolate(pulseProgress, [0, 0.3, 1], [1, 1.4, 1]);

  // Continuous glow breathe after pulse
  const settledF = Math.max(0, frame - 30);
  const glowSize = 10 + 6 * Math.sin(settledF * 0.12);

  return (
    <AbsoluteFill>
      <BackgroundLayer
        orangeX={50}
        orangeY={50}
        orangeOpacity={orbOpacity}
        orangeBlur={120}
        orangeSize={600}
        gridOpacity={0.025}
        gradientAngleStart={178}
        gradientAngleEnd={182}
        gradientDuration={120}
      />

      {/* Single dot at center */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: colors.accent,
            opacity: dotOpacity,
            transform: `scale(${pulseScale})`,
            filter: `drop-shadow(0 0 ${glowSize}px rgba(201,74,31,0.6))`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
