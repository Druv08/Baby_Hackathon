import { describe, expect, it } from "vitest";

import { FUTURES } from "@/data/futures";
import { BLOSSOM_PROFILE } from "@/data/stories/blossom";
import { getPortfolioProjects, isProjectPlayable } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";
import { futurePathSchema } from "@/lib/validation";
import type { PortfolioProject } from "@/types/project";
import { BLOOM_ENTRIES, bookReducer, initialBookState, type BookAction } from "./bloom-book";
import {
  BUTTERFLIES,
  initialSanctuaryState,
  SANCTUARY_FLOWERS,
  sanctuaryReducer,
} from "./butterfly-corner";
import { gardenReducer, gardenStep, initialGardenState, type GardenAction, type GardenState } from "./dream-garden";

describe("Blossom portfolio", () => {
  it("registers all three creations in order", () => {
    expect(getPortfolioProjects("blossom")!.map((p) => p.title)).toEqual(["Dream Garden", "Bloom Book", "Butterfly Corner"]);
  });

  it("only activates projects that are genuinely playable", () => {
    const projects = loadFutureView("blossom")!.portfolio.projects;
    expect(projects.every((p) => p.playable && p.implementation === "live" && p.interactionId)).toBe(true);
    const unfinished: PortfolioProject = { ...projects[0], implementation: "in-progress" };
    expect(isProjectPlayable(unfinished)).toBe(false);
    const noModule: PortfolioProject = { ...projects[0], interactionId: undefined };
    expect(isProjectPlayable(noModule)).toBe(false);
  });

  it("uses only supplied artwork for project images", () => {
    const [garden, book, butterflies] = loadFutureView("blossom")!.portfolio.projects;
    expect(garden.verifiedImage).toBe("/projects/blossom/dream-garden.png");
    expect(book.verifiedImage).toBe("/projects/blossom/bloom-book.png");
    expect(butterflies.verifiedImage).toBe("/projects/blossom/butterfly-corner.png");
  });

  it("has a complete character profile and a valid ready portfolio", () => {
    const blossom = FUTURES.find((f) => f.slug === "blossom")!;
    expect(blossom.portfolioStatus).toBe("ready");
    expect(blossom.profile).toBe(BLOSSOM_PROFILE);
    expect(BLOSSOM_PROFILE.motto).toBe("Every little flower deserves a chance to bloom.");
    expect(BLOSSOM_PROFILE.strengths).toEqual(["Patience", "Kindness", "Creativity", "Observation", "Caring for nature"]);
    expect(futurePathSchema.safeParse(blossom).success).toBe(true);
    expect(loadFutureView("blossom")!.readiness.complete).toBe(true);
  });

  it("leaves the futures without content untouched", () => {
    for (const f of FUTURES.filter((f) => !["blossom", "star", "cloud", "aqua"].includes(f.slug))) {
      expect(f.portfolioStatus).toBe("pending");
      expect(f.profile).toBeUndefined();
      expect(f.projects.every((p) => p.implementation === "proposed")).toBe(true);
    }
  });
});

describe("Dream Garden", () => {
  const run = (actions: GardenAction[], from: GardenState = initialGardenState) => actions.reduce(gardenReducer, from);

  it("walks through all six steps, changing state at each one", () => {
    const stages = [initialGardenState.stage];
    let state = initialGardenState;
    for (const action of [
      { type: "choose", seedId: "moonbell" },
      { type: "plant" },
      { type: "water" },
      { type: "grow" },
      { type: "sunshine" },
      { type: "celebrate" },
    ] as GardenAction[]) {
      state = gardenReducer(state, action);
      stages.push(state.stage);
    }
    expect(stages).toEqual(["choose", "chosen", "planted", "watered", "sprout", "bloom", "celebrate"]);
    expect(state.grown).toEqual(["moonbell"]);
    expect(gardenStep(state.stage)).toBe(6);
  });

  it("ignores actions out of order and unknown seeds", () => {
    expect(run([{ type: "water" }])).toBe(initialGardenState);
    expect(run([{ type: "choose", seedId: "weed" }])).toBe(initialGardenState);
    const chosen = run([{ type: "choose", seedId: "sunblush-daisy" }]);
    expect(gardenReducer(chosen, { type: "sunshine" })).toBe(chosen);
  });

  it("restarts but remembers flowers grown this visit", () => {
    const done = run([
      { type: "choose", seedId: "heartseed-bloom" },
      { type: "plant" },
      { type: "water" },
      { type: "grow" },
      { type: "sunshine" },
      { type: "celebrate" },
      { type: "restart" },
    ]);
    expect(done).toEqual({ stage: "choose", seedId: null, grown: ["heartseed-bloom"] });
  });
});

