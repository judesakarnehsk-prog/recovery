import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Scene1Problem } from "./scenes/Scene1Problem";
import { Scene2Transition } from "./scenes/Scene2Transition";
import { Scene3Solution } from "./scenes/Scene3Solution";
import { Scene4Result } from "./scenes/Scene4Result";
import { Scene5Brand } from "./scenes/Scene5Brand";

// Scene timing (30fps)
// Scene 1:  0–89    (3s)   frames 0–89
// Scene 2:  90–179  (3s)   frames 90–179
// Scene 3:  180–299 (4s)   frames 180–299
// Scene 4:  300–389 (3s)   frames 300–389
// Scene 5:  390–449 (2s)   frames 390–449

export const RevorvaReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#F5F2EC" }}>
      <Sequence from={0} durationInFrames={90}>
        <Scene1Problem />
      </Sequence>
      <Sequence from={90} durationInFrames={90}>
        <Scene2Transition />
      </Sequence>
      <Sequence from={180} durationInFrames={120}>
        <Scene3Solution />
      </Sequence>
      <Sequence from={300} durationInFrames={90}>
        <Scene4Result />
      </Sequence>
      <Sequence from={390} durationInFrames={60}>
        <Scene5Brand />
      </Sequence>
    </AbsoluteFill>
  );
};
