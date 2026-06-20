import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { springConfigs } from '../constants/animations';
import { BackgroundLayer } from '../components/BackgroundLayer';
import { AnimatedText } from '../components/AnimatedText';
import { Wordmark } from '../components/Wordmark';

// Scene 3: 0–89 (3s local)

export const Scene3Shift: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Orange circle entrance
  const circleProgress = spring({ fps, frame, config: springConfigs.burst });
  const circleScale = interpolate(circleProgress, [0, 1], [0, 1]);
  const circleOpacity = interpolate(Math.min(frame, 8), [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  // Circle pulse (once, around frame 18)
  const pulseFrame = Math.max(0, frame - 15);
  const pulseProgress = spring({ fps, frame: pulseFrame, config: { damping: 6, stiffness: 80, mass: 1 } });
  const pulseScale = interpolate(pulseProgress, [0, 0.35, 1], [1, 1.18, 1]);

  // "Meet" label — appears frame 22
  // Wordmark — appears frame 30
  // Tagline — appears after wordmark letters + dot (~frame 30 + 7*2 + 8 + 8 = ~64)
  const wordmarkStart = 30;
  const taglineStart = wordmarkStart + 7 * 2 + 16;

  return (
    <AbsoluteFill>
      <BackgroundLayer
        orangeX={50}
        orangeY={50}
        orangeOpacity={0.12}
        orangeBlur={90}
        greenX={72}
        greenY={22}
        greenOpacity={0.07}
        greenShow
        gridOpacity={0.035}
        gradientAngleStart={172}
        gradientAngleEnd={180}
        gradientDuration={90}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        {/* "Meet" label above */}
        <AnimatedText
          startFrame={22}
          fontSize={32}
          fontWeight={500}
          color={colors.muted}
          style={{ marginBottom: 0 }}
        >
          Meet
        </AnimatedText>

        {/* Orange circle */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: `radial-gradient(circle at 38% 38%, ${colors.accentLight}, ${colors.accent})`,
            boxShadow: `0 0 30px rgba(201,74,31,0.35), 0 0 60px rgba(201,74,31,0.15)`,
            opacity: circleOpacity,
            transform: `scale(${circleScale * pulseScale})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          {/* Stylized R */}
          <span
            style={{
              fontFamily,
              fontSize: 26,
              fontWeight: 800,
              color: 'white',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            R
          </span>
        </div>

        {/* Wordmark */}
        <Wordmark startFrame={wordmarkStart} fontSize={140} color={colors.ink} staggerFrames={2} />

        {/* Tagline */}
        <AnimatedText
          startFrame={taglineStart}
          fontSize={28}
          fontWeight={500}
          color={colors.inkMid}
          style={{ marginTop: 8 }}
        >
          Recover what's yours, automatically.
        </AnimatedText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
