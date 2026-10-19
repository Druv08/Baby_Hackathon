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

describe("Aqua's Secret Ocean Pearl", () => {
  it("is the registered secret for future 5, with its existing string id (not the number 5)", () => {
    expect(getSecretForFuture("aqua")).toEqual({
      id: "hidden-pearl",
      futureSlug: "aqua",
      characterId: 5,
      name: "Secret Ocean Pearl",
      unlockMessage: "You found the Secret Ocean Pearl!",
    });
  });

  it("is the only Aqua secret, and every secret id is still unique", () => {
    expect(SECRETS.filter((s) => s.futureSlug === "aqua")).toHaveLength(1);
    expect(new Set(SECRETS.map((s) => s.id)).size).toBe(SECRETS.length);
    expect(SECRETS).toHaveLength(8);
  });

  it("unlocks once, never double-counts, and survives a reload", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    expect(store.collectSecret("hidden-pearl")).toBe("collected");
    expect(store.collectSecret("hidden-pearl")).toBe("already-collected");
    expect(getSecretCount(store.getSnapshot())).toBe(1);
    const reloaded = createProgressStore(() => storage).getSnapshot();
    expect(isSecretCollected(reloaded, "hidden-pearl")).toBe(true);
    expect(reloaded.easterEggsFound).toEqual([5]);
  });

  it("counts alongside the other futures' secrets", () => {
    const store = createProgressStore(() => memoryStorage());
    for (const id of ["golden-seed", "hidden-constellation", "secret-cloud", "hidden-pearl", "hidden-pearl"]) store.collectSecret(id);
    expect(store.getSnapshot().easterEggsFound).toEqual([2, 3, 4, 5]);
  });
});

describe("Aqua story completion", () => {
  it("completes only Aqua's story and persists; Blossom, Star and Cloud stay independent", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    store.discoverFuture(5);
    expect(isStoryComplete(store.getSnapshot(), 5)).toBe(false);
    store.completeStory(5);
    const reloaded = createProgressStore(() => storage).getSnapshot();
    expect(reloaded.discoveredForms).toContain(5);
    expect(reloaded.completedStories).toEqual([5]);
    for (const id of [2, 3, 4]) expect(isStoryComplete(reloaded, id)).toBe(false);
  });
});
