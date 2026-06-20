import React from 'react';
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from 'remotion';
import { colors } from './constants/colors';
import { Scene1Opening } from './scenes/Scene1Opening';
import { Scene2Problem } from './scenes/Scene2Problem';
import { Scene3Solution } from './scenes/Scene3Solution';
import { Scene4Brand } from './scenes/Scene4Brand';

// CleanLaunch — 18 seconds / 540 frames at 30fps
// 1080×1920 vertical
//
// Scene 1 — Opening  :   0–119 (4s)
// Scene 2 — Problem  : 120–239 (4s)
// Scene 3 — Solution : 240–359 (4s)
// Scene 4 — Brand    : 360–539 (6s)
//
// Transitions: each scene fades out over 20 frames into pure cream,
// holds 10 frames of silence, then the next Sequence begins.
// The cross-fade is implemented by rendering an opacity overlay at
// the CleanLaunch level — nothing inside the scenes knows about it.

const EASE = Easing.bezier(0.25, 0.1, 0.25, 1);

function fadeOut(frame: number, start: number, dur = 20): number {
  return interpolate(frame, [start, start + dur], [1, 0], {
    easing: EASE,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

// Scene wrapper that handles its own fade-out mask so scenes don't bleed
const SceneWrapper: React.FC<{
  children: React.ReactNode;
  fadeOutStart: number; // absolute frame when this scene begins fading out
  fadeOutDur?: number;
}> = ({ children, fadeOutStart, fadeOutDur = 20 }) => {
  const frame = useCurrentFrame();
  const wrapOpacity = fadeOut(frame, fadeOutStart, fadeOutDur);
  return (
    <AbsoluteFill style={{ opacity: wrapOpacity }}>
      {children}
    </AbsoluteFill>
  );
};

export const CleanLaunch: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>

      {/* Scene 1 — fades out at frame 100 over 20 frames */}
      <Sequence from={0} durationInFrames={120}>
        <SceneWrapper fadeOutStart={100}>
          <Scene1Opening />
        </SceneWrapper>
      </Sequence>

      {/* Scene 2 — starts at 120 (10 frames of silence after S1 out at 120),
          fades out at 220 */}
      <Sequence from={130} durationInFrames={110}>
        <SceneWrapper fadeOutStart={100}>
          <Scene2Problem />
        </SceneWrapper>
      </Sequence>

      {/* Scene 3 — starts at 250 (10 frames silence), fades out at 340 */}
      <Sequence from={250} durationInFrames={110}>
        <SceneWrapper fadeOutStart={100}>
          <Scene3Solution />
        </SceneWrapper>
      </Sequence>

      {/* Scene 4 — starts at 380 (20 frames silence for dramatic pause),
          runs to end. No fade-out needed — holds still. */}
      <Sequence from={380} durationInFrames={160}>
        <Scene4Brand />
      </Sequence>

    </AbsoluteFill>
  );
};
