import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { colors } from '../constants/colors';
import { BackgroundLayer } from '../components/BackgroundLayer';
import { DashboardMockup } from '../components/DashboardMockup';
import { AnimatedText } from '../components/AnimatedText';

// Scene 4: 0–119 (4s local)

export const Scene4Product: React.FC = () => {
  useCurrentFrame();

  return (
    <AbsoluteFill>
      <BackgroundLayer
        orangeX={15}
        orangeY={80}
        orangeOpacity={0.08}
        orangeBlur={120}
        greenX={82}
        greenY={78}
        greenOpacity={0.07}
        greenShow
        gridOpacity={0.05}
        gradientAngleStart={168}
        gradientAngleEnd={178}
        gradientDuration={120}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
          padding: '0 60px',
        }}
      >
        <DashboardMockup startFrame={5} />

        <AnimatedText
          startFrame={90}
          fontSize={28}
          fontWeight={500}
          color={colors.inkMid}
        >
          Revorva works 24/7
        </AnimatedText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
