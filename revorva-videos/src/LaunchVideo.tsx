import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Scene1Opening } from './scenes/Scene1Opening';
import { Scene2Problem } from './scenes/Scene2Problem';
import { Scene3Pivot } from './scenes/Scene3Pivot';
import { Scene4Dashboard } from './scenes/Scene4Dashboard';
import { Scene5Features } from './scenes/Scene5Features';
import { Scene6Pricing } from './scenes/Scene6Pricing';
import { Scene7Brand } from './scenes/Scene7Brand';

// LaunchVideo — 25 seconds / 750 frames at 30fps
// 1080x1080 square format
//
// Scene 1 — Opening   :   0– 89  (3s)
// Scene 2 — Problem   :  90–209  (4s)
// Scene 3 — Pivot     : 210–329  (4s)
// Scene 4 — Dashboard : 330–479  (5s)
// Scene 5 — Features  : 480–599  (4s)
// Scene 6 — Pricing   : 600–689  (3s)
// Scene 7 — Brand     : 690–749  (2s hold)

export const LaunchVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#FAF8F3' }}>
      <Sequence from={0} durationInFrames={90}>
        <Scene1Opening />
      </Sequence>

      <Sequence from={90} durationInFrames={120}>
        <Scene2Problem />
      </Sequence>

      <Sequence from={210} durationInFrames={120}>
        <Scene3Pivot />
      </Sequence>

      <Sequence from={330} durationInFrames={150}>
        <Scene4Dashboard />
      </Sequence>

      <Sequence from={480} durationInFrames={120}>
        <Scene5Features />
      </Sequence>

      <Sequence from={600} durationInFrames={90}>
        <Scene6Pricing />
      </Sequence>

      <Sequence from={690} durationInFrames={60}>
        <Scene7Brand />
      </Sequence>
    </AbsoluteFill>
  );
};
