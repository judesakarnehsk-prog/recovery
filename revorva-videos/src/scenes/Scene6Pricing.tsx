import React from 'react';
import { AbsoluteFill } from 'remotion';
import { colors } from '../constants/colors';
import { BackgroundLayer } from '../components/BackgroundLayer';
import { AnimatedText } from '../components/AnimatedText';
import { TrustBadge } from '../components/TrustBadge';
// Scene 6: frames 0–89 (3s local)

export const Scene6Pricing: React.FC = () => {
  return (
    <AbsoluteFill>
      <BackgroundLayer orangeOpacity={0.08} />

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
        {/* "STARTING AT" */}
        <AnimatedText
          startFrame={5}
          fontSize={13}
          fontWeight={700}
          color={colors.muted}
          from="top"
          style={{ letterSpacing: '4px' }}
        >
          STARTING AT
        </AnimatedText>

        {/* Big price */}
        <AnimatedText
          startFrame={14}
          fontSize={180}
          fontWeight={900}
          color={colors.ink}
          from="bottom"
          config={{ damping: 10, stiffness: 90, mass: 1 }}
          style={{
            lineHeight: 1,
            background: `linear-gradient(135deg, ${colors.ink} 0%, ${colors.accent} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          $29
        </AnimatedText>

        {/* /month */}
        <AnimatedText
          startFrame={20}
          fontSize={28}
          fontWeight={500}
          color={colors.muted}
          from="bottom"
          style={{ marginTop: -20 }}
        >
          / month
        </AnimatedText>

        {/* Competitor comparison */}
        <AnimatedText
          startFrame={30}
          fontSize={15}
          fontWeight={500}
          color={colors.muted}
          from="left"
        >
          vs{' '}
          <span style={{ textDecoration: 'line-through', color: colors.muted }}>$250+</span>
          {' '}for competitors
        </AnimatedText>

        {/* Brand line */}
        <AnimatedText
          startFrame={40}
          fontSize={22}
          fontWeight={600}
          color={colors.ink}
          from="bottom"
          style={{ marginTop: 4 }}
        >
          Built for early-stage SaaS founders.
        </AnimatedText>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
          <TrustBadge text="14-day free trial" startFrame={52} />
          <TrustBadge text="No credit card required" startFrame={58} />
          <TrustBadge text="Cancel anytime" startFrame={64} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
