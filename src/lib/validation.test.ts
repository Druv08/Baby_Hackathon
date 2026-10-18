import { describe, expect, it } from "vitest";

import { CHARACTERS } from "@/data/characters";
import { FUTURES } from "@/data/futures";
import type { FuturePath } from "@/types/future";
import type { PortfolioProject } from "@/types/project";
import type { StoryScene } from "@/types/story";
import { futurePathSchema, portfolioProjectSchema, validateCatalog } from "./validation";

function readyScenes(futureCharacterId: number): StoryScene[] {
  return [1, 2, 3, 4, 5].map((id) => ({
    id,
    title: `Scene ${id}`,
    narration: `Narration ${id}`,
    image: `/stories/test/scene-${id}.png`,
    characterId: (id <= 4 ? 1 : futureCharacterId) as StoryScene["characterId"],
    layout: "center",
  }));
}

function readyProjects(): PortfolioProject[] {
  return ["one", "two", "three"].map((id) => ({
    id,
    title: id,
    description: `Project ${id}`,
    status: "ready",
    implementation: "proposed",
  }));
}

function readyStar(overrides: Partial<FuturePath> = {}): FuturePath {
  return {
    id: 3,
    slug: "star",
    characterId: 3,
    storyStatus: "ready",
    portfolioStatus: "pending",
    scenes: readyScenes(3),
    projects: [],
    ...overrides,
  };
}

