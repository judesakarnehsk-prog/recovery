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
import { GradientBackground } from '../components/GradientBackground';

// Scene 2 local frames: 0–89 (90 frames = 3s)
export const Scene2Transition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Diagonal sweep wipe (0–20 frames)
  const sweepProgress = spring({
    fps,
    frame,
    config: { damping: 30, stiffness: 60, mass: 1 },
  });

  // Orange wash opacity
  const washOpacity = interpolate(frame, [5, 30], [0, 0.08], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  // Circle pulse
  const circleProgress = spring({
    fps,
    frame: Math.max(0, frame - 20),
    config: { damping: 18, stiffness: 80, mass: 0.9 },
  });

  const circleScale = interpolate(circleProgress, [0, 1], [0, 1]);
  const circleOpacity = interpolate(Math.min(Math.max(0, frame - 20), 12), [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Pulse ring
  const pulseProgress = spring({
    fps,
    frame: Math.max(0, frame - 35),
    config: { damping: 8, stiffness: 40, mass: 1 },
  });
  const pulseScale = interpolate(pulseProgress, [0, 1], [1, 2.4]);
  const pulseOpacity = interpolate(pulseProgress, [0, 0.3, 1], [0.5, 0.3, 0]);

  // Text fade in
  const textOpacity = interpolate(Math.max(0, frame - 45), [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const textProgress = spring({
    fps,
    frame: Math.max(0, frame - 45),
    config: { damping: 22, stiffness: 90 },
  });
  const textY = interpolate(textProgress, [0, 1], [20, 0]);

  // Diagonal sweep clip
  const sweepX = interpolate(sweepProgress, [0, 1], [-200, 1300]);

  return (
    <AbsoluteFill>
      <GradientBackground
        startColor={colors.cream}
        endColor="#EFEBE3"
        angleStart={145}
        angleEnd={148}
        animDuration={90}
      />

      {/* Orange wash overlay */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${colors.accent} 0%, transparent 70%)`,
          opacity: washOpacity,
        }}
      />

      {/* Diagonal sweep element */}
      <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: sweepX - 300,
            width: 400,
            height: 2500,
            background: `linear-gradient(to right, transparent, rgba(201,74,31,0.06), transparent)`,
            transform: 'rotate(-15deg)',
          }}
        />
      </AbsoluteFill>

      {/* Glowing orange circle */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 48,
        }}
      >
        <div style={{ position: 'relative' }}>
          {/* Pulse ring */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 200,
              height: 200,
              borderRadius: '50%',
              border: `2px solid ${colors.accent}`,
              transform: `translate(-50%, -50%) scale(${pulseScale})`,
              opacity: pulseOpacity,
            }}
          />

          {/* Main circle */}
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${colors.accentGlow}, ${colors.accent})`,
              boxShadow: `0 0 60px ${colors.accent}66, 0 0 120px ${colors.accent}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${circleScale})`,
              opacity: circleOpacity,
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize: 88,
                fontWeight: 900,
                color: 'white',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              R
            </span>
          </div>
        </div>

        {/* "Meet Revorva." text */}
        <div
          style={{
            fontFamily,
            fontSize: 72,
            fontWeight: 700,
            color: colors.ink,
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            letterSpacing: '-1px',
          }}
        >
          Meet Revorva.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
