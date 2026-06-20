import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors } from '../constants/colors';
import { BackgroundLayer } from '../components/BackgroundLayer';
import { AnimatedText } from '../components/AnimatedText';
import { Wordmark } from '../components/Wordmark';
import { FloatingParticles } from '../components/FloatingParticles';

// Scene 5: 0–89 (3s local)

export const Scene5Final: React.FC = () => {
  const frame = useCurrentFrame();

  // Expanding bottom-center orange glow
  const glowSize = interpolate(frame, [0, 60], [10, 55], { extrapolateRight: 'clamp' });
  const glowOpacity = interpolate(frame, [0, 15, 60, 89], [0, 0.12, 0.1, 0.08], { extrapolateRight: 'clamp' });

  const wordmarkStart = 5;
  // "revorva" = 7 letters × 2 stagger + 2 for dot + 4 settle = ~24 frames
  const taglineStart = wordmarkStart + 24;
  const ctaStart = taglineStart + 12;
  const footerStart = ctaStart + 12;

  return (
    <AbsoluteFill>
      <BackgroundLayer
        orangeX={50}
        orangeY={100}
        orangeOpacity={0.1}
        orangeBlur={130}
        greenShow={false}
        gridOpacity={0.025}
        gradientAngleStart={175}
        gradientAngleEnd={182}
        gradientDuration={90}
      />

      {/* Expanding orange glow from bottom-center */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            bottom: '-5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${glowSize}%`,
            height: `${glowSize * 0.6}%`,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(201,74,31,0.6) 0%, transparent 70%)`,
            opacity: glowOpacity,
            filter: 'blur(40px)',
          }}
        />
      </AbsoluteFill>

      {/* Particles */}
      <FloatingParticles count={6} startFrame={0} />

      {/* Center content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          padding: '0 80px',
        }}
      >
        <Wordmark startFrame={wordmarkStart} fontSize={180} color={colors.ink} staggerFrames={2} />

        <AnimatedText
          startFrame={taglineStart}
          fontSize={32}
          fontWeight={500}
          color={colors.inkMid}
          style={{ textAlign: 'center', maxWidth: 700 }}
        >
          Start recovering revenue in 2 minutes.
        </AnimatedText>

        {/* CTA text */}
        <AnimatedText
          startFrame={ctaStart}
          fontSize={24}
          fontWeight={600}
          color={colors.accent}
          style={{ display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties}
        >
          revorva.com →
        </AnimatedText>
      </AbsoluteFill>

      {/* Footer */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 100,
        }}
      >
        <AnimatedText
          startFrame={footerStart}
          fontSize={16}
          fontWeight={400}
          color={colors.muted}
        >
          14-day free trial · No credit card required
        </AnimatedText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
