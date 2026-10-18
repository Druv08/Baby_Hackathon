/** Public asset path served from `/public`, e.g. `/characters/1.png`. */
export type AssetPath = `/${string}`;

export const CHARACTER_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export type CharacterId = (typeof CHARACTER_IDS)[number];

export const CHARACTER_SLUGS = [
  "normal",
  "blossom",
  "star",
  "cloud",
  "aqua",
  "inventor",
  "forest",
  "melody",
  "luna",
] as const;
export type CharacterSlug = (typeof CHARACTER_SLUGS)[number];

/** Normal Maria — every future's origin story starts with her. */
export const NORMAL_MARIA_ID = 1 as const;

/** Characters 2–9: the eight possible futures. */
export type FutureCharacterId = Exclude<CharacterId, typeof NORMAL_MARIA_ID>;
export type FutureSlug = Exclude<CharacterSlug, "normal">;

/**
 * A locked character design. `characterImage` points at the canonical
 * `/characters/{id}.png` file, which must never be altered or replaced.
 */
export interface Character {
  id: CharacterId;
  slug: CharacterSlug;
  name: string;
  profession: string;
  tagline?: string;
  description?: string;
  characterImage: AssetPath;
}
