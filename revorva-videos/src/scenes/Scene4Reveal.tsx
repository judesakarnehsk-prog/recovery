import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { BackgroundLayer } from '../components/BackgroundLayer';
import { RevorvaIcon } from '../components/RevorvaIcon';
import { Wordmark } from '../components/Wordmark';

// Scene 4: frames 0–89 (3s local)
// THE BIG MOMENT.
//
// Phases (all local frames):
//   0–10:   Dot from Scene 3 holds in center (we replicate it briefly)
//   10–20:  Dot grows into icon container
//   20–65:  Icon animation (draw arcs → rotation)
//   65–85:  Wordmark letters stagger in below
//   75–89:  Tagline fades in below wordmark

export const Scene4Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === Background brightens + green orb grows ===
  const bgGlowOpacity = interpolate(frame, [0, 40], [0.08, 0.2], { extrapolateRight: 'clamp' });
  const greenOpacity  = interpolate(frame, [20, 60], [0, 0.06], { extrapolateRight: 'clamp' });

  // === Seed dot → icon container expansion ===
  // Dot was at 8px. Container expands to 200px starting frame 10.
  const dotF = Math.max(0, frame - 10);
  const expandProgress = spring({ fps, frame: dotF, config: { damping: 14, stiffness: 60, mass: 1 } });
  const containerSize = interpolate(expandProgress, [0, 1], [8, 200]);
  // Dot fades out as icon begins
  const dotFade = interpolate(frame, [10, 18], [1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // === Icon starts drawing at frame 20 ===
  const ICON_START = 20;

  // === Wordmark appears at frame 65 ===
  const WORDMARK_START = 65;

  // === Tagline: "Recover what's yours." at frame 78 ===
  const TAGLINE_START = 78;
  const taglineF = Math.max(0, frame - TAGLINE_START);
  const taglineProgress = spring({ fps, frame: taglineF, config: { damping: 14, stiffness: 80, mass: 1 } });
  const taglineOpacity = interpolate(Math.min(taglineF, 10), [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const taglineY = interpolate(taglineProgress, [0, 1], [16, 0]);

  // === Orange radial glow expands from center on reveal ===
  const revealGlowProgress = spring({ fps, frame: Math.max(0, frame - 8), config: { damping: 12, stiffness: 55, mass: 1 } });
  const revealGlowSize = interpolate(revealGlowProgress, [0, 1], [10, 70]);
  const revealGlowOpacity = interpolate(revealGlowProgress, [0, 0.3, 1], [0, 0.18, 0.08]);

  return (
    <AbsoluteFill>
      <BackgroundLayer
        orangeX={50}
        orangeY={90}
        orangeOpacity={bgGlowOpacity}
        orangeBlur={130}
        orangeSize={600}
        greenX={78}
        greenY={20}
        greenOpacity={greenOpacity}
        greenShow
        gridOpacity={0.05}
        gradientAngleStart={174}
        gradientAngleEnd={180}
        gradientDuration={90}
      />

      {/* Expanding orange radial glow from center */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${revealGlowSize}%`,
            height: `${revealGlowSize * 0.6}%`,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(201,74,31,0.55) 0%, transparent 65%)`,
            filter: 'blur(30px)',
            opacity: revealGlowOpacity,
          }}
        />
      </AbsoluteFill>

      {/* Seed dot → then replaced by icon */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 48,
        }}
      >
        {/* Phase 1: expanding dot seed (frames 0–20) */}
        {frame < 20 && (
          <div
            style={{
              width: containerSize,
              height: containerSize,
              borderRadius: '50%',
              backgroundColor: colors.accent,
              opacity: dotFade,
              filter: `drop-shadow(0 0 16px rgba(201,74,31,0.6))`,
              position: 'absolute',
            }}
          />
        )}

        {/* Phase 2: Actual icon (frame 20+) */}
        <RevorvaIcon
          frame={frame}
          fps={fps}
          startFrame={ICON_START}
          size={200}
        />

        {/* Wordmark below icon */}
        <Wordmark
          startFrame={WORDMARK_START}
          fontSize={160}
          color={colors.ink}
          staggerFrames={2}
        />

        {/* Tagline */}
        <div
          style={{
            fontFamily,
            fontSize: 28,
            fontWeight: 500,
            color: colors.inkMid,
            letterSpacing: '1px',
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            marginTop: -24,
          }}
        >
          Recover what's yours.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
