import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { colors } from '../constants/colors';
import { FloatingOrb } from './FloatingOrb';
import { GridPattern } from './GridPattern';

interface BackgroundLayerProps {
  orangeOpacity?: number;
  greenOpacity?: number;
  greenShow?: boolean;
  gridOpacity?: number;
  // Legacy props accepted but ignored (old scenes pass these)
  orangeX?: number;
  orangeY?: number;
  orangeBlur?: number;
  orangeSize?: number;
  greenX?: number;
  greenY?: number;
  gradientAngleStart?: number;
  gradientAngleEnd?: number;
  gradientDuration?: number;
  creamOrbShow?: boolean;
  grainOpacity?: number;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  orangeOpacity = 0.08,
  greenOpacity = 0.05,
  greenShow = false,
  gridOpacity = 0.03,
}) => {
  const frame = useCurrentFrame();
  const angle = 175 + Math.sin(frame / 60) * 8;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(${angle}deg, ${colors.creamLight} 0%, ${colors.cream} 50%, ${colors.creamDeeper} 100%)`,
        }}
      />
      <GridPattern opacity={gridOpacity} />
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <FloatingOrb
          color={colors.accent}
          size={600}
          blur={180}
          opacity={orangeOpacity}
          x={75}
          y={75}
          driftX={35}
          driftY={28}
          driftDuration={220}
          phaseOffset={0}
        />
        <FloatingOrb
          color={colors.creamDeeper}
          size={500}
          blur={160}
          opacity={0.55}
          x={25}
          y={30}
          driftX={25}
          driftY={20}
          driftDuration={280}
          phaseOffset={90}
        />
        {greenShow && (
          <FloatingOrb
            color={colors.success}
            size={480}
            blur={180}
            opacity={greenOpacity}
            x={20}
            y={80}
            driftX={20}
            driftY={25}
            driftDuration={300}
            phaseOffset={150}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
