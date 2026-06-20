import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Scene1Silence } from './scenes/Scene1Silence';
import { Scene2Pain } from './scenes/Scene2Pain';
import { Scene3Turn } from './scenes/Scene3Turn';
import { Scene4Product } from './scenes/Scene4Product';
import { Scene5Proof } from './scenes/Scene5Proof';
import { Scene6Brand } from './scenes/Scene6Brand';

// Scene timing (30fps, 600 frames total = 20s)
// Scene 1 — The Silence Before:  0–119   (4s, frames 0–119)
// Scene 2 — The Pain:           120–239  (4s, frames 120–239)
// Scene 3 — The Turn:           240–329  (3s, frames 240–329)
// Scene 4 — The Product:        330–449  (4s, frames 330–449)
// Scene 5 — The Proof:          450–509  (2s, frames 450–509)
// Scene 6 — The Brand:          510–599  (3s, frames 510–599)

export const CinematicReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <Sequence from={0} durationInFrames={120}>
        <Scene1Silence />
      </Sequence>

      <Sequence from={120} durationInFrames={120}>
        <Scene2Pain />
      </Sequence>

      <Sequence from={240} durationInFrames={90}>
        <Scene3Turn />
      </Sequence>

      <Sequence from={330} durationInFrames={120}>
        <Scene4Product />
      </Sequence>

      <Sequence from={450} durationInFrames={60}>
        <Scene5Proof />
      </Sequence>

      <Sequence from={510} durationInFrames={90}>
        <Scene6Brand />
      </Sequence>
    </AbsoluteFill>
  );
};
