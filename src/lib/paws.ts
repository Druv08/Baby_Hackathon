import { CHARACTER_SLUGS, type CharacterSlug } from "@/types/character";

/**
 * The one place that maps each character to its paw emblem
 * (`public/paws/`). Cursors (scripts/make-cursors.mjs) and every paw icon
 * in the UI read from here. Unknown characters get Normal Maria's paw.
 */
export const PAW_FILES: Record<CharacterSlug, string> = {
  normal: "glowing_sakura_paw_emblem.png",
  blossom: "sakura_jewel_paw_emblem.png",
  star: "celestial_gemstone_paw_emblem.png",
  cloud: "whimsical_sky_explorer_paw_emblem.png",
  aqua: "ocean_jewel_paw_emblem.png",
  inventor: "clockwork_paw_emblem.png",
  forest: "enchanted_forest_paw_emblem.png",
  melody: "celestial_sakura_paw_charm.png",
  luna: "celestial_sakura_paw_emblem.png",
};

export const DEFAULT_PAW_SLUG: CharacterSlug = "normal";

/** Public path of a character's paw, e.g. `/paws/clockwork_paw_emblem.png`. */
export function pawFor(slug: string | null | undefined): string {
  const file = PAW_FILES[slug as CharacterSlug] ?? PAW_FILES[DEFAULT_PAW_SLUG];
  return `/paws/${file}`;
}

/** Same, by character id (1 = Normal Maria … 9 = Luna). */
export function pawForCharacterId(id: number): string {
  return pawFor(CHARACTER_SLUGS[id - 1]);
}
