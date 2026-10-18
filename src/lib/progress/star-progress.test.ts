import { describe, expect, it } from "vitest";

import { CHARACTERS } from "@/data/characters";
import { getSecretForFuture, getSecretCount, isSecretCollected } from "@/lib/easter-eggs";
import { isStoryComplete } from "./model";
import type { ProgressStorage } from "./storage";
import { createProgressStore } from "./store";

function memoryStorage(): ProgressStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe("Star's Hidden Constellation", () => {
  it("is the registered secret for future 3, collected by its string id", () => {
    expect(getSecretForFuture("star")).toMatchObject({
      id: "hidden-constellation",
      characterId: 3,
      unlockMessage: "You found the Hidden Constellation!",
    });
  });

  it("unlocks once, never double-counts, and survives a reload", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    expect(store.collectSecret("hidden-constellation")).toBe("collected");
    expect(store.collectSecret("hidden-constellation")).toBe("already-collected");
    expect(getSecretCount(store.getSnapshot())).toBe(1);
    const reloaded = createProgressStore(() => storage).getSnapshot();
    expect(isSecretCollected(reloaded, "hidden-constellation")).toBe(true);
    expect(reloaded.easterEggsFound).toEqual([3]);
  });
});

describe("Star story completion", () => {
  it("completes only Star's story and persists; Blossom and Luna stay independent", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    store.discoverFuture(3);
    expect(isStoryComplete(store.getSnapshot(), 3)).toBe(false);
    store.completeStory(3);
    const reloaded = createProgressStore(() => storage).getSnapshot();
    expect(reloaded.completedStories).toEqual([3]);
    expect(isStoryComplete(reloaded, 2)).toBe(false);
    expect(isStoryComplete(reloaded, 9)).toBe(false);
  });
});

describe("Luna remains Character 9", () => {
  it("keeps Luna's identity, separate from Star", () => {
    const luna = CHARACTERS.find((c) => c.id === 9)!;
    expect(luna).toMatchObject({ slug: "luna", name: "Luna Maria", profession: "Memory Keeper" });
    expect(luna.characterImage).not.toBe(CHARACTERS.find((c) => c.id === 3)!.characterImage);
  });
});
