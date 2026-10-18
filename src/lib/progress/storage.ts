import { createDefaultProgress, parseProgress, type JourneyProgress } from "./model";

export const PROGRESS_STORAGE_KEY = "maria:journey-progress";

/** The subset of the Web Storage API we use; lets tests inject a fake. */
export type ProgressStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * Returns `localStorage` in the browser, or `null` during server rendering or
 * when storage is blocked (private mode, disabled cookies, sandboxed iframes).
 */
export function getBrowserStorage(): ProgressStorage | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    const probe = `${PROGRESS_STORAGE_KEY}:probe`;
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function readProgress(storage: ProgressStorage | null): JourneyProgress {
  if (!storage) return createDefaultProgress();
  try {
    const raw = storage.getItem(PROGRESS_STORAGE_KEY);
    return raw === null ? createDefaultProgress() : parseProgress(JSON.parse(raw));
  } catch {
    // Malformed JSON or a storage read error: start fresh rather than crash.
    return createDefaultProgress();
  }
}

/** Returns false if the write failed (e.g. quota exceeded); progress stays in memory. */
export function writeProgress(storage: ProgressStorage | null, progress: JourneyProgress): boolean {
  if (!storage) return false;
  try {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function clearProgress(storage: ProgressStorage | null): void {
  try {
    storage?.removeItem(PROGRESS_STORAGE_KEY);
  } catch {
    // Nothing else to do if storage refuses.
  }
}
