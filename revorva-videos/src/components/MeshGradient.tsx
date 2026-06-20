import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { colors } from '../constants/colors';

// Continuously flowing mesh gradient — the "alive background" effect.
// Runs throughout the entire video.

interface BlobProps {
  color: string;
  size: number;
  opacity: number;
  baseX: number;
  baseY: number;
  freqX: number;
  freqY: number;
  ampX: number;
  ampY: number;
  blur: number;
  phase: number;
}

const Blob: React.FC<BlobProps> = ({
  color, size, opacity, baseX, baseY,
  freqX, freqY, ampX, ampY, blur, phase,
}) => {
  const frame = useCurrentFrame();
  const t = frame + phase;
  const x = baseX + Math.sin(t / freqX) * ampX;
  const y = baseY + Math.cos(t / freqY) * ampY;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        filter: `blur(${blur}px)`,
        opacity,
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
};

interface MeshGradientProps {
  intensity?: number; // 0–1 multiplier on opacity
}

export const MeshGradient: React.FC<MeshGradientProps> = ({ intensity = 1 }) => {
  const frame = useCurrentFrame();
  // Slowly rotating gradient angle for base
  const angle = 160 + Math.sin(frame / 70) * 15;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Base cream gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${angle}deg, ${colors.creamLight} 0%, ${colors.cream} 45%, ${colors.creamDeeper} 100%)`,
        }}
      />

      {/* Mesh blobs */}
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        {/* Orange warm blob — upper right drift */}
        <Blob color={colors.accent}      size={700} opacity={0.13 * intensity} baseX={820} baseY={340}  freqX={80}  freqY={60}  ampX={180} ampY={140} blur={140} phase={0}   />
        {/* Lighter orange — lower left */}
        <Blob color={colors.accentLight} size={600} opacity={0.10 * intensity} baseX={200} baseY={1400} freqX={100} freqY={75}  ampX={150} ampY={160} blur={160} phase={45}  />
        {/* Warm cream depth — center drift */}
        <Blob color={colors.creamDeeper} size={800} opacity={0.50 * intensity} baseX={540} baseY={960}  freqX={120} freqY={90}  ampX={200} ampY={180} blur={180} phase={90}  />
        {/* Subtle green — bottom */}
        <Blob color={colors.successLight}size={500} opacity={0.05 * intensity} baseX={300} baseY={1700} freqX={140} freqY={110} ampX={120} ampY={100} blur={150} phase={180} />
        {/* Small hot accent — top left spark */}
        <Blob color={colors.gradient3}   size={400} opacity={0.08 * intensity} baseX={160} baseY={400}  freqX={65}  freqY={80}  ampX={100} ampY={120} blur={120} phase={30}  />
      </AbsoluteFill>

      {/* Noise/grain overlay */}
      <AbsoluteFill style={{ opacity: 0.04 * intensity }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <filter id="reel-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#reel-noise)" />
        </svg>
      </AbsoluteFill>

      {/* Grid overlay */}
      <AbsoluteFill style={{ opacity: 0.03 * intensity }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id="reel-grid" width="54" height="54" patternUnits="userSpaceOnUse">
              <path d="M 54 0 L 0 0 0 54" fill="none" stroke="#0F0E0C" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#reel-grid)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
