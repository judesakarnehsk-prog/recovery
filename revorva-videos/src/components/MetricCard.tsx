import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { springConfigs } from '../constants/animations';

interface MetricCardProps {
  value: string;
  label: string;
  valueColor?: string;
  startFrame?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  valueColor = colors.successGlow,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  const progress = spring({
    fps,
    frame: localFrame,
    config: springConfigs.snappy,
  });

  const scale = interpolate(progress, [0, 1], [0.8, 1]);
  const opacity = interpolate(Math.min(localFrame, 10), [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const translateY = interpolate(progress, [0, 1], [20, 0]);

  return (
    <div
      style={{
        width: 280,
        padding: '36px 28px',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.85)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: 72,
          fontWeight: 900,
          color: valueColor,
          lineHeight: 1,
          filter: `drop-shadow(0 0 16px ${valueColor}66)`,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily,
          fontSize: 22,
          fontWeight: 500,
          color: colors.muted,
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>
    </div>
  );
};