describe("Bloom Book", () => {
  const run = (actions: BookAction[]) => actions.reduce(bookReducer, initialBookState);

  it("has at least four fictional flower entries with a lesson each", () => {
    expect(BLOOM_ENTRIES.map((e) => `${e.name} — ${e.meaning}`)).toEqual([
      "Sunblush Daisy — Happiness",
      "Moonbell — Calm",
      "Whisper Lily — Patience",
      "Heartseed Bloom — Kindness",
    ]);
    expect(BLOOM_ENTRIES.every((e) => e.lesson.length > 0 && e.description.length > 0)).toBe(true);
  });

  it("opens, pages forward and back, and stays within the book", () => {
    expect(run([{ type: "next" }])).toEqual({ open: false, page: 0 }); // closed books don't turn
    expect(run([{ type: "open" }, { type: "next" }, { type: "next" }])).toEqual({ open: true, page: 2 });
    expect(run([{ type: "open" }, { type: "prev" }]).page).toBe(0);
    expect(run([{ type: "open" }, ...Array<BookAction>(10).fill({ type: "next" })]).page).toBe(3);
    expect(run([{ type: "open" }, { type: "goto", page: 3 }, { type: "prev" }]).page).toBe(2);
    expect(run([{ type: "open" }, { type: "goto", page: 9 }]).page).toBe(0);
    expect(run([{ type: "open" }, { type: "goto", page: 2 }, { type: "close" }])).toEqual(initialBookState);
  });
});

describe("Butterfly Corner", () => {
  it("offers three flowers that each attract a different fantasy butterfly", () => {
    expect(BUTTERFLIES.map((b) => b.name)).toEqual(["Golden Flutter", "Pink Petalwing", "Skywing"]);
    expect(new Set(SANCTUARY_FLOWERS.map((f) => f.attracts)).size).toBe(3);
  });

  it("reacts to each flower choice and fills the collection", () => {
    let s = sanctuaryReducer(initialSanctuaryState, { type: "plant", flowerId: "sunbell" });
    expect(s).toMatchObject({ flowerId: "sunbell", visitorId: "golden-flutter", collection: ["golden-flutter"] });
    s = sanctuaryReducer(s, { type: "plant", flowerId: "sky-blossom" });
    expect(s.visitorId).toBe("skywing");
    s = sanctuaryReducer(s, { type: "plant", flowerId: "sunbell" }); // repeat: no duplicate
    expect(s.collection).toEqual(["golden-flutter", "skywing"]);
    s = sanctuaryReducer(s, { type: "plant", flowerId: "rosy-heartseed" });
    expect(s.collection).toHaveLength(3);
  });

  it("ignores unknown flowers and can be cleared or reset", () => {
    const planted = sanctuaryReducer(initialSanctuaryState, { type: "plant", flowerId: "sunbell" });
    expect(sanctuaryReducer(planted, { type: "plant", flowerId: "cactus" })).toBe(planted);
    expect(sanctuaryReducer(planted, { type: "clear" })).toEqual({ flowerId: null, visitorId: null, collection: ["golden-flutter"] });
    expect(sanctuaryReducer(planted, { type: "reset" })).toEqual(initialSanctuaryState);
  });
});
