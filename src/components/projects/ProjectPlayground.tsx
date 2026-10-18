"use client";

import { BloomBook } from "./BloomBook";
import { ButterflyCorner } from "./ButterflyCorner";
import { DreamGarden } from "./DreamGarden";

/** Interactive modules by `interactionId`. Only live projects get mounted. */
const PLAYGROUNDS: Record<string, () => React.ReactElement> = {
  "dream-garden": DreamGarden,
  "bloom-book": BloomBook,
  "butterfly-corner": ButterflyCorner,
};

export function ProjectPlayground({ interactionId }: { interactionId: string }) {
  const Playground = PLAYGROUNDS[interactionId];
  return Playground ? <Playground /> : null;
}
