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

describe("Inventor's Golden Cog", () => {
  it("is the registered secret for future 6, with its existing string id (not the number 6)", () => {
    expect(getSecretForFuture("inventor")).toEqual({
      id: "secret-gear",
      futureSlug: "inventor",
      characterId: 6,
      name: "Golden Cog",
      unlockMessage: "You found the Golden Cog!",
    });
  });

  it("is the only Inventor secret, and every secret id is still unique", () => {
    expect(SECRETS.filter((s) => s.futureSlug === "inventor")).toHaveLength(1);
    expect(new Set(SECRETS.map((s) => s.id)).size).toBe(SECRETS.length);
    expect(SECRETS).toHaveLength(8);
  });

  it("unlocks once, never double-counts, and survives a reload", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    expect(store.collectSecret("secret-gear")).toBe("collected");
    expect(store.collectSecret("secret-gear")).toBe("already-collected");
    expect(getSecretCount(store.getSnapshot())).toBe(1);
    const reloaded = createProgressStore(() => storage).getSnapshot();
    expect(isSecretCollected(reloaded, "secret-gear")).toBe(true);
    expect(reloaded.easterEggsFound).toEqual([6]);
  });

  it("counts alongside the other futures' secrets", () => {
    const store = createProgressStore(() => memoryStorage());
    for (const id of ["golden-seed", "hidden-constellation", "secret-cloud", "hidden-pearl", "secret-gear", "secret-gear"]) store.collectSecret(id);
    expect(store.getSnapshot().easterEggsFound).toEqual([2, 3, 4, 5, 6]);
  });
});

describe("Inventor story completion", () => {
  it("completes only Inventor's story and persists; other futures stay independent", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    store.discoverFuture(6);
    expect(isStoryComplete(store.getSnapshot(), 6)).toBe(false);
    store.completeStory(6);
    const reloaded = createProgressStore(() => storage).getSnapshot();
    expect(reloaded.discoveredForms).toContain(6);
    expect(reloaded.completedStories).toEqual([6]);
    for (const id of [2, 3, 4, 5, 7]) expect(isStoryComplete(reloaded, id)).toBe(false);
  });
});
