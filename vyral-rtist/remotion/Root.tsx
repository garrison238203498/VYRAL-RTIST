import React from "react";
import { Composition } from "remotion";
import { KoiDiveScene, LegacyMemoryScene, RotistTraceScene, SpaceBloomScene } from "./scenes";

export function RemotionRoot() {
  return (
    <>
      <Composition id="SpaceBloomScene" component={SpaceBloomScene} durationInFrames={180} fps={30} width={1080} height={1920} />
      <Composition id="KoiDiveScene" component={KoiDiveScene} durationInFrames={240} fps={30} width={1080} height={1920} />
      <Composition id="RotistTraceScene" component={RotistTraceScene} durationInFrames={210} fps={30} width={1080} height={1920} />
      <Composition id="LegacyMemoryScene" component={LegacyMemoryScene} durationInFrames={150} fps={30} width={1080} height={1920} />
    </>
  );
}
