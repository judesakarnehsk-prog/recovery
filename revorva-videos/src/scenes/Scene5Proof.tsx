import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors } from '../constants/colors';
import { springConfigs, STAGGER } from '../constants/animations';
import { DashboardMockup } from '../components/DashboardMockup';
import { MetricCard } from '../components/MetricCard';

// Scene 5: frames 0–59 (2s local)

const METRICS = [
  { value: '70%',   label: 'of failed payments\nrecovered',  valueColor: colors.successGlow, startOffset: 0 },
  { value: '2 min', label: 'setup time',                      valueColor: colors.accent,      startOffset: STAGGER.card },
  { value: '14 days', label: 'free trial',                    valueColor: colors.ink,         startOffset: STAGGER.card * 2 },
];

export const Scene5Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dashboard shrinks into upper third
  const dashProgress = spring({ fps, frame, config: springConfigs.gentle });
  const dashScale = interpolate(dashProgress, [0, 1], [1, 0.72]);
  const dashY = interpolate(dashProgress, [0, 1], [0, -260]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      {/* Dashboard in upper third, scaled down */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 80,
        }}
      >
        <div
          style={{
            transform: `scale(${dashScale}) translateY(${dashY}px)`,
            transformOrigin: 'top center',
          }}
        >
          <DashboardMockup startFrame={-999} />
        </div>
      </AbsoluteFill>

      {/* 3 metric cards in lower half */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          paddingTop: 960,
          paddingBottom: 60,
          paddingLeft: 30,
          paddingRight: 30,
        }}
      >
        {METRICS.map((m) => (
          <MetricCard
            key={m.value}
            value={m.value}
            label={m.label}
            valueColor={m.valueColor}
            startFrame={m.startOffset + 8}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
