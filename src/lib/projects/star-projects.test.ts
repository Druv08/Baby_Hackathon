import { describe, expect, it } from "vitest";

import { FUTURES } from "@/data/futures";
import { getPortfolioProjects } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";
import { futurePathSchema } from "@/lib/validation";
import { constellationReducer, initialConstellation, type ConstellationAction } from "./constellation";
import { initialPagerState, type PagerAction } from "./pager";
import {
  ATLAS_ENTRIES,
  atlasReducer,
  BUILDER_STARS,
  cleanConstellationName,
  initialTelescope,
  SKY_WONDERS,
  telescopeReducer,
  type TelescopeAction,
} from "./star-projects";

describe("Star portfolio", () => {
  it("registers three live, playable creations with their own artwork", () => {
    const projects = loadFutureView("star")!.portfolio.projects;
    expect(projects.map((p) => p.id)).toEqual(["constellation-builder", "dream-atlas", "stargazers-telescope"]);
    for (const p of projects) {
      expect(p.playable).toBe(true);
      expect(p.verifiedImage).toBe(`/projects/star/${p.id}.png`);
    }
    expect(getPortfolioProjects("star")).toHaveLength(3);
  });

  it("is a valid ready portfolio and a complete future", () => {
    const star = FUTURES.find((f) => f.slug === "star")!;
    expect(star.portfolioStatus).toBe("ready");
    expect(futurePathSchema.safeParse(star).success).toBe(true);
    expect(loadFutureView("star")!.readiness.complete).toBe(true);
  });
});

describe("Constellation Builder", () => {
  const run = (actions: ConstellationAction[]) =>
    actions.reduce((s, a) => constellationReducer(s, a, { stars: BUILDER_STARS }), initialConstellation);

  it("creates a named pattern and can reset it", () => {
    const made = run([
      { type: "select", starId: "s1" },
      { type: "select", starId: "s3" },
      { type: "select", starId: "s6" },
      { type: "rename", name: "  The Little   Paw " },
    ]);
    expect(made.edges).toEqual([["s1", "s3"], ["s3", "s6"]]);
    expect(cleanConstellationName(made.name)).toBe("The Little Paw");
    const cleared = constellationReducer(made, { type: "clear" }, { stars: BUILDER_STARS });
    expect(cleared.edges).toEqual([]);
    expect(cleanConstellationName("   ")).toBeNull();
  });

  it("uses a stable star field", () => {
    expect(BUILDER_STARS).toHaveLength(10);
    expect(new Set(BUILDER_STARS.map((s) => s.id)).size).toBe(10);
    expect(BUILDER_STARS.every((s) => s.x > 0 && s.x < 100 && s.y > 0 && s.y < 100)).toBe(true);
  });
});

describe("The Dream Atlas", () => {
  const run = (actions: PagerAction[]) => actions.reduce(atlasReducer, initialPagerState);

  it("has the four wishes with themes and drawable patterns", () => {
    expect(ATLAS_ENTRIES.map((e) => `${e.name} — ${e.theme}`)).toEqual([
      "The Homeward Star — Belonging",
      "The Friendship Lights — Friendship",
      "The Brave Little Comet — Courage",
      "The Dreaming Moon — Hope",
    ]);
    expect(ATLAS_ENTRIES[0].wish).toBe("I wish I could find my way home.");
    for (const e of ATLAS_ENTRIES) for (const [a, b] of e.lines) expect(e.stars[a] && e.stars[b]).toBeTruthy();
  });

  it("opens and navigates entries within bounds", () => {
    expect(run([{ type: "next" }]).page).toBe(0); // closed atlas doesn't turn
    expect(run([{ type: "open" }, { type: "next" }, { type: "next" }]).page).toBe(2);
    expect(run([{ type: "open" }, ...Array<PagerAction>(9).fill({ type: "next" })]).page).toBe(3);
    expect(run([{ type: "open" }, { type: "goto", page: 3 }, { type: "prev" }]).page).toBe(2);
  });
});

describe("Stargazer's Telescope", () => {
  const run = (actions: TelescopeAction[]) => actions.reduce(telescopeReducer, initialTelescope);

  it("starts with nothing in view", () => {
    expect(initialTelescope.inView).toBeNull();
    expect(initialTelescope.discovered).toEqual([]);
  });

  it("reveals a wonder when the lens reaches it, by aiming or by stepping", () => {
    const aimed = run([{ type: "aim", x: 80, y: 24 }]);
    expect(aimed.inView).toBe("golden-moon");
    expect(aimed.discovered).toEqual(["golden-moon"]);
    // Keyboard-style steps from the start (50, 40) down to the nebula (50, 70).
    const stepped = run(Array<TelescopeAction>(5).fill({ type: "move", dx: 0, dy: 6 }));
    expect(stepped.inView).toBe("dream-nebula");
  });

  it("marks each discovery once, finds all three, and resets", () => {
    const all = run(SKY_WONDERS.flatMap((w) => [{ type: "aim", x: w.x, y: w.y } as const, { type: "aim", x: w.x, y: w.y } as const]));
    expect(all.discovered.sort()).toEqual(["dream-nebula", "golden-moon", "wandering-star"]);
    expect(telescopeReducer(all, { type: "reset" })).toEqual(initialTelescope);
  });

  it("keeps the lens inside the sky", () => {
    const s = run([{ type: "aim", x: -50, y: 500 }]);
    expect(s.lens).toEqual({ x: 5, y: 95 });
  });
});
