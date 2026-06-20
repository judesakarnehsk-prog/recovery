import React from 'react';
import { fontFamily } from '../constants/fonts';
import { colors } from '../constants/colors';

interface WordmarkProps {
  fontSize?: number;
  color?: string;
  // Legacy props accepted from older scenes — ignored by this component.
  // Animation is handled by parent FadeIn wrappers in CleanLaunch scenes,
  // and by the older scenes' own spring logic via the parent.
  startFrame?: number;
  staggerFrames?: number;
  config?: unknown;
  staggerMs?: number;
}

// Clean, static wordmark — no staggered letters, no spring, no animation.
// Animation is handled by the parent FadeIn wrapper.
export const Wordmark: React.FC<WordmarkProps> = ({
  fontSize = 180,
  color = colors.ink,
}) => {
  const kern = fontSize > 100 ? '-0.02em' : '-0.01em';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        fontFamily,
        fontSize,
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: kern,
      }}
    >
      <span style={{ color }}>{`revorva`}</span>
      <span
        style={{
          color: colors.accent,
          // Dot is accent — the ONE orange element allowed in this scene
        }}
      >
        {`.`}
      </span>
    </div>
  );
};
