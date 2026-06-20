import "./index.css";
import React from "react";
import { Composition } from "remotion";
import { RevorvaReel } from "./RevorvaReel";
import { SmartReel } from "./SmartReel";
import { ProductReveal } from "./ProductReveal";
import { LaunchVideo } from "./LaunchVideo";
import { LaunchReel } from "./LaunchReel";
import { CleanLaunch } from "./CleanLaunch";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RevorvaReel"
        component={RevorvaReel}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SmartReel"
        component={SmartReel}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ProductReveal"
        component={ProductReveal}
        durationInFrames={495}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="LaunchReel"
        component={LaunchReel}
        durationInFrames={660}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CleanLaunch"
        component={CleanLaunch}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="LaunchVideo"
        component={LaunchVideo}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
