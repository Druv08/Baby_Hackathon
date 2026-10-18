import { collectSecret, type CollectResult } from "@/lib/easter-eggs";
import {
  createDefaultProgress,
  markStoryCompleted,
  recordDiscoveredFuture,
  setVisitorName,
  type JourneyProgress,
} from "./model";
import {
  clearProgress,
  getBrowserStorage,
  PROGRESS_STORAGE_KEY,
  readProgress,
  writeProgress,
  type ProgressStorage,
} from "./storage";

/**
 * Single source of truth for visitor progress, shaped for React's
 * `useSyncExternalStore`. Storage is read lazily on first client access, so
 * nothing touches `localStorage` during server rendering.
 */
export interface ProgressStore {
  subscribe(listener: () => void): () => void;
  getSnapshot(): JourneyProgress;
  /** Stable defaults used for SSR and hydration to avoid mismatches. */
  getServerSnapshot(): JourneyProgress;

  discoverFuture(futureId: number): void;
  completeStory(futureId: number): void;
  setVisitorName(name: string | null): void;
  collectSecret(secretId: string): CollectResult;
  reset(): void;
}

const SERVER_SNAPSHOT = createDefaultProgress();

export function createProgressStore(getStorage: () => ProgressStorage | null = getBrowserStorage): ProgressStore {
  let state: JourneyProgress | null = null;
  let storage: ProgressStorage | null | undefined;
  const listeners = new Set<() => void>();

  const store = () => (storage === undefined ? (storage = getStorage()) : storage);
  const current = () => (state ??= readProgress(store()));

  const commit = (next: JourneyProgress) => {
    if (next === current()) return;
    state = next;
    writeProgress(store(), next);
    listeners.forEach((l) => l());
  };

  // Keep tabs in sync when another tab changes progress.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== PROGRESS_STORAGE_KEY) return;
    state = readProgress(store());
    listeners.forEach((l) => l());
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1 && typeof window !== "undefined") window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== "undefined") window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot: current,
    getServerSnapshot: () => SERVER_SNAPSHOT,

    discoverFuture: (id) => commit(recordDiscoveredFuture(current(), id)),
    completeStory: (id) => commit(markStoryCompleted(current(), id)),
    setVisitorName: (name) => commit(setVisitorName(current(), name)),
    collectSecret(secretId) {
      const { progress, result } = collectSecret(current(), secretId);
      commit(progress);
      return result;
    },
    reset() {
      clearProgress(store());
      state = createDefaultProgress();
      listeners.forEach((l) => l());
    },
  };
}

/** App-wide store backed by `localStorage`. */
export const progressStore = createProgressStore();