describe("shipped catalog", () => {
  it("passes full validation", () => {
    const result = validateCatalog(CHARACTERS, FUTURES);
    expect(result.issues).toEqual([]);
    expect(result.success).toBe(true);
  });

  it("has exactly nine characters with ids 1–9", () => {
    expect(CHARACTERS).toHaveLength(9);
    expect(CHARACTERS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(new Set(CHARACTERS.map((c) => c.id)).size).toBe(9);
  });

  it("points every character at its canonical image", () => {
    // Star (3) and Luna (9) are cross-mapped: their locked files hold each other's design.
    const expected: Record<number, string> = { 3: "/characters/9.png", 9: "/characters/3.png" };
    for (const c of CHARACTERS) expect(c.characterImage).toBe(expected[c.id] ?? `/characters/${c.id}.png`);
  });

  it("has exactly eight futures with unique slugs", () => {
    expect(FUTURES).toHaveLength(8);
    expect(new Set(FUTURES.map((f) => f.slug)).size).toBe(8);
  });

  it("maps each future to its correct character", () => {
    const expected = { blossom: 2, star: 3, cloud: 4, aqua: 5, inventor: 6, forest: 7, melody: 8, luna: 9 };
    for (const f of FUTURES) {
      expect(f.characterId).toBe(expected[f.slug]);
      expect(f.id).toBe(f.characterId);
    }
  });
});

describe("story readiness", () => {
  it("accepts pending and draft futures with zero scenes", () => {
    for (const storyStatus of ["pending", "draft"] as const) {
      expect(futurePathSchema.safeParse(readyStar({ storyStatus, scenes: [] })).success).toBe(true);
    }
  });

  it("accepts a draft story with partial scenes and no images", () => {
    const scenes = readyScenes(3)
      .slice(0, 2)
      .map((s) => ({ ...s, image: undefined }));
    expect(futurePathSchema.safeParse(readyStar({ storyStatus: "draft", scenes })).success).toBe(true);
  });

  it("accepts a ready story: scenes 1–4 Normal Maria, scene 5 future Maria", () => {
    expect(futurePathSchema.safeParse(readyStar()).success).toBe(true);
  });

  it("rejects a ready story with the wrong scene count", () => {
    expect(futurePathSchema.safeParse(readyStar({ scenes: readyScenes(3).slice(0, 4) })).success).toBe(false);
  });

  it("rejects a ready story where an origin scene isn't Normal Maria", () => {
    const scenes = readyScenes(3);
    scenes[2] = { ...scenes[2], characterId: 3 };
    expect(futurePathSchema.safeParse(readyStar({ scenes })).success).toBe(false);
  });

  it("rejects a ready story whose reveal is another future's character", () => {
    const scenes = readyScenes(3);
    scenes[4] = { ...scenes[4], characterId: 2 };
    expect(futurePathSchema.safeParse(readyStar({ scenes })).success).toBe(false);
  });

  it("rejects out-of-order and duplicate scene ids", () => {
    const swapped = readyScenes(3);
    [swapped[0], swapped[1]] = [{ ...swapped[1], characterId: 1 }, { ...swapped[0], characterId: 1 }];
    expect(futurePathSchema.safeParse(readyStar({ scenes: swapped })).success).toBe(false);

    const dup = readyScenes(3);
    dup[1] = { ...dup[1], id: 1 };
    expect(futurePathSchema.safeParse(readyStar({ storyStatus: "draft", scenes: dup })).success).toBe(false);
  });

  it("rejects a ready story missing narration or images", () => {
    const noText = readyScenes(3);
    noText[0] = { ...noText[0], narration: "  " };
    expect(futurePathSchema.safeParse(readyStar({ scenes: noText })).success).toBe(false);

    const noImage = readyScenes(3);
    delete noImage[4].image;
    expect(futurePathSchema.safeParse(readyStar({ scenes: noImage })).success).toBe(false);
  });

  it("rejects malformed asset paths", () => {
    const scenes = readyScenes(3);
    scenes[0] = { ...scenes[0], image: "stories/no-leading-slash.png" as `/${string}` };
    expect(futurePathSchema.safeParse(readyStar({ storyStatus: "draft", scenes })).success).toBe(false);
    expect(futurePathSchema.safeParse(readyStar({ heroImage: "/heroes/star.exe" })).success).toBe(false);
  });
});

describe("portfolio readiness", () => {
  it("rejects a ready portfolio with fewer than three ready projects", () => {
    const projects = readyProjects();
    expect(futurePathSchema.safeParse(readyStar({ portfolioStatus: "ready", projects })).success).toBe(true);
    expect(
      futurePathSchema.safeParse(readyStar({ portfolioStatus: "ready", projects: projects.slice(0, 2) })).success,
    ).toBe(false);
    projects[0] = { ...projects[0], status: "draft" };
    expect(futurePathSchema.safeParse(readyStar({ portfolioStatus: "ready", projects })).success).toBe(false);
  });

  it("requires an interactionId for live projects", () => {
    const base: PortfolioProject = { id: "x", title: "X", description: "d", status: "ready", implementation: "live" };
    expect(portfolioProjectSchema.safeParse(base).success).toBe(false);
    expect(portfolioProjectSchema.safeParse({ ...base, interactionId: "x-game" }).success).toBe(true);
  });
});

describe("catalog relationships", () => {
  it("rejects duplicate character ids and future slugs", () => {
    const chars = [...CHARACTERS, { ...CHARACTERS[2] }];
    expect(validateCatalog(chars, FUTURES).success).toBe(false);
    const futures = [...FUTURES, { ...FUTURES[0] }];
    expect(validateCatalog(CHARACTERS, futures).success).toBe(false);
  });

  it("rejects a future pointing at the wrong character", () => {
    const futures = FUTURES.map((f) => (f.slug === "star" ? { ...f, characterId: 4 } : f));
    expect(validateCatalog(CHARACTERS, futures).success).toBe(false);
  });

  it("rejects a future for Normal Maria and unknown character ids", () => {
    expect(futurePathSchema.safeParse(readyStar({ id: 1 as 2, characterId: 1 as 2 })).success).toBe(false);
    expect(futurePathSchema.safeParse(readyStar({ id: 10 as 2, characterId: 10 as 2 })).success).toBe(false);
  });

  it("treats each future independently of the others", () => {
    // One future fully ready while every other stays pending is valid.
    const futures = FUTURES.map((f) =>
      f.slug === "star" ? readyStar({ portfolioStatus: "ready", projects: readyProjects() }) : f,
    );
    expect(validateCatalog(CHARACTERS, futures).success).toBe(true);
    // Futures carry no prerequisite fields; unknown keys are stripped.
    const parsed = futurePathSchema.parse({ ...readyStar(), requires: ["blossom"] });
    expect(parsed).not.toHaveProperty("requires");
  });
});
