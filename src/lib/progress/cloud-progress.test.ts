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

describe("Cloud's Secret Rainbow Cloud", () => {
  it("is the registered secret for future 4, with a string id (not the number 4)", () => {
    expect(getSecretForFuture("cloud")).toEqual({
      id: "secret-cloud",
      futureSlug: "cloud",
      characterId: 4,
      name: "Secret Rainbow Cloud",
      unlockMessage: "You found the Secret Rainbow Cloud!",
    });
  });

  it("is the only Cloud secret, and every secret id is unique", () => {
    expect(SECRETS.filter((s) => s.futureSlug === "cloud")).toHaveLength(1);
    expect(new Set(SECRETS.map((s) => s.id)).size).toBe(SECRETS.length);
    expect(SECRETS).toHaveLength(8);
  });

  it("unlocks once, never double-counts, and survives a reload", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    expect(store.collectSecret("secret-cloud")).toBe("collected");
    expect(store.collectSecret("secret-cloud")).toBe("already-collected");
    expect(getSecretCount(store.getSnapshot())).toBe(1);
    const reloaded = createProgressStore(() => storage).getSnapshot();
    expect(isSecretCollected(reloaded, "secret-cloud")).toBe(true);
    expect(reloaded.easterEggsFound).toEqual([4]);
  });

  it("counts alongside the other futures' secrets", () => {
    const store = createProgressStore(() => memoryStorage());
    store.collectSecret("golden-seed");
    store.collectSecret("hidden-constellation");
    store.collectSecret("secret-cloud");
    store.collectSecret("secret-cloud");
    expect(store.getSnapshot().easterEggsFound).toEqual([2, 3, 4]);
  });
});

describe("Cloud story completion", () => {
  it("completes only Cloud's story and persists; Blossom and Star stay independent", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    store.discoverFuture(4);
    expect(isStoryComplete(store.getSnapshot(), 4)).toBe(false);
    store.completeStory(4);
    const reloaded = createProgressStore(() => storage).getSnapshot();
    expect(reloaded.discoveredForms).toContain(4);
    expect(reloaded.completedStories).toEqual([4]);
    expect(isStoryComplete(reloaded, 2)).toBe(false);
    expect(isStoryComplete(reloaded, 3)).toBe(false);
  });
});
