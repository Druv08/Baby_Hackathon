import { describe, expect, it } from "vitest";

import {
  createDefaultProgress,
  getCompletedFutureCount,
  getLastVisitedForm,
  getWelcomeMessage,
  isStoryComplete,
  markStoryCompleted,
  MAX_VISITOR_NAME_LENGTH,
  parseProgress,
  PROGRESS_VERSION,
  recordDiscoveredFuture,
  setVisitorName,
} from "./model";
import { getBrowserStorage, PROGRESS_STORAGE_KEY, readProgress, writeProgress, type ProgressStorage } from "./storage";
import { createProgressStore } from "./store";

function memoryStorage(initial: Record<string, string> = {}): ProgressStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe("progress model", () => {
  it("starts empty", () => {
    expect(createDefaultProgress()).toEqual({
      version: PROGRESS_VERSION,
      visitorName: null,
      discoveredForms: [],
      completedStories: [],
      lastVisitedForm: null,
      easterEggsFound: [],
    });
  });

  it("records discovered futures without completing their stories", () => {
    const p = recordDiscoveredFuture(createDefaultProgress(), 3);
    expect(p.discoveredForms).toEqual([3]);
    expect(p.lastVisitedForm).toBe(3);
    expect(getLastVisitedForm(p)).toBe(3);
    expect(isStoryComplete(p, 3)).toBe(false);
    expect(getCompletedFutureCount(p)).toBe(0);
  });

  it("supports completing stories in any order", () => {
    let p = createDefaultProgress();
    for (const id of [9, 2, 3]) p = markStoryCompleted(p, id);
    expect(p.completedStories).toEqual([2, 3, 9]);
    expect(p.discoveredForms).toEqual([2, 3, 9]);
    expect(getCompletedFutureCount(p)).toBe(3);
    expect(isStoryComplete(p, 9)).toBe(true);
    expect(isStoryComplete(p, 4)).toBe(false);
  });

  it("ignores duplicates", () => {
    let p = markStoryCompleted(createDefaultProgress(), 5);
    const same = markStoryCompleted(p, 5);
    expect(same).toBe(p);
    p = recordDiscoveredFuture(recordDiscoveredFuture(p, 5), 5);
    expect(p.discoveredForms).toEqual([5]);
    expect(p.completedStories).toEqual([5]);
  });

  it("rejects invalid form IDs", () => {
    const p = createDefaultProgress();
    for (const id of [1, 0, 10, -2, 2.5, NaN]) {
      expect(recordDiscoveredFuture(p, id)).toBe(p);
      expect(markStoryCompleted(p, id)).toBe(p);
      expect(isStoryComplete(p, id)).toBe(false);
    }
  });

  it("sanitizes the visitor name", () => {
    const p = createDefaultProgress();
    expect(setVisitorName(p, "  Druv \n ").visitorName).toBe("Druv");
    expect(setVisitorName(p, "   ").visitorName).toBeNull();
    expect(setVisitorName(p, "x".repeat(100)).visitorName).toHaveLength(MAX_VISITOR_NAME_LENGTH);
  });

  it("builds a returning-visitor message", () => {
    let p = createDefaultProgress();
    expect(getWelcomeMessage(p)).toBeNull();
    for (const id of [2, 5, 9]) p = recordDiscoveredFuture(p, id);
    expect(getWelcomeMessage(p)).toBe("Welcome back! You've explored three of Maria's eight possible futures.");
    p = setVisitorName(p, "Mia");
    expect(getWelcomeMessage(p)).toBe("Welcome back, Mia! You've explored three of Maria's eight possible futures.");
  });
});

describe("parseProgress (restoring saved data)", () => {
  it("falls back to defaults for unusable input", () => {
    for (const raw of [null, undefined, 42, "text", [], { version: "1" }]) {
      expect(parseProgress(raw)).toEqual(createDefaultProgress());
    }
  });

  it("deduplicates, sorts and drops unknown IDs", () => {
    const p = parseProgress({
      version: 1,
      visitorName: 7,
      discoveredForms: [4, 4, 2, 1, 99, "3", null],
      completedStories: [6, 6, 0],
      lastVisitedForm: 1,
      easterEggsFound: [8, 8, 12],
    });
    expect(p).toEqual({
      version: 1,
      visitorName: null,
      discoveredForms: [2, 4, 6],
      completedStories: [6],
      lastVisitedForm: null,
      easterEggsFound: [8],
    });
  });

  it("handles versions", () => {
    const saved = { discoveredForms: [3], completedStories: [], easterEggsFound: [] };
    expect(parseProgress({ ...saved, version: 1 }).discoveredForms).toEqual([3]);
    // Missing version: treated as current and repaired.
    expect(parseProgress(saved).discoveredForms).toEqual([3]);
    // Newer or invalid version: can't be trusted, start fresh.
    expect(parseProgress({ ...saved, version: PROGRESS_VERSION + 1 })).toEqual(createDefaultProgress());
    expect(parseProgress({ ...saved, version: 0 })).toEqual(createDefaultProgress());
  });
});

describe("storage", () => {
  it("is SSR-safe: no window means no storage and default progress", () => {
    expect(typeof window).toBe("undefined");
    expect(getBrowserStorage()).toBeNull();
    expect(readProgress(null)).toEqual(createDefaultProgress());
    expect(writeProgress(null, createDefaultProgress())).toBe(false);

    const store = createProgressStore();
    expect(store.getServerSnapshot()).toEqual(createDefaultProgress());
    expect(() => store.discoverFuture(2)).not.toThrow();
  });

  it("recovers from corrupted JSON", () => {
    const storage = memoryStorage({ [PROGRESS_STORAGE_KEY]: "{not json" });
    expect(readProgress(storage)).toEqual(createDefaultProgress());
  });

  it("survives storage that throws", () => {
    const broken: ProgressStorage = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: () => {
        throw new Error("SecurityError");
      },
    };
    expect(readProgress(broken)).toEqual(createDefaultProgress());
    expect(writeProgress(broken, createDefaultProgress())).toBe(false);
    const store = createProgressStore(() => broken);
    store.discoverFuture(4);
    expect(store.getSnapshot().discoveredForms).toEqual([4]); // still works in memory
    expect(() => store.reset()).not.toThrow();
  });
});

describe("progress store", () => {
  it("persists across reloads and resets on request", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    store.setVisitorName("Mia");
    store.discoverFuture(7);
    store.completeStory(9);

    const reloaded = createProgressStore(() => storage).getSnapshot();
    expect(reloaded.visitorName).toBe("Mia");
    expect(reloaded.discoveredForms).toEqual([7, 9]);
    expect(reloaded.completedStories).toEqual([9]);
    expect(reloaded.lastVisitedForm).toBe(7);

    store.reset();
    expect(store.getSnapshot()).toEqual(createDefaultProgress());
    expect(storage.data.has(PROGRESS_STORAGE_KEY)).toBe(false);
    expect(createProgressStore(() => storage).getSnapshot()).toEqual(createDefaultProgress());
  });

  it("notifies subscribers only when progress changes and keeps snapshots stable", () => {
    const store = createProgressStore(() => memoryStorage());
    let calls = 0;
    const unsubscribe = store.subscribe(() => calls++);
    const before = store.getSnapshot();
    expect(store.getSnapshot()).toBe(before);
    store.discoverFuture(2);
    store.discoverFuture(2);
    store.discoverFuture(1); // invalid
    expect(calls).toBe(1);
    unsubscribe();
    store.discoverFuture(3);
    expect(calls).toBe(1);
  });
});
