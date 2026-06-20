import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors } from '../constants/colors';
import { STAGGER } from '../constants/animations';
import { BackgroundLayer } from '../components/BackgroundLayer';
import { AnimatedText } from '../components/AnimatedText';

// Scene 1: 0–119 (4s). Frame is local via Sequence.

export const Scene1Question: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow upward drift over 120 frames — 30px rise
  const drift = interpolate(frame, [0, 120], [0, -30], { extrapolateRight: 'clamp' });

  // Gradient "MRR" text style
  const gradientText: React.CSSProperties = {
    background: 'linear-gradient(135deg, #C94A1F, #E66B3F)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  return (
    <AbsoluteFill>
      <BackgroundLayer
        orangeX={78}
        orangeY={18}
        orangeOpacity={0.08}
        orangeBlur={120}
        greenShow={false}
        gridOpacity={0.03}
        gradientAngleStart={170}
        gradientAngleEnd={185}
        gradientDuration={120}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          transform: `translateY(${drift}px)`,
          padding: '0 80px',
        }}
      >
        {/* Label */}
        <AnimatedText
          startFrame={5}
          fontSize={16}
          fontWeight={600}
          color={colors.accent}
          style={{ letterSpacing: '4px', marginBottom: 36 }}
        >
          STRIPE PAYMENT RECOVERY
        </AnimatedText>

        {/* Headline — word by word */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            marginBottom: 32,
          }}
        >
          <AnimatedText startFrame={17} fontSize={64} fontWeight={500} color={colors.ink}>
            Where does
          </AnimatedText>
          <AnimatedText startFrame={17 + STAGGER.word} fontSize={64} fontWeight={500} color={colors.ink}>
            your
          </AnimatedText>

          {/* MRR — gradient + bouncy */}
          <AnimatedText
            startFrame={17 + STAGGER.word * 2}
            fontSize={96}
            fontWeight={800}
            style={gradientText}
            config={{ damping: 10, stiffness: 120, mass: 0.8 }}
          >
            MRR
          </AnimatedText>

          <AnimatedText startFrame={17 + STAGGER.word * 3} fontSize={96} fontWeight={800} color={colors.ink}>
            go?
          </AnimatedText>
        </div>

        {/* Subtitle */}
        <AnimatedText
          startFrame={17 + STAGGER.word * 4 + 6}
          fontSize={24}
          fontWeight={400}
          color={colors.muted}
          style={{ maxWidth: 600, lineHeight: 1.5 }}
        >
          Failed payments are silently killing your subscription business.
        </AnimatedText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
