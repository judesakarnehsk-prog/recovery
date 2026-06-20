import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Scene1Question } from "./scenes/Scene1Question";
import { Scene2Numbers } from "./scenes/Scene2Numbers";
import { Scene3Shift } from "./scenes/Scene3Shift";
import { Scene4Product } from "./scenes/Scene4Product";
import { Scene5Final } from "./scenes/Scene5Final";

// SmartReel — 18 seconds / 540 frames at 30fps
//
// Scene 1 — The Question : frames   0–119  (4s)
// Scene 2 — The Numbers  : frames 120–239  (4s)
// Scene 3 — The Shift    : frames 240–329  (3s)
// Scene 4 — The Product  : frames 330–449  (4s)
// Scene 5 — The Final    : frames 450–539  (3s)

export const SmartReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#F5F2EC" }}>
      <Sequence from={0} durationInFrames={120}>
        <Scene1Question />
      </Sequence>
      <Sequence from={120} durationInFrames={120}>
        <Scene2Numbers />
      </Sequence>
      <Sequence from={240} durationInFrames={90}>
        <Scene3Shift />
      </Sequence>
      <Sequence from={330} durationInFrames={120}>
        <Scene4Product />
      </Sequence>
      <Sequence from={450} durationInFrames={90}>
        <Scene5Final />
      </Sequence>
    </AbsoluteFill>
  );
};
