import type { FutureCharacterId, FutureSlug } from "@/types/character";

/**
 * One hidden collectible per future. Purely logical: where a secret is hidden
 * and how it animates belong to the frontend, not here.
 */
export interface SecretCollectible {
  id: string;
  futureSlug: FutureSlug;
  characterId: FutureCharacterId;
  name: string;
  unlockMessage: string;
}

export const SECRETS: readonly SecretCollectible[] = [
  { id: "golden-seed", futureSlug: "blossom", characterId: 2, name: "Golden Seed", unlockMessage: "You found the Golden Seed!" },
  { id: "hidden-constellation", futureSlug: "star", characterId: 3, name: "Hidden Constellation", unlockMessage: "You found the Hidden Constellation!" },
  { id: "secret-cloud", futureSlug: "cloud", characterId: 4, name: "Secret Rainbow Cloud", unlockMessage: "You found the Secret Rainbow Cloud!" },
  { id: "hidden-pearl", futureSlug: "aqua", characterId: 5, name: "Secret Ocean Pearl", unlockMessage: "You found the Secret Ocean Pearl!" },
  { id: "secret-gear", futureSlug: "inventor", characterId: 6, name: "Golden Cog", unlockMessage: "You found the Golden Cog!" },
  { id: "hidden-leaf", futureSlug: "forest", characterId: 7, name: "Golden Acorn", unlockMessage: "You found the Golden Acorn!" },
  { id: "secret-note", futureSlug: "melody", characterId: 8, name: "Secret Note", unlockMessage: "You found the Secret Note!" },
  { id: "memory-star", futureSlug: "luna", characterId: 9, name: "Silver Memory Key", unlockMessage: "You found the Silver Memory Key!" },
];

export const SECRET_ENDING = {
  counterLabel: `${SECRETS.length} / ${SECRETS.length} SECRETS FOUND`,
  title: "SECRET ENDING UNLOCKED",
  /** Uses the existing Normal Maria design — never a new character. */
  characterImage: "/characters/1.png",
  lines: ["Every future was always a part of me.", "Tiny paws. Infinite possibilities."],
  /** Symbolic references to all eight futures, in order. */
  symbols: SECRETS.map((s) => s.id),
} as const;
