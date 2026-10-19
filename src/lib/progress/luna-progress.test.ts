import { describe, expect, it } from "vitest";

import { SECRETS } from "@/data/secrets";
import { getSecretForFuture, getSecretCount, isSecretCollected, isSecretEndingUnlocked } from "@/lib/easter-eggs";
import { isStoryComplete } from "./model";
import type { ProgressStorage } from "./storage";
import { createProgressStore } from "./store";

function memoryStorage(): ProgressStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe("Luna's Silver Memory Key", () => {
  it("is the registered secret for future 9, with its existing string id (not the number 9)", () => {
    expect(getSecretForFuture("luna")).toEqual({
      id: "memory-star",
      futureSlug: "luna",
      characterId: 9,
      name: "Silver Memory Key",
      unlockMessage: "You found the Silver Memory Key!",
    });
  });

  it("is the only Luna secret, and every secret id is still unique", () => {
    expect(SECRETS.filter((s) => s.futureSlug === "luna")).toHaveLength(1);
    expect(new Set(SECRETS.map((s) => s.id)).size).toBe(SECRETS.length);
    expect(SECRETS).toHaveLength(8);
  });

  it("unlocks once, never double-counts, and survives a reload", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    expect(store.collectSecret("memory-star")).toBe("collected");
    expect(store.collectSecret("memory-star")).toBe("already-collected");
    expect(getSecretCount(store.getSnapshot())).toBe(1);
    const reloaded = createProgressStore(() => storage).getSnapshot();
    expect(isSecretCollected(reloaded, "memory-star")).toBe(true);
    expect(reloaded.easterEggsFound).toEqual([9]);
  });
});

describe("The global 8/8 secret ending", () => {
  it("does not unlock just because Luna's story is complete", () => {
    const store = createProgressStore(() => memoryStorage());
    store.discoverFuture(9);
    store.completeStory(9);
    store.collectSecret("memory-star");
    expect(isSecretEndingUnlocked(store.getSnapshot())).toBe(false);
  });

  it("unlocks only when all eight secrets are found, in any order, and repeats don't matter", () => {
    const store = createProgressStore(() => memoryStorage());
    const ids = SECRETS.map((s) => s.id).reverse();
    for (const id of ids.slice(0, 7)) store.collectSecret(id);
    store.collectSecret(ids[0]);
    expect(getSecretCount(store.getSnapshot())).toBe(7);
    expect(isSecretEndingUnlocked(store.getSnapshot())).toBe(false);
    store.collectSecret(ids[7]);
    expect(getSecretCount(store.getSnapshot())).toBe(8);
    expect(isSecretEndingUnlocked(store.getSnapshot())).toBe(true);
  });
});

describe("Luna story completion", () => {
  it("completes only Luna's story and persists; other futures stay independent", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    store.discoverFuture(9);
    expect(isStoryComplete(store.getSnapshot(), 9)).toBe(false);
    store.completeStory(9);
    const reloaded = createProgressStore(() => storage).getSnapshot();
    expect(reloaded.discoveredForms).toContain(9);
    expect(reloaded.completedStories).toEqual([9]);
    for (const id of [2, 3, 4, 5, 6, 7, 8]) expect(isStoryComplete(reloaded, id)).toBe(false);
  });
});
