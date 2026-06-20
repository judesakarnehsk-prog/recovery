import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import { colors } from '../constants/colors';
import { fontFamily } from '../constants/fonts';

const WORDMARK = 'revorva';

const StaggeredLetter: React.FC<{
  char: string;
  index: number;
  totalChars: number;
}> = ({ char, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = index * 4;
  const localFrame = Math.max(0, frame - delay);

  const progress = spring({
    fps,
    frame: localFrame,
    config: { damping: 24, stiffness: 120, mass: 0.7 },
  });

  const opacity = interpolate(Math.min(localFrame, 8), [0, 8], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const translateY = interpolate(progress, [0, 1], [30, 0]);
  const scale = interpolate(progress, [0, 1], [0.85, 1]);

  return (
    <span
      style={{
        display: 'inline-block',
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
      }}
    >
      {char}
    </span>
  );
};

const PulsingDot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = WORDMARK.length * 4 + 4;
  const localFrame = Math.max(0, frame - delay);

  // Appear
  const appearProgress = spring({
    fps,
    frame: localFrame,
    config: { damping: 24, stiffness: 120, mass: 0.7 },
  });
  const opacity = interpolate(Math.min(localFrame, 8), [0, 8], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const translateY = interpolate(appearProgress, [0, 1], [30, 0]);

  // Pulse (once, after appearing)
  const pulseDelay = 15;
  const pulseFrame = Math.max(0, localFrame - pulseDelay);
  const pulseProgress = spring({
    fps,
    frame: pulseFrame,
    config: { damping: 6, stiffness: 80, mass: 1 },
  });
  // single pulse: scale goes 1 → 1.4 → 1
  const pulseScale = interpolate(pulseProgress, [0, 0.4, 1], [1, 1.4, 1]);

  return (
    <span
      style={{
        display: 'inline-block',
        opacity,
        transform: `translateY(${translateY}px) scale(${pulseScale})`,
        color: colors.accent,
        transformOrigin: 'center bottom',
      }}
    >
      .
    </span>
  );
};

export const Scene5Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background fade in
  const bgOpacity = interpolate(Math.min(frame, 10), [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Tagline
  const taglineDelay = WORDMARK.length * 4 + 20;
  const taglineProgress = spring({
    fps,
    frame: Math.max(0, frame - taglineDelay),
    config: { damping: 22, stiffness: 90 },
  });
  const taglineOpacity = interpolate(
    Math.max(0, frame - taglineDelay),
    [0, 12],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const taglineY = interpolate(taglineProgress, [0, 1], [16, 0]);

  // URL
  const urlDelay = taglineDelay + 10;
  const urlOpacity = interpolate(Math.max(0, frame - urlDelay), [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundColor: colors.cream,
          opacity: bgOpacity,
        }}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            fontFamily,
            fontSize: 120,
            fontWeight: 800,
            color: colors.ink,
            lineHeight: 1,
            letterSpacing: '-3px',
            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          {WORDMARK.split('').map((char, i) => (
            <StaggeredLetter
              key={i}
              char={char}
              index={i}
              totalChars={WORDMARK.length}
            />
          ))}
          <PulsingDot />
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily,
            fontSize: 32,
            fontWeight: 500,
            color: colors.muted,
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
          }}
        >
          Recover what's yours.
        </div>
      </AbsoluteFill>

      {/* Bottom URL */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 100,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 24,
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
