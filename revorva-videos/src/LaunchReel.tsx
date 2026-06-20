import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Scene1Notifications } from './scenes/Scene1Notifications';
import { Scene2Counter } from './scenes/Scene2Counter';
import { Scene3Pivot } from './scenes/Scene3Pivot';
import { Scene4Dashboard } from './scenes/Scene4Dashboard';
import { Scene5Features } from './scenes/Scene5Features';
import { Scene6PauseDemo } from './scenes/Scene6PauseDemo';
import { Scene7Stats } from './scenes/Scene7Stats';
import { Scene8CTA } from './scenes/Scene8CTA';
import { Scene9Brand } from './scenes/Scene9Brand';

// LaunchReel — 22 seconds / 660 frames at 30fps
// 1080×1920 vertical (9:16)
//
// Scene 1 — Notifications :   0– 59  (2s)
// Scene 2 — Counter       :  60–119  (2s)
// Scene 3 — Pivot         : 120–179  (2s)
// Scene 4 — Dashboard     : 180–269  (3s)
// Scene 5 — Features      : 270–359  (3s)
// Scene 6 — Pause Demo    : 360–449  (3s)
// Scene 7 — Stats         : 450–539  (3s)
// Scene 8 — CTA           : 540–599  (2s)
// Scene 9 — Brand hold    : 600–659  (2s)

export const LaunchReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#FAF8F3' }}>
      <Sequence from={0}   durationInFrames={60}><Scene1Notifications /></Sequence>
      <Sequence from={60}  durationInFrames={60}><Scene2Counter /></Sequence>
      <Sequence from={120} durationInFrames={60}><Scene3Pivot /></Sequence>
      <Sequence from={180} durationInFrames={90}><Scene4Dashboard /></Sequence>
      <Sequence from={270} durationInFrames={90}><Scene5Features /></Sequence>
      <Sequence from={360} durationInFrames={90}><Scene6PauseDemo /></Sequence>
      <Sequence from={450} durationInFrames={90}><Scene7Stats /></Sequence>
      <Sequence from={540} durationInFrames={60}><Scene8CTA /></Sequence>
      <Sequence from={600} durationInFrames={60}><Scene9Brand /></Sequence>
    </AbsoluteFill>
  );
};
