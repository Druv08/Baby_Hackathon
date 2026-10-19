import type { CharacterSlug } from "@/types/character";

export const TRAILS: Record<CharacterSlug, { glyph: string; color: string; name: string }> = {
  normal: { glyph: "✿", color: "#df6d9d", name: "Pink flowers" },
  blossom: { glyph: "❀", color: "#e683ae", name: "Petals" },
  star: { glyph: "★", color: "#dfac36", name: "Golden stars" },
  cloud: { glyph: "☁", color: "#77b7de", name: "Tiny clouds" },
  aqua: { glyph: "○", color: "#4ab7c9", name: "Bubbles" },
  inventor: { glyph: "✧", color: "#d28b3d", name: "Mechanical sparks" },
  forest: { glyph: "❧", color: "#609753", name: "Leaves" },
  melody: { glyph: "♪", color: "#aa65be", name: "Musical notes" },
  luna: { glyph: "✦", color: "#a28be0", name: "Moonlit sparkles" },
};

export const TRAIL_PARTICLE_LIMIT = 24;
export const TRAIL_LIFETIME_MS = 650;

/** Fixed-width reels preserve leading zeroes without inventing a count. */
export function counterDigits(count: number, width = 6): string[] {
  return String(Math.max(0, Math.trunc(count))).padStart(width, "0").split("");
}
