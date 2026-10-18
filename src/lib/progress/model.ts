import { CHARACTER_IDS, NORMAL_MARIA_ID, type FutureCharacterId } from "@/types/character";

/**
 * Visitor progress. All ID lists hold future character IDs (2–9);
 * `easterEggsFound` holds the ID of the future whose secret was found.
 */
export interface JourneyProgress {
  version: number;
  visitorName: string | null;
  discoveredForms: FutureCharacterId[];
  completedStories: FutureCharacterId[];
  lastVisitedForm: FutureCharacterId | null;
  easterEggsFound: FutureCharacterId[];
}

export const PROGRESS_VERSION = 1;
export const MAX_VISITOR_NAME_LENGTH = 30;

export const FUTURE_IDS = CHARACTER_IDS.filter(
  (id): id is FutureCharacterId => id !== NORMAL_MARIA_ID,
);

export function isFutureId(value: unknown): value is FutureCharacterId {
  return typeof value === "number" && (FUTURE_IDS as readonly number[]).includes(value);
}

export function createDefaultProgress(): JourneyProgress {
  return {
    version: PROGRESS_VERSION,
    visitorName: null,
    discoveredForms: [],
    completedStories: [],
    lastVisitedForm: null,
    easterEggsFound: [],
  };
}

/** Trims, strips control characters and caps length. Empty → null. */
export function sanitizeVisitorName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const clean = name.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
  return clean === "" ? null : clean.slice(0, MAX_VISITOR_NAME_LENGTH);
}

/** Keeps only known future IDs, deduplicated and sorted. */
function cleanIds(value: unknown): FutureCharacterId[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(isFutureId))].sort((a, b) => a - b);
}

/**
 * Restores progress from untrusted data (e.g. parsed localStorage JSON).
 * Never throws; unusable input yields fresh default progress. Individual
 * fields are repaired rather than discarding the whole save.
 *
 * Hand-rolled instead of Zod so the client bundle stays small.
 */
export function parseProgress(raw: unknown): JourneyProgress {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return createDefaultProgress();
  const data = raw as Record<string, unknown>;

  // A missing version is treated as current; saves from a newer schema
  // can't be interpreted safely.
  const version = data.version ?? PROGRESS_VERSION;
  if (!Number.isInteger(version) || (version as number) > PROGRESS_VERSION || (version as number) < 1) {
    return createDefaultProgress();
  }

  const completedStories = cleanIds(data.completedStories);
  return {
    version: PROGRESS_VERSION,
    visitorName: sanitizeVisitorName(data.visitorName),
    // A completed story implies its future was discovered.
    discoveredForms: cleanIds([...cleanIds(data.discoveredForms), ...completedStories]),
    completedStories,
    lastVisitedForm: isFutureId(data.lastVisitedForm) ? data.lastVisitedForm : null,
    easterEggsFound: cleanIds(data.easterEggsFound),
  };
}

// ── Pure operations. Each returns a new object; the input is never mutated.
// Unknown IDs leave progress unchanged, and the same object is returned when
// nothing changed so callers can skip saving.

function addId(list: FutureCharacterId[], id: FutureCharacterId): FutureCharacterId[] {
  return list.includes(id) ? list : [...list, id].sort((a, b) => a - b);
}

export function recordDiscoveredFuture(progress: JourneyProgress, id: number): JourneyProgress {
  if (!isFutureId(id)) return progress;
  if (progress.discoveredForms.includes(id) && progress.lastVisitedForm === id) return progress;
  return { ...progress, discoveredForms: addId(progress.discoveredForms, id), lastVisitedForm: id };
}

/** Call when the visitor reaches the end of a story — not when they open the hero. */
export function markStoryCompleted(progress: JourneyProgress, id: number): JourneyProgress {
  if (!isFutureId(id) || progress.completedStories.includes(id)) return progress;
  return {
    ...progress,
    completedStories: addId(progress.completedStories, id),
    discoveredForms: addId(progress.discoveredForms, id),
  };
}

export function setVisitorName(progress: JourneyProgress, name: string | null): JourneyProgress {
  const visitorName = sanitizeVisitorName(name);
  return visitorName === progress.visitorName ? progress : { ...progress, visitorName };
}

export function recordEasterEgg(progress: JourneyProgress, id: number): JourneyProgress {
  if (!isFutureId(id) || progress.easterEggsFound.includes(id)) return progress;
  return { ...progress, easterEggsFound: addId(progress.easterEggsFound, id) };
}

export function isStoryComplete(progress: JourneyProgress, id: number): boolean {
  return isFutureId(id) && progress.completedStories.includes(id);
}

export function getCompletedFutureCount(progress: JourneyProgress): number {
  return progress.completedStories.length;
}

export function getLastVisitedForm(progress: JourneyProgress): FutureCharacterId | null {
  return progress.lastVisitedForm;
}

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];

/** Returning-visitor greeting, or `null` for first-time visitors. */
export function getWelcomeMessage(progress: JourneyProgress): string | null {
  const explored = progress.discoveredForms.length;
  if (explored === 0) return null;
  const greeting = progress.visitorName ? `Welcome back, ${progress.visitorName}!` : "Welcome back!";
  return explored === FUTURE_IDS.length
    ? `${greeting} You've explored all eight of Maria's possible futures.`
    : `${greeting} You've explored ${NUMBER_WORDS[explored]} of Maria's eight possible futures.`;
}
