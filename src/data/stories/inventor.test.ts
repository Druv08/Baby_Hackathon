import { describe, expect, it } from "vitest";

import { isAssetVerified } from "@/data/assets";
import { CHARACTERS } from "@/data/characters";
import { FUTURES } from "@/data/futures";
import { getFutureBySlug, getStoryScenes } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";
import { narrationParagraphs } from "@/lib/story-text";
import { futurePathSchema, validateCatalog } from "@/lib/validation";
import { AQUA_SCENES } from "./aqua";
import { BLOSSOM_SCENES } from "./blossom";
import { CLOUD_SCENES } from "./cloud";
import { INVENTOR_PROFILE, INVENTOR_PROJECTS, INVENTOR_SCENES, INVENTOR_STORY_INTRO } from "./inventor";
import { STAR_SCENES } from "./star";

const inventor = () => getFutureBySlug("inventor")!;

describe("Inventor story content", () => {
  it("is future 6 with slug inventor, played by Inventor Maria", () => {
    expect(inventor().id).toBe(6);
    expect(inventor().slug).toBe("inventor");
    expect(inventor().characterId).toBe(6);
    expect(CHARACTERS.find((c) => c.id === 6)).toMatchObject({
      name: "Inventor Maria",
      profession: "Star Mechanic",
      tagline: "If something doesn't exist, I can build it.",
      characterImage: "/characters/6.png",
    });
  });

  it("registers the story and its Inventor Path introduction", () => {
    expect(getStoryScenes("inventor")).toBe(INVENTOR_SCENES);
    expect(INVENTOR_STORY_INTRO).toMatchObject({ title: "Inventor Path", subtitle: "How Maria became the Star Mechanic" });
    expect(INVENTOR_STORY_INTRO.blurb).toMatch(/^One little red panda\. A workshop filled with broken machines\./);
    expect(INVENTOR_STORY_INTRO.blurb).toMatch(/every mistake is an opportunity to discover something new\.$/);
  });

  it("has exactly five scenes in order", () => {
    expect(INVENTOR_SCENES.map((s) => s.id)).toEqual([1, 2, 3, 4, 5]);
    expect(INVENTOR_SCENES.map((s) => s.title)).toEqual([
      "The Night the Lanterns Went Dark",
      "The Spark Inside the Machine",
      "A Hundred Tiny Tries",
      "The Machine Wakes Up",
      "Becoming the Star Mechanic",
    ]);
  });

  it("uses Normal Maria for scenes 1–4 and Inventor Maria (never Star or Luna) for scene 5", () => {
    expect(INVENTOR_SCENES.slice(0, 4).every((s) => s.characterId === 1)).toBe(true);
    expect(INVENTOR_SCENES[4].characterId).toBe(6);
    expect(INVENTOR_SCENES.some((s) => s.characterId === 3 || s.characterId === 9)).toBe(false);
  });

  it("points every scene at its own verified illustration, never another world's", () => {
    const others = new Set([...BLOSSOM_SCENES, ...STAR_SCENES, ...CLOUD_SCENES, ...AQUA_SCENES].map((s) => s.image));
    INVENTOR_SCENES.forEach((s) => {
      expect(s.image).toBe(`/stories/inventor/scene-${s.id}.png`);
      expect(isAssetVerified(s.image)).toBe(true);
      expect(others.has(s.image)).toBe(false);
    });
    expect(isAssetVerified("/stories/inventor/background.png")).toBe(true);
  });

  it("alternates the layout and gives every scene its own interaction", () => {
    expect(INVENTOR_SCENES.map((s) => s.layout)).toEqual(["text-right", "text-left", "text-right", "text-left", "center"]);
    expect(INVENTOR_SCENES.map((s) => s.interactionId)).toEqual([
      "flicker-lantern",
      "machine-diagram",
      "gear-challenge",
      "machine-activation",
      "inventor-reveal",
    ]);
  });

  it("keeps the approved narration and Maria's spoken lines", () => {
    const s1 = narrationParagraphs(INVENTOR_SCENES[0].narration);
    expect(s1[0].text).toBe("One evening, Maria wandered into a little village filled with beautiful star-shaped lanterns.");
    expect(s1.filter((p) => p.spoken).map((p) => p.text)).toEqual([
      "“Oh no! Where did all the stars go?”",
      "“Is that where the missing light has gone?”",
    ]);
    expect(INVENTOR_SCENES[1].narration).toContain("“Maybe I need to learn how you work first!”");
    expect(INVENTOR_SCENES[2].narration).toContain("“Oh crumbs! Why is everything going wrong?”");
    expect(INVENTOR_SCENES[2].narration).toMatch(/She needed to try differently\.$/);
    expect(INVENTOR_SCENES[3].narration).toContain("“I did it! I really built something that works!”");
    expect(INVENTOR_SCENES[4].narration).toContain("And that was how Maria discovered another possible future.");
    expect(INVENTOR_SCENES[4].narration).toMatch(/a creator of wonderful possibilities\.$/);
  });

  it("passes the strict ready-story validation", () => {
    const result = futurePathSchema.safeParse({ ...inventor(), storyStatus: "ready" });
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
    expect(validateCatalog(CHARACTERS, FUTURES).success).toBe(true);
  });

  it("is ready, and loadFutureView returns all five scenes with the reveal last", () => {
    expect(inventor().storyStatus).toBe("ready");
    const view = loadFutureView("inventor")!;
    expect(view.story.canEnter).toBe(true);
    expect(view.story.scenes.map((s) => s.position)).toEqual([1, 2, 3, 4, 5]);
    expect(view.story.origin.map((s) => s.character.id)).toEqual([1, 1, 1, 1]);
    expect(view.story.reveal?.character.name).toBe("Inventor Maria");
    expect(view.story.scenes.every((s) => s.verifiedImage === s.image)).toBe(true);
  });
});

