"use client";

import { CloudMaker } from "@/components/cloud/CloudMaker";
import { CloudPostcards } from "@/components/cloud/CloudPostcards";
import { SkyRoutePlanner } from "@/components/cloud/SkyRoutePlanner";
import { ConstellationBuilder } from "@/components/star/ConstellationBuilder";
import { DreamAtlas } from "@/components/star/DreamAtlas";
import { StargazersTelescope } from "@/components/star/StargazersTelescope";
import { BloomBook } from "./BloomBook";
import { ButterflyCorner } from "./ButterflyCorner";
import { DreamGarden } from "./DreamGarden";

/** Interactive modules by `interactionId`. Only live projects get mounted. */
const PLAYGROUNDS: Record<string, () => React.ReactElement> = {
  "dream-garden": DreamGarden,
  "bloom-book": BloomBook,
  "butterfly-corner": ButterflyCorner,
  // Star Maria
  "constellation-builder": ConstellationBuilder,
  "dream-atlas": DreamAtlas,
  "stargazers-telescope": StargazersTelescope,
  // Cloud Maria
  "cloud-maker": CloudMaker,
  "sky-route-planner": SkyRoutePlanner,
  "cloud-postcards": CloudPostcards,
};

export function ProjectPlayground({ interactionId }: { interactionId: string }) {
  const Playground = PLAYGROUNDS[interactionId];
  return Playground ? <Playground /> : null;
}
