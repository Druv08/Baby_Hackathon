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

  // Blossom project artwork. (No Bloom Book or story-background art supplied yet.)
  "/projects/blossom/dream-garden.png",
  "/projects/blossom/butterfly-corner.png",
]);

export function isAssetVerified(path: string | undefined): path is AssetPath {
  return path !== undefined && VERIFIED_ASSETS.has(path as AssetPath);
}