describe("Inventor portfolio data", () => {
  it("has the complete Star Mechanic character sheet", () => {
    expect(INVENTOR_PROFILE).toMatchObject({
      species: "Baby red panda",
      profession: "Star Mechanic, Magical Inventor and Dream Engineer",
      home: "The Forgotten Star Workshop",
      theme: "Creativity and perseverance",
      specialTalent: "Repairing magical machines and creating helpful inventions",
      motto: "Every mistake teaches me something new.",
    });
    expect(INVENTOR_PROFILE.personality).toEqual(["Curious", "inventive", "determined", "playful", "resourceful"]);
    expect(INVENTOR_PROFILE.strengths).toEqual([
      "Creativity",
      "Problem-solving",
      "Persistence",
      "Observation",
      "Experimentation",
      "Engineering",
    ]);
    expect(INVENTOR_PROFILE.about[0]).toBe("Hi! I’m Inventor Maria!");
  });

  it("registers three projects, each with its own verified artwork", () => {
    expect(INVENTOR_PROJECTS.map((p) => p.title)).toEqual(["Star Workshop", "Dream Lantern Lab", "Little Helper Machines"]);
    for (const p of INVENTOR_PROJECTS) {
      expect(isAssetVerified(p.image)).toBe(true);
      expect(p.image).toMatch(/^\/projects\/inventor\//);
    }
  });
});

describe("Blossom, Star, Cloud and Aqua are unchanged", () => {
  it("keep their own scenes, reveals and readiness", () => {
    expect(getStoryScenes("blossom")).toBe(BLOSSOM_SCENES);
    expect(getStoryScenes("star")).toBe(STAR_SCENES);
    expect(getStoryScenes("cloud")).toBe(CLOUD_SCENES);
    expect(getStoryScenes("aqua")).toBe(AQUA_SCENES);
    expect([BLOSSOM_SCENES, STAR_SCENES, CLOUD_SCENES, AQUA_SCENES].map((s) => s[4].characterId)).toEqual([2, 3, 4, 5]);
    for (const slug of ["blossom", "star", "cloud", "aqua"]) {
      expect(getFutureBySlug(slug)!).toMatchObject({ storyStatus: "ready", portfolioStatus: "ready" });
    }
  });
});
