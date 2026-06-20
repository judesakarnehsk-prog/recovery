import React from 'react';
import { AbsoluteFill } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { STAGGER } from '../constants/animations';
import { BackgroundLayer } from '../components/BackgroundLayer';
import { AnimatedText } from '../components/AnimatedText';
import { GlassCard } from '../components/GlassCard';

// Scene 2: 0–119 (4s local)

interface StatCardProps {
  big: string;
  bigGradient?: boolean;
  bigColor?: string;
  body: string;
  sub: string;
  startFrame: number;
  slideFrom: 'left' | 'right';
}

const StatCard: React.FC<StatCardProps> = ({ big, bigGradient, bigColor, body, sub, startFrame, slideFrom }) => {
  const gradientStyle: React.CSSProperties = bigGradient
    ? {
        background: 'linear-gradient(135deg, #C94A1F, #E66B3F)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }
    : {};

  return (
    <GlassCard startFrame={startFrame} slideFrom={slideFrom} width={800}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            fontFamily,
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1,
            color: bigGradient ? undefined : (bigColor ?? colors.ink),
            ...gradientStyle,
          }}
        >
          {big}
        </div>
        <div style={{ fontFamily, fontSize: 24, fontWeight: 400, color: colors.inkMid, lineHeight: 1.4 }}>
          {body}
        </div>
        <div style={{ fontFamily, fontSize: 14, fontWeight: 400, color: colors.muted }}>
          {sub}
        </div>
      </div>
    </GlassCard>
  );
};

export const Scene2Numbers: React.FC = () => {
  return (
    <AbsoluteFill>
      <BackgroundLayer
        orangeX={22}
        orangeY={35}
        orangeOpacity={0.1}
        orangeBlur={110}
        greenShow={false}
        gridOpacity={0.03}
        gradientAngleStart={175}
        gradientAngleEnd={188}
        gradientDuration={120}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          padding: '0 80px',
        }}
      >
        <AnimatedText
          startFrame={5}
          fontSize={32}
          fontWeight={600}
          color={colors.ink}
          style={{ marginBottom: 12 }}
        >
          The hidden tax on your revenue
        </AnimatedText>

        <StatCard
          big="4–9%"
          bigGradient
          body="of payments fail every month"
          sub="Industry data, Recurly 2024"
          startFrame={12}
          slideFrom="left"
        />
        <StatCard
          big="70%"
          bigColor={colors.success}
          body="of those are completely recoverable"
          sub="with the right system"
          startFrame={12 + STAGGER.card}
          slideFrom="right"
        />
        <StatCard
          big="$1,200+"
          bigColor={colors.ink}
          body="average monthly loss for $20k MRR business"
          sub="you're losing this right now"
          startFrame={12 + STAGGER.card * 2}
          slideFrom="left"
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
