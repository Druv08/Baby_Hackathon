import { describe, expect, it } from "vitest";
import { createProgressStore } from "./store";
import { getSecretForFuture } from "@/lib/easter-eggs";

describe("Melody journey progress", () => {
  it("preserves the canonical secret ID and name", () => {
    expect(getSecretForFuture("melody")).toMatchObject({ id: "secret-note", characterId: 8, name: "Secret Note" });
  });
  it("persists discovery, completion and one secret independently of other futures", () => {
    const data = new Map<string, string>();
    const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); }, removeItem: (key: string) => { data.delete(key); } };
    const store = createProgressStore(() => storage);
    store.discoverFuture(8); store.completeStory(8);
    expect(store.collectSecret("secret-note")).toBe("collected");
    expect(store.collectSecret("secret-note")).toBe("already-collected");
    expect(createProgressStore(() => storage).getSnapshot()).toMatchObject({ discoveredForms: [8], completedStories: [8], easterEggsFound: [8] });
    expect(data.size).toBe(1);
  });
});
