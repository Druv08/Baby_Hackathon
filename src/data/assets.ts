import type { AssetPath } from "@/types/character";

/**
 * Asset files that have actually been supplied and committed under `/public`.
 * Content may *declare* any well-formed path, but the frontend should only
 * render paths listed here. `src/lib/assets.test.ts` checks every entry exists
 * on disk, so add a path here only after adding the file.
 */
export const VERIFIED_ASSETS: ReadonlySet<AssetPath> = new Set<AssetPath>([
  // Locked character designs — never alter, recolor, rename or replace.
  "/characters/1.png",
  "/characters/2.png",
  "/characters/3.png",
  "/characters/4.png",
  "/characters/5.png",
  "/characters/6.png",
  "/characters/7.png",
  "/characters/8.png",
  "/characters/9.png",

  // Hero / landing screens.
  "/heroes/maria-background.png",
  "/heroes/blossom-story-cover.png",
  "/heroes/blossom.png",
  "/heroes/star.png",
  "/heroes/cloud.png",
  "/heroes/aqua.png",
  "/heroes/inventor.png",
  "/heroes/forest.png",
  "/heroes/melody.png",
  "/heroes/luna.png",

  // Blossom story scenes (scenes 1–4: Normal Maria, scene 5: Blossom Maria).
  "/stories/blossom/scene-1.png",
  "/stories/blossom/scene-2.png",
  "/stories/blossom/scene-3.png",
  "/stories/blossom/scene-4.png",
  "/stories/blossom/scene-5.png",

  // Blossom story-world landscape (no characters, no text).
  "/stories/blossom/background.png",

  // Blossom project artwork.
  "/projects/blossom/dream-garden.png",
  "/projects/blossom/bloom-book.png",
  "/projects/blossom/butterfly-corner.png",

  // Star story scenes (1–4: Normal Maria, 5: Star Maria) and observatory world.
  "/stories/star/scene-1.png",
  "/stories/star/scene-2.png",
  "/stories/star/scene-3.png",
  "/stories/star/scene-4.png",
  "/stories/star/scene-5.png",
  "/stories/star/background.png",

  // Star project artwork.
  "/projects/star/constellation-builder.png",
  "/projects/star/dream-atlas.png",
  "/projects/star/stargazers-telescope.png",

  // Cloud story scenes (1–4: Normal Maria, 5: Cloud Maria) and sky-island world.
  "/stories/cloud/scene-1.png",
  "/stories/cloud/scene-2.png",
  "/stories/cloud/scene-3.png",
  "/stories/cloud/scene-4.png",
  "/stories/cloud/scene-5.png",
  "/stories/cloud/background.png",

  // Cloud project artwork.
  "/projects/cloud/cloud-maker.png",
  "/projects/cloud/sky-route-planner.png",
  "/projects/cloud/cloud-postcards.png",

  // Aqua story scenes (1–4: Normal Maria, 5: Aqua Maria) and underwater world.
  // Scenes and project art are 1448×1086 (4:3); the background is 1672×941.
  "/stories/aqua/scene-1.png",
  "/stories/aqua/scene-2.png",
  "/stories/aqua/scene-3.png",
  "/stories/aqua/scene-4.png",
  "/stories/aqua/scene-5.png",
  "/stories/aqua/background.png",

  // Aqua project artwork.
  "/projects/aqua/ocean-discovery.png",
  "/projects/aqua/coral-care-garden.png",
  "/projects/aqua/turtles-safe-passage.png",

  // Inventor story scenes (1–4: Normal Maria, 5: Inventor Maria) and workshop world.
  "/stories/inventor/scene-1.png",
  "/stories/inventor/scene-2.png",
  "/stories/inventor/scene-3.png",
  "/stories/inventor/scene-4.png",
  "/stories/inventor/scene-5.png",
  "/stories/inventor/background.png",

  // Inventor project artwork.
  "/projects/inventor/star-workshop.png",
  "/projects/inventor/dream-lantern-lab.png",
  "/projects/inventor/little-helper-machines.png",

  // Forest story scenes 1–4 (Normal Maria) and the Whispering Forest world.
  // Not yet supplied (do not register until the files exist):
  //   /stories/forest/scene-5.png  (Forest Maria reveal)
  "/stories/forest/scene-1.png",
  "/stories/forest/scene-2.png",
  "/stories/forest/scene-3.png",
  "/stories/forest/scene-4.png",
  "/stories/forest/background.png",

  // Forest project artwork.
  "/projects/forest/dream-delivery-map.png",
  "/projects/forest/forest-friends-field-guide.png",
  "/projects/forest/whispering-signpost-workshop.png",
  // Melody supplied images; unrelated project art retains descriptive names.
  "/stories/melody/scene-1.png",
  "/stories/melody/scene-2.png",
  "/stories/melody/scene-3.png",
  "/stories/melody/scene-4.png",
  "/stories/melody/scene-5.png",
  "/stories/melody/background.png",
  "/projects/melody/lullaby-lab.png",
  "/projects/melody/supplied-performance.png",
  "/projects/melody/supplied-dream-songbook.png",

  // Luna story scenes 1–4 (Normal Maria) and the Moonlit Village of Memories.
  // Not yet supplied (do not register until the file exists):
  //   /stories/luna/scene-5.png  (Luna Maria reveal)
  "/stories/luna/scene-1.png",
  "/stories/luna/scene-2.png",
  "/stories/luna/scene-3.png",
  "/stories/luna/scene-4.png",
  "/stories/luna/background.png",

  // Luna project artwork (1448×1086).
  "/projects/luna/moonlit-memory-book.png",
  "/projects/luna/memory-lantern-studio.png",
  "/projects/luna/keepsake-cabinet.png",
]);

export function isAssetVerified(path: string | undefined): path is AssetPath {
  return path !== undefined && VERIFIED_ASSETS.has(path as AssetPath);
}
