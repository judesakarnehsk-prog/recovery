import React from 'react';
import { useCurrentFrame } from 'remotion';

interface FloatingOrbProps {
  color: string;
  size?: number;
  blur?: number;
  opacity?: number;
  x?: number;
  y?: number;
  driftX?: number;
  driftY?: number;
  driftDuration?: number;
  phaseOffset?: number;
}

export const FloatingOrb: React.FC<FloatingOrbProps> = ({
  color,
  size = 500,
  blur = 180,
  opacity = 0.08,
  x = 50,
  y = 50,
  driftX = 30,
  driftY = 25,
  driftDuration = 200,
  phaseOffset = 0,
}) => {
  const frame = useCurrentFrame();
  const t = ((frame + phaseOffset) / driftDuration) * 2 * Math.PI;
  const tx = Math.sin(t) * driftX;
  const ty = Math.cos(t * 0.7) * driftY;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px)`,
        filter: `blur(${blur}px)`,
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};
