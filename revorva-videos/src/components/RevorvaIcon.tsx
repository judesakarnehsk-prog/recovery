/**
 * RevorvaIcon — "The Recovery Loop"
 *
 * Portable SVG component usable in Remotion AND in the Revorva web app.
 * When used outside Remotion, pass `frame` and `fps` as static values
 * (e.g. frame=9999, fps=30) to get the fully-revealed static state.
 *
 * Two arcs form a loop: ink (top) + accent (bottom).
 * A completion dot sits at the right join point.
 */

import React from 'react';
import { interpolate, spring } from 'remotion';

// Path lengths measured from the SVG viewBox (200×200).
// Top arc: "M 30 100 Q 30 30, 100 30 T 170 100"   ≈ 222px
// Bottom arc: "M 170 100 Q 170 170, 100 170 T 30 100" ≈ 222px
const TOP_ARC_LENGTH = 222;
const BOT_ARC_LENGTH = 222;

interface RevorvaIconProps {
  /** Current animation frame (from useCurrentFrame() in Remotion) */
  frame: number;
  /** Frames per second */
  fps: number;
  /** Frame at which the icon animation begins */
  startFrame?: number;
  /** Rendered size in px */
  size?: number;
  /** Ink color for top arc */
  inkColor?: string;
  /** Accent color for bottom arc + dot */
  accentColor?: string;
  /** Show continuous breathing animation after reveal */
  breathe?: boolean;
}

export const RevorvaIcon: React.FC<RevorvaIconProps> = ({
  frame,
  fps,
  startFrame = 0,
  size = 200,
  inkColor = '#0F0E0C',
  accentColor = '#C94A1F',
  breathe = true,
}) => {
  const f = Math.max(0, frame - startFrame);

  // === Phase timings (in local frames) ===
  // Top arc draws:    f 0  → 20
  // Bottom arc draws: f 8  → 28 (offset 8 frames = ~267ms)
  // Dot appears:      f 22 → 30
  // Rotation:         f 5  → 45 (36 frames = 1.2s)

  // --- Top arc draw ---
  const topProgress = spring({ fps, frame: f, config: { damping: 16, stiffness: 70, mass: 1 } });
  const topDash = interpolate(topProgress, [0, 1], [TOP_ARC_LENGTH, 0]);

  // --- Bottom arc draw ---
  const botProgress = spring({ fps, frame: Math.max(0, f - 8), config: { damping: 16, stiffness: 70, mass: 1 } });
  const botDash = interpolate(botProgress, [0, 1], [BOT_ARC_LENGTH, 0]);

  // --- Dot entrance ---
  const dotF = Math.max(0, f - 22);
  const dotProgress = spring({ fps, frame: dotF, config: { damping: 8, stiffness: 100, mass: 0.8 } });
  const dotScale = interpolate(dotProgress, [0, 0.4, 1], [0, 1.35, 1]);
  const dotOpacity = interpolate(Math.min(dotF, 6), [0, 6], [0, 1], { extrapolateRight: 'clamp' });

  // --- Whole icon rotation (0 → 360deg) ---
  const rotProgress = spring({ fps, frame: Math.max(0, f - 5), config: { damping: 18, stiffness: 55, mass: 1 } });
  const rotation = interpolate(rotProgress, [0, 1], [0, 360]);

  // --- Container entrance (fade + scale) ---
  const entranceProgress = spring({ fps, frame: f, config: { damping: 14, stiffness: 80, mass: 1 } });
  const containerOpacity = interpolate(Math.min(f, 8), [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const containerScale = interpolate(entranceProgress, [0, 1], [0.5, 1]);

  // --- Breathing (after reveal settles ~frame 50) ---
  const settledF = Math.max(0, f - 50);
  const breatheScale = breathe ? 1 + 0.005 * Math.sin(settledF * 0.07) : 1;

  // --- Dot glow pulse ---
  const glowSize = 14 + 8 * Math.sin((f + (startFrame ?? 0)) * 0.08);

  return (
    <div
      style={{
        width: size,
        height: size,
        opacity: containerOpacity,
        transform: `scale(${containerScale * breatheScale}) rotate(${rotation}deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
      >
        {/* Top arc — ink, draws from left to right */}
        <path
          d="M 30 100 Q 30 30, 100 30 T 170 100"
          stroke={inkColor}
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={TOP_ARC_LENGTH}
          strokeDashoffset={topDash}
        />

        {/* Bottom arc — accent, draws from right to left */}
        <path
          d="M 170 100 Q 170 170, 100 170 T 30 100"
          stroke={accentColor}
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={BOT_ARC_LENGTH}
          strokeDashoffset={botDash}
        />

        {/* Completion dot — at right join (170, 100) */}
        <circle
          cx="170"
          cy="100"
          r="10"
          fill={accentColor}
          opacity={dotOpacity}
          transform={`scale(${dotScale})`}
          style={{
            transformOrigin: '170px 100px',
            filter: `drop-shadow(0 0 ${glowSize}px rgba(201,74,31,0.65))`,
          }}
        />
      </svg>
    </div>
  );
};
