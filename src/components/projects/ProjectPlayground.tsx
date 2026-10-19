"use client";

import dynamic from "next/dynamic";
import { GardenThumbnail, MusicBoxThumbnail } from "@/components/melody/MelodyProjects";
const LullabyLab = dynamic(() => import("@/components/melody/MelodyProjects").then(m => m.LullabyLab));
const RhythmGarden = dynamic(() => import("@/components/melody/MelodyProjects").then(m => m.RhythmGarden));
const MoonlightMusicBox = dynamic(() => import("@/components/melody/MelodyProjects").then(m => m.MoonlightMusicBox));
const CoralCareGarden = dynamic(() => import("@/components/aqua/CoralCareGarden").then(m => m.CoralCareGarden));
const OceanDiscovery = dynamic(() => import("@/components/aqua/OceanDiscovery").then(m => m.OceanDiscovery));
const TurtlesSafePassage = dynamic(() => import("@/components/aqua/TurtlesSafePassage").then(m => m.TurtlesSafePassage));
const CloudMaker = dynamic(() => import("@/components/cloud/CloudMaker").then(m => m.CloudMaker));
const DreamDeliveryMap = dynamic(() => import("@/components/forest/DreamDeliveryMap").then(m => m.DreamDeliveryMap));
const ForestFieldGuide = dynamic(() => import("@/components/forest/ForestFieldGuide").then(m => m.ForestFieldGuide));
import { SignpostThumbnail } from "@/components/forest/SignpostWorkshop";
const SignpostWorkshop = dynamic(() => import("@/components/forest/SignpostWorkshop").then(m => m.SignpostWorkshop));
const DreamLanternLab = dynamic(() => import("@/components/inventor/DreamLanternLab").then(m => m.DreamLanternLab));
const KeepsakeCabinet = dynamic(() => import("@/components/luna/KeepsakeCabinet").then(m => m.KeepsakeCabinet));
const MemoryLanternStudio = dynamic(() => import("@/components/luna/MemoryLanternStudio").then(m => m.MemoryLanternStudio));
const MoonlitMemoryBook = dynamic(() => import("@/components/luna/MoonlitMemoryBook").then(m => m.MoonlitMemoryBook));
const LittleHelperMachines = dynamic(() => import("@/components/inventor/LittleHelperMachines").then(m => m.LittleHelperMachines));
const StarWorkshop = dynamic(() => import("@/components/inventor/StarWorkshop").then(m => m.StarWorkshop));
const CloudPostcards = dynamic(() => import("@/components/cloud/CloudPostcards").then(m => m.CloudPostcards));
const SkyRoutePlanner = dynamic(() => import("@/components/cloud/SkyRoutePlanner").then(m => m.SkyRoutePlanner));
const ConstellationBuilder = dynamic(() => import("@/components/star/ConstellationBuilder").then(m => m.ConstellationBuilder));
const DreamAtlas = dynamic(() => import("@/components/star/DreamAtlas").then(m => m.DreamAtlas));
const StargazersTelescope = dynamic(() => import("@/components/star/StargazersTelescope").then(m => m.StargazersTelescope));
const BloomBook = dynamic(() => import("./BloomBook").then(m => m.BloomBook));
const ButterflyCorner = dynamic(() => import("./ButterflyCorner").then(m => m.ButterflyCorner));
const DreamGarden = dynamic(() => import("./DreamGarden").then(m => m.DreamGarden));

/** Interactive modules by `interactionId`. Only live projects get mounted. */
const PLAYGROUNDS: Record<string, React.ComponentType> = {
  "lullaby-lab": LullabyLab,
  "rhythm-garden": RhythmGarden,
  "moonlight-music-box": MoonlightMusicBox,
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
  // Aqua Maria
  "ocean-discovery": OceanDiscovery,
  "coral-care-garden": CoralCareGarden,
  "turtles-safe-passage": TurtlesSafePassage,
  // Inventor Maria
  "star-workshop": StarWorkshop,
  "dream-lantern-lab": DreamLanternLab,
  "little-helper-machines": LittleHelperMachines,
  // Forest Maria
  "dream-delivery-map": DreamDeliveryMap,
  "forest-friends-field-guide": ForestFieldGuide,
  "whispering-signpost-workshop": SignpostWorkshop,
  // Luna Maria
  "moonlit-memory-book": MoonlitMemoryBook,
  "memory-lantern-studio": MemoryLanternStudio,
  "keepsake-cabinet": KeepsakeCabinet,
};

/**
 * Card artwork drawn by a project's own code, used only while its supplied
 * illustration is missing (a real rendering, never a placeholder emoji).
 */
const THUMBNAILS: Record<string, () => React.ReactElement> = {
  "rhythm-garden": GardenThumbnail,
  "moonlight-music-box": MusicBoxThumbnail,
  "whispering-signpost-workshop": SignpostThumbnail,
};

export function ProjectThumbnail({ interactionId }: { interactionId?: string }) {
  const Thumb = interactionId ? THUMBNAILS[interactionId] : undefined;
  return Thumb ? <Thumb /> : null;
}

export function ProjectPlayground({ interactionId }: { interactionId: string }) {
  const Playground = PLAYGROUNDS[interactionId];
  return Playground ? <Playground /> : null;
}
