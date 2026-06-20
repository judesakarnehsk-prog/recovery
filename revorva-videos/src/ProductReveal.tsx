import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Scene1Whisper } from './scenes/Scene1Whisper';
import { Scene2Question } from './scenes/Scene2Question';
import { Scene3Pause } from './scenes/Scene3Pause';
import { Scene4Reveal } from './scenes/Scene4Reveal';
import { Scene5Hold } from './scenes/Scene5Hold';

// ProductReveal — ~16.5 seconds / 495 frames at 30fps
//
// Scene 1 — The Whisper  : frames   0– 89  (3s)
// Scene 2 — The Question : frames  90–284  (6.5s) ← includes dissolve exit
// Scene 3 — The Pause    : frames 285–344  (2s)
// Scene 4 — The Reveal   : frames 345–434  (3s)
// Scene 5 — The Hold     : frames 435–494  (2s)

export const ProductReveal: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#FAF8F3' }}>
      <Sequence from={0} durationInFrames={90}>
        <Scene1Whisper />
      </Sequence>

      <Sequence from={90} durationInFrames={195}>
        <Scene2Question />
      </Sequence>

      <Sequence from={285} durationInFrames={60}>
        <Scene3Pause />
      </Sequence>

      <Sequence from={345} durationInFrames={90}>
        <Scene4Reveal />
      </Sequence>

      <Sequence from={435} durationInFrames={60}>
        <Scene5Hold />
      </Sequence>
    </AbsoluteFill>
  );
};
