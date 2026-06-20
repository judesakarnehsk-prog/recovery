import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { BackgroundLayer } from '../components/BackgroundLayer';

// Scene 1: frames 0–89 (3s local via Sequence)
// A single line draws itself, then a small label fades in below.

export const Scene1Whisper: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Line draws left → right over ~36 frames (1.2s)
  const lineProgress = spring({ fps, frame, config: { damping: 16, stiffness: 60, mass: 1 } });
  const lineWidth = interpolate(lineProgress, [0, 1], [0, 320]);
  const lineOpacity = interpolate(Math.min(frame, 8), [0, 8], [0, 0.8], { extrapolateRight: 'clamp' });

  // Label fades in after line is done (~frame 40)
  const labelF = Math.max(0, frame - 40);
  const labelProgress = spring({ fps, frame: labelF, config: { damping: 14, stiffness: 80, mass: 1 } });
  const labelOpacity = interpolate(Math.min(labelF, 10), [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const labelY = interpolate(labelProgress, [0, 1], [12, 0]);

  return (
    <AbsoluteFill>
      <BackgroundLayer
        orangeX={20}
        orangeY={18}
        orangeOpacity={0.06}
        orangeBlur={160}
        orangeSize={650}
        gridOpacity={0.03}
        gradientAngleStart={175}
        gradientAngleEnd={180}
        gradientDuration={180}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        {/* Thin horizontal line */}
        <div
          style={{
            width: lineWidth,
            height: 2,
            backgroundColor: colors.inkMid,
            opacity: lineOpacity,
            borderRadius: 1,
          }}
        />

        {/* Label */}
        <div
          style={{
            fontFamily,
            fontSize: 20,
            fontWeight: 700,
            color: colors.accent,
            letterSpacing: '8px',
            textTransform: 'uppercase',
            opacity: labelOpacity,
            transform: `translateY(${labelY}px)`,
          }}
        >
          A New Standard
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
