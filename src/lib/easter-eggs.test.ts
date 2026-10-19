import { describe, expect, it } from "vitest";

import { FUTURES } from "@/data/futures";
import { SECRET_ENDING, SECRETS } from "@/data/secrets";
import {
  areAllSecretsFound,
  collectSecret,
  getFoundSecrets,
  getSecretById,
  getSecretCount,
  getSecretForFuture,
  isSecretCollected,
  isSecretEndingUnlocked,
} from "./easter-eggs";
import { createDefaultProgress, parseProgress, type JourneyProgress } from "./progress/model";
import { PROGRESS_STORAGE_KEY, type ProgressStorage } from "./progress/storage";
import { createProgressStore } from "./progress/store";

function memoryStorage(): ProgressStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

function collectAll(ids: string[], start: JourneyProgress = createDefaultProgress()): JourneyProgress {
  return ids.reduce((p, id) => collectSecret(p, id).progress, start);
}

describe("secret registry", () => {
  it("has eight unique secrets, one per future", () => {
    expect(SECRETS).toHaveLength(8);
    expect(new Set(SECRETS.map((s) => s.id)).size).toBe(8);
    expect(new Set(SECRETS.map((s) => s.futureSlug)).size).toBe(8);
    expect(new Set(SECRETS.map((s) => s.characterId)).size).toBe(8);
  });

  it("maps each secret to the right future and character", () => {
    const expected = {
      blossom: "Golden Seed",
      star: "Hidden Constellation",
      cloud: "Secret Rainbow Cloud",
      aqua: "Secret Ocean Pearl",
      inventor: "Golden Cog",
      forest: "Golden Acorn",
      melody: "Secret Note",
      luna: "Silver Memory Key",
    };
    for (const f of FUTURES) {
      const secret = getSecretForFuture(f.slug)!;
      expect(secret.name).toBe(expected[f.slug]);
      expect(secret.characterId).toBe(f.characterId);
      expect(secret.unlockMessage.length).toBeGreaterThan(0);
    }
  });

  it("defines the secret ending with Normal Maria", () => {
    expect(SECRET_ENDING.counterLabel).toBe("8 / 8 SECRETS FOUND");
    expect(SECRET_ENDING.title).toBe("SECRET ENDING UNLOCKED");
    expect(SECRET_ENDING.characterImage).toBe("/characters/1.png");
    expect(SECRET_ENDING.lines).toEqual(["Every future was always a part of me.", "Tiny paws. Infinite possibilities."]);
    expect(SECRET_ENDING.symbols).toHaveLength(8);
  });
});

describe("collecting secrets", () => {
  it("collects a secret once and ignores duplicates", () => {
    const first = collectSecret(createDefaultProgress(), "hidden-pearl");
    expect(first.result).toBe("collected");
    expect(isSecretCollected(first.progress, "hidden-pearl")).toBe(true);

    const again = collectSecret(first.progress, "hidden-pearl");
    expect(again.result).toBe("already-collected");
    expect(again.progress).toBe(first.progress);
    expect(getSecretCount(again.progress)).toBe(1);
  });

  it("rejects unknown collectibles", () => {
    const p = createDefaultProgress();
    for (const id of ["", "golden_seed", "tenth-secret", "constructor"]) {
      const r = collectSecret(p, id);
      expect(r.result).toBe("unknown");
      expect(r.progress).toBe(p);
      expect(isSecretCollected(p, id)).toBe(false);
    }
    expect(getSecretById("toString")).toBeUndefined();
  });

  it("does not unlock the ending with partial progress, in any order", () => {
    const p = collectAll(["hidden-constellation", "memory-star", "golden-seed"]);
    expect(getFoundSecrets(p).map((s) => s.futureSlug)).toEqual(["blossom", "star", "luna"]);
    expect(areAllSecretsFound(p)).toBe(false);
    expect(isSecretEndingUnlocked(collectAll(SECRETS.slice(1).map((s) => s.id)))).toBe(false);
  });

  it("unlocks the ending once all eight are found", () => {
    const reversed = collectAll(SECRETS.map((s) => s.id).reverse());
    expect(getSecretCount(reversed)).toBe(8);
    expect(isSecretEndingUnlocked(reversed)).toBe(true);
  });

  it("discards tampered secret IDs when restoring progress", () => {
    const p = parseProgress({ version: 1, easterEggsFound: [2, 3, 4, 5, 6, 7, 8, 1, 10] });
    expect(getSecretCount(p)).toBe(7);
    expect(isSecretEndingUnlocked(p)).toBe(false);
  });
});

describe("secret persistence", () => {
  it("saves secrets through the progress store and survives reload", () => {
    const storage = memoryStorage();
    const store = createProgressStore(() => storage);
    expect(store.collectSecret("secret-gear")).toBe("collected");
    expect(store.collectSecret("secret-gear")).toBe("already-collected");
    expect(store.collectSecret("nope")).toBe("unknown");

    const reloaded = createProgressStore(() => storage);
    expect(isSecretCollected(reloaded.getSnapshot(), "secret-gear")).toBe(true);
    expect(getSecretCount(reloaded.getSnapshot())).toBe(1);

    for (const s of SECRETS) reloaded.collectSecret(s.id);
    expect(isSecretEndingUnlocked(createProgressStore(() => storage).getSnapshot())).toBe(true);
    // One storage key only — no competing mechanism.
    expect([...storage.data.keys()]).toEqual([PROGRESS_STORAGE_KEY]);
  });

  it("collecting secrets does not affect story progress", () => {
    const p = collectAll(SECRETS.map((s) => s.id));
    expect(p.completedStories).toEqual([]);
    expect(p.discoveredForms).toEqual([]);
  });
});
