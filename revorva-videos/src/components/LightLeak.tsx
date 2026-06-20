import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

interface LightLeakProps {
  color: string;
  position?: 'bottom-right' | 'center' | 'top-left';
  opacity?: number;
  size?: string;
  pulse?: boolean;
}

export const LightLeak: React.FC<LightLeakProps> = ({
  color,
  position = 'bottom-right',
  opacity = 0.25,
  size = '60%',
  pulse = false,
}) => {
  const frame = useCurrentFrame();

  const pulseOpacity = pulse
    ? opacity * (0.85 + 0.15 * Math.sin(frame * 0.08))
    : opacity;

  const positions: Record<string, { top?: string; bottom?: string; left?: string; right?: string; transform?: string }> = {
    'bottom-right': { bottom: '-10%', right: '-10%' },
    center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    'top-left': { top: '-10%', left: '-10%' },
  };

  const pos = positions[position];

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: pulseOpacity,
          ...pos,
        }}
      />
    </AbsoluteFill>
  );
};
