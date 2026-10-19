import type { PublicMemory } from "@/types/api";
import type { FutureSlug } from "@/types/character";

/**
 * Pure helpers shared by the Memory Book page and Luna's Moonlit Memory Book.
 * Both read and write the one moderated `/api/memories` backend; only
 * memories the API returns (approved ones) are ever shown.
 */

export type FutureFilter = FutureSlug | "all";

export const RECEIVED_MESSAGE =
  "Your little memory has been received! Once it's approved, your lantern will join the others in Maria's sky.";

/** Friendly copy for the API's error responses (429 rate limit, 503 unavailable, offline…). */
export function sendErrorMessage(status: number, fallback: string): string {
  if (status === 429) return "Lots of memories are arriving right now. Please wait a few minutes and try again.";
  if (status === 503) return "The Memory Book is resting right now. Please try again a little later.";
  if (status === 0) return "You seem to be offline. Your memory hasn’t been sent yet.";
  return fallback;
}

/** Appends an older page, skipping any memory already shown. */
export function mergePages(shown: readonly PublicMemory[], page: readonly PublicMemory[]): PublicMemory[] {
  const seen = new Set(shown.map((m) => m.id));
  return [...shown, ...page.filter((m) => !seen.has(m.id))];
}

export function filterByFuture(memories: readonly PublicMemory[], filter: FutureFilter): PublicMemory[] {
  return filter === "all" ? [...memories] : memories.filter((m) => m.formSlug === filter);
}

/** One memory to feature, chosen from those already loaded; null when there are none. */
export function pickFeatured(memories: readonly PublicMemory[], random: () => number = Math.random): PublicMemory | null {
  if (memories.length === 0) return null;
  return memories[Math.min(memories.length - 1, Math.floor(random() * memories.length))];
}

/** e.g. "12 October 2026"; an unreadable date is left out rather than shown wrong. */
export function formatMemoryDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date);
}
