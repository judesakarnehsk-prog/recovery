import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { springConfigs, STAGGER } from '../constants/animations';
import { Wordmark } from '../components/Wordmark';

// Scene 6: frames 0–89 (3s local)

export const Scene6Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in background
  const bgOpacity = interpolate(Math.min(frame, 10), [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  // Wordmark starts at frame 5
  const WORDMARK_START = 5;
  // "revorva" has 7 letters × 2 frames stagger + 3 for dot = ~20 frames total
  const WORDMARK_DONE = WORDMARK_START + 7 * STAGGER.letter + 8;

  // Tagline: "Stop losing what's yours."
  const taglineStart = WORDMARK_DONE + 4;
  const taglineProgress = spring({ fps, frame: Math.max(0, frame - taglineStart), config: springConfigs.gentle });
  const taglineOpacity = interpolate(Math.max(0, frame - taglineStart), [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const taglineY = interpolate(taglineProgress, [0, 1], [20, 0]);
  const taglineBlur = interpolate(Math.max(0, frame - taglineStart), [0, 12], [4, 0], { extrapolateRight: 'clamp' });

  // URL: "revorva.com"
  const urlStart = taglineStart + 10;
  const urlOpacity = interpolate(Math.max(0, frame - urlStart), [0, 12], [0, 1], { extrapolateRight: 'clamp' });

  // Orange glow from the dot expands over the last second
  const glowFrame = Math.max(0, frame - 55);
  const glowSize = interpolate(glowFrame, [0, 35], [20, 80], { extrapolateRight: 'clamp' });
  const glowOpacity = interpolate(glowFrame, [0, 10, 35], [0, 0.12, 0.08], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      {/* Cream background */}
      <AbsoluteFill style={{ backgroundColor: colors.creamDark, opacity: bgOpacity }} />

      {/* Expanding dot glow */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: `${glowSize}%`,
            height: `${glowSize}%`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.accent}88 0%, transparent 65%)`,
            opacity: glowOpacity,
            position: 'absolute',
          }}
        />
      </AbsoluteFill>

      {/* Center content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
        }}
      >
        <Wordmark startFrame={WORDMARK_START} fontSize={200} color={colors.ink} />

        <div
          style={{
            fontFamily,
            fontSize: 48,
            fontWeight: 600,
            color: colors.ink,
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            filter: taglineBlur > 0.1 ? `blur(${taglineBlur}px)` : undefined,
            textAlign: 'center',
          }}
        >
          Stop losing what's yours.
        </div>
      </AbsoluteFill>

      {/* Bottom URL */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 110,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 32,
            fontWeight: 500,
            color: colors.muted,
            opacity: urlOpacity,
          }}
        >
          revorva.com
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
