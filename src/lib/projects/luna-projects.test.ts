import { describe, expect, it } from "vitest";

import { getFutureBySlug } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";
import { memorySubmissionSchema } from "@/lib/memories/validation";
import { futurePathSchema } from "@/lib/validation";
import {
  CABINET_PAIRS,
  LANTERN_STORAGE_KEY,
  LANTERN_TEXT_MAX,
  cabinetMatchReducer,
  cabinetReducer,
  clearLanternDraft,
  defaultLantern,
  initialCabinet,
  lanternReducer,
  loadLanternDraft,
  parseLantern,
  saveLanternDraft,
  type DraftStorage,
} from "./luna-projects";
import { initialMatch, type MatchAction } from "./luna-story";

function memoryStorage(): DraftStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe("Memory Lantern Studio", () => {
  it("changes shape, light, symbol and text", () => {
    let s = lanternReducer(defaultLantern, { type: "shape", value: "crescent" });
    s = lanternReducer(s, { type: "light", value: "blue" });
    s = lanternReducer(s, { type: "symbol", value: "moon" });
    s = lanternReducer(s, { type: "text", value: "  My   first\tswim  " });
    expect(s).toEqual({ shape: "crescent", light: "blue", symbol: "moon", text: " My first swim " });
    expect(lanternReducer(s, { type: "text", value: "x".repeat(200) }).text).toHaveLength(LANTERN_TEXT_MAX);
    // @ts-expect-error — not a real shape
    expect(lanternReducer(s, { type: "shape", value: "square" })).toBe(s);
    expect(lanternReducer(s, { type: "reset" })).toEqual(defaultLantern);
  });

  it("saves, loads and clears the draft locally, rejecting tampered data", () => {
    const storage = memoryStorage();
    const design = { shape: "star", light: "pink", symbol: "flower", text: "Grandma’s garden" } as const;
    expect(saveLanternDraft(storage, design)).toBe(true);
    expect(loadLanternDraft(storage)).toEqual(design);
    storage.setItem(LANTERN_STORAGE_KEY, JSON.stringify({ ...design, shape: "<script>" }));
    expect(loadLanternDraft(storage)).toBeNull();
    storage.setItem(LANTERN_STORAGE_KEY, "not json");
    expect(loadLanternDraft(storage)).toBeNull();
    clearLanternDraft(storage);
    expect(storage.data.size).toBe(0);
    expect(loadLanternDraft(null)).toBeNull();
    expect(saveLanternDraft(null, design)).toBe(false);
    expect(parseLantern(42)).toBeNull();
  });
});

describe("The Keepsake Cabinet", () => {
  const run = (actions: MatchAction[]) => actions.reduce(cabinetMatchReducer, initialMatch);

  it("has four keepsakes, each with its own memory", () => {
    expect(CABINET_PAIRS.map((p) => p.keepsake)).toEqual(["flower", "bell", "boat", "photo"]);
    expect(new Set(CABINET_PAIRS.map((p) => p.memory)).size).toBe(4);
  });

  it("opens compartments once each, and resets", () => {
    let s = cabinetReducer(initialCabinet, { type: "open", id: "bell" });
    s = cabinetReducer(s, { type: "open", id: "bell" });
    expect(s.opened).toEqual(["bell"]);
    expect(cabinetReducer(s, { type: "reset" })).toEqual(initialCabinet);
  });

  it("refuses wrong matches and unlocks all four memories", () => {
    expect(run([{ type: "pick", id: "bell" }, { type: "match", memory: "rabbit-friend" }]).last).toBe("wrong");
    const all = run(CABINET_PAIRS.flatMap((p) => [{ type: "pick", id: p.keepsake }, { type: "match", memory: p.memory }] as MatchAction[]));
    expect(all.matched).toEqual(["flower", "bell", "boat", "photo"]);
  });
});

describe("Moonlit Memory Book uses the shared moderated rules", () => {
  it("validates with the server's own schema (names, length, links)", () => {
    expect(memorySubmissionSchema.safeParse({ visitorName: "Ava", message: "I loved Luna's lanterns!", formSlug: "luna" }).success).toBe(true);
    expect(memorySubmissionSchema.safeParse({ visitorName: "", message: "hi" }).success).toBe(false);
    expect(memorySubmissionSchema.safeParse({ visitorName: "Ava", message: "see www.spam.com" }).success).toBe(false);
    expect(memorySubmissionSchema.safeParse({ visitorName: "Ava", message: "x".repeat(281) }).success).toBe(false);
  });
});

describe("Luna portfolio readiness", () => {
  it("marks all three projects live and playable, and the portfolio ready", () => {
    const luna = getFutureBySlug("luna")!;
    expect(luna.portfolioStatus).toBe("ready");
    expect(luna.projects.every((p) => p.status === "ready" && p.implementation === "live" && p.interactionId === p.id)).toBe(true);
    const view = loadFutureView("luna")!;
    expect(view.readiness.complete).toBe(true);
    expect(view.portfolio.projects.map((p) => [p.id, p.playable, p.verifiedImage])).toEqual([
      ["moonlit-memory-book", true, "/projects/luna/moonlit-memory-book.png"],
      ["memory-lantern-studio", true, "/projects/luna/memory-lantern-studio.png"],
      ["keepsake-cabinet", true, "/projects/luna/keepsake-cabinet.png"],
    ]);
    expect(futurePathSchema.safeParse(luna).success).toBe(true);
  });
});
