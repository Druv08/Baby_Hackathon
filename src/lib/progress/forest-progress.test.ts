import { describe, expect, it } from "vitest";

import { SECRETS } from "@/data/secrets";
import { getSecretForFuture, getSecretCount, isSecretCollected } from "@/lib/easter-eggs";
import { isStoryComplete } from "./model";
import type { ProgressStorage } from "./storage";
import { createProgressStore } from "./store";

function memoryStorage(): ProgressStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe("Forest's Golden Acorn", () => {
  it("is the registered secret for future 7, with its existing string id (not the number 7)", () => {
    expect(getSecretForFuture("forest")).toEqual({
      id: "hidden-leaf",
      futureSlug: "forest",
      characterId: 7,
      name: "Golden Acorn",
      unlockMessage: "You found the Golden Acorn!",
    });
  });

  it("is the only Forest secret, and every secret id is still unique", () => {
    expect(SECRETS.filter((s) => s.futureSlug === "forest")).toHaveLength(1);
    expect(new Set(SECRETS.map((s) => s.id)).size).toBe(SECRETS.length);
    expect(SECRETS).toHaveLength(8);
  });

  it("unlocks once, never double-counts, and survives a reload", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    expect(store.collectSecret("hidden-leaf")).toBe("collected");
    expect(store.collectSecret("hidden-leaf")).toBe("already-collected");
    expect(getSecretCount(store.getSnapshot())).toBe(1);
    const reloaded = createProgressStore(() => storage).getSnapshot();
    expect(isSecretCollected(reloaded, "hidden-leaf")).toBe(true);
    expect(reloaded.easterEggsFound).toEqual([7]);
  });

  it("counts alongside the other futures' secrets", () => {
    const store = createProgressStore(() => memoryStorage());
    for (const id of ["golden-seed", "hidden-constellation", "secret-cloud", "hidden-pearl", "secret-gear", "hidden-leaf", "hidden-leaf"]) store.collectSecret(id);
    expect(store.getSnapshot().easterEggsFound).toEqual([2, 3, 4, 5, 6, 7]);
  });
});

describe("Forest story completion", () => {
  it("completes only Forest's story and persists; other futures stay independent", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    store.discoverFuture(7);
    expect(isStoryComplete(store.getSnapshot(), 7)).toBe(false);
    store.completeStory(7);
    const reloaded = createProgressStore(() => storage).getSnapshot();
    expect(reloaded.discoveredForms).toContain(7);
    expect(reloaded.completedStories).toEqual([7]);
    for (const id of [2, 3, 4, 5, 6, 8]) expect(isStoryComplete(reloaded, id)).toBe(false);
  });
});
