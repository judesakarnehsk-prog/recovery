import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';
import { springConfigs, STAGGER } from '../constants/animations';
import { NoiseTexture } from '../components/NoiseTexture';
import { LightLeak } from '../components/LightLeak';

// Scene 1: frames 0–119 (4s). useCurrentFrame() is local to Sequence.

interface TextLineProps {
  text: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  startFrame: number;
  glowColor?: string;
  pulse?: boolean;
}

const TextLine: React.FC<TextLineProps> = ({
  text, fontSize, fontWeight, color, startFrame, glowColor, pulse,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  const progress = spring({ fps, frame: localFrame, config: springConfigs.gentle });
  const opacity = interpolate(Math.min(localFrame, 12), [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(progress, [0, 1], [20, 0]);
  const scale = interpolate(progress, [0, 1], [0.95, 1]);
  const blurVal = interpolate(Math.min(localFrame, 12), [0, 12], [4, 0], { extrapolateRight: 'clamp' });

  const pulseGlow = pulse && glowColor
    ? `drop-shadow(0 0 ${20 + Math.sin(frame * 0.09) * 10}px ${glowColor})`
    : glowColor
    ? `drop-shadow(0 0 20px ${glowColor}88)`
    : undefined;

  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        color,
        lineHeight: 1.15,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        filter: [blurVal > 0.1 ? `blur(${blurVal}px)` : '', pulseGlow].filter(Boolean).join(' ') || undefined,
      }}
    >
      {text}
    </div>
  );
};

export const Scene1Silence: React.FC = () => {
  const frame = useCurrentFrame();
  // Slow push-in: everything scales 1.0 → 1.05 over 120 frames
  const pushScale = interpolate(frame, [0, 120], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.inkDeep }}>
      <NoiseTexture opacity={0.035} />

      {/* Red light leak — bottom right */}
      <LightLeak
        color={`${colors.loss}55`}
        position="bottom-right"
        opacity={1}
        size="55%"
        pulse
      />

      {/* Content with push-in */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          transform: `scale(${pushScale})`,
        }}
      >
        <TextLine
          text="Right now,"
          fontSize={96}
          fontWeight={600}
          color={colors.cream}
          startFrame={8}
        />
        <TextLine
          text="somewhere,"
          fontSize={72}
          fontWeight={400}
          color={colors.muted}
          startFrame={8 + STAGGER.word}
        />
        <TextLine
          text="a payment"
          fontSize={72}
          fontWeight={400}
          color={colors.muted}
          startFrame={8 + STAGGER.word * 2}
        />
        <TextLine
          text="is failing."
          fontSize={96}
          fontWeight={800}
          color={colors.accent}
          startFrame={8 + STAGGER.word * 3}
          glowColor={colors.loss}
          pulse
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
