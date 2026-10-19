import { describe, expect, it } from "vitest";

import { getSecretForFuture, getSecretCount, isSecretCollected, isSecretEndingUnlocked } from "@/lib/easter-eggs";
import { isStoryComplete } from "./model";
import { PROGRESS_STORAGE_KEY, type ProgressStorage } from "./storage";
import { createProgressStore } from "./store";

function memoryStorage(): ProgressStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe("Blossom's Golden Seed", () => {
  it("is the secret for future 2", () => {
    expect(getSecretForFuture("blossom")).toMatchObject({
      id: "golden-seed",
      characterId: 2,
      name: "Golden Seed",
      unlockMessage: "You found the Golden Seed!",
    });
  });

  it("can be collected once, and survives a reload", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    const seed = getSecretForFuture("blossom")!;

    expect(store.collectSecret(seed.id)).toBe("collected");
    expect(store.collectSecret(seed.id)).toBe("already-collected");
    expect(getSecretCount(store.getSnapshot())).toBe(1);
    expect(store.getSnapshot().easterEggsFound).toEqual([2]);

    const reloaded = createProgressStore(() => storage).getSnapshot();
    expect(isSecretCollected(reloaded, seed.id)).toBe(true);
    expect(getSecretCount(reloaded)).toBe(1);
    expect(isSecretEndingUnlocked(reloaded)).toBe(false);
    expect([...storage.data.keys()]).toEqual([PROGRESS_STORAGE_KEY]);
  });
});

describe("Blossom story completion", () => {
  it("records only Blossom's story, and persists", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    store.discoverFuture(2); // opening the hero
    expect(isStoryComplete(store.getSnapshot(), 2)).toBe(false);

    store.completeStory(2); // reaching scene 5
    const reloaded = createProgressStore(() => storage).getSnapshot();
    expect(isStoryComplete(reloaded, 2)).toBe(true);
    expect(reloaded.completedStories).toEqual([2]);
    for (const other of [3, 4, 5, 6, 7, 8, 9]) expect(isStoryComplete(reloaded, other)).toBe(false);
  });
});
