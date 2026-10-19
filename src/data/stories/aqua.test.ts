import { describe, expect, it } from "vitest";

import { isAssetVerified } from "@/data/assets";
import { CHARACTERS } from "@/data/characters";
import { FUTURES } from "@/data/futures";
import { getFutureBySlug, getStoryScenes } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";
import { narrationParagraphs } from "@/lib/story-text";
import { futurePathSchema, validateCatalog } from "@/lib/validation";
import { AQUA_PROFILE, AQUA_PROJECTS, AQUA_SCENES, AQUA_STORY_INTRO } from "./aqua";
import { BLOSSOM_SCENES } from "./blossom";
import { CLOUD_SCENES } from "./cloud";
import { STAR_SCENES } from "./star";

const aqua = () => getFutureBySlug("aqua")!;

describe("Aqua story content", () => {
  it("is future 5 with slug aqua, played by Aqua Maria", () => {
    expect(aqua().id).toBe(5);
    expect(aqua().slug).toBe("aqua");
    expect(aqua().characterId).toBe(5);
    expect(CHARACTERS.find((c) => c.id === 5)).toMatchObject({
      name: "Aqua Maria",
      profession: "Ocean Guardian",
      tagline: "Being strong can mean protecting someone else.",
      characterImage: "/characters/5.png",
    });
  });

  it("registers the story and its Aqua Path introduction", () => {
    expect(getStoryScenes("aqua")).toBe(AQUA_SCENES);
    expect(AQUA_STORY_INTRO).toMatchObject({ title: "Aqua Path", subtitle: "How Maria became the Ocean Guardian" });
    expect(AQUA_STORY_INTRO.blurb).toMatch(/^One little red panda\. A mysterious ocean\./);
    expect(AQUA_STORY_INTRO.blurb).toMatch(/true strength can come from caring for others\.$/);
  });

  it("has exactly five scenes in order", () => {
    expect(AQUA_SCENES.map((s) => s.id)).toEqual([1, 2, 3, 4, 5]);
    expect(AQUA_SCENES.map((s) => s.title)).toEqual([
      "The Storm and the Little Turtle",
      "A Kingdom Beneath the Waves",
      "The Reef That Needed Help",
      "The Ocean Comes Alive Again",
      "Becoming the Ocean Guardian",
    ]);
  });

  it("uses Normal Maria for scenes 1–4 and Aqua Maria for scene 5", () => {
    expect(AQUA_SCENES.slice(0, 4).every((s) => s.characterId === 1)).toBe(true);
    expect(AQUA_SCENES[4].characterId).toBe(5);
  });

  it("points every scene at its own verified illustration, never another world's", () => {
    const others = new Set([...BLOSSOM_SCENES, ...STAR_SCENES, ...CLOUD_SCENES].map((s) => s.image));
    AQUA_SCENES.forEach((s) => {
      expect(s.image).toBe(`/stories/aqua/scene-${s.id}.png`);
      expect(isAssetVerified(s.image)).toBe(true);
      expect(others.has(s.image)).toBe(false);
    });
    expect(isAssetVerified("/stories/aqua/background.png")).toBe(true);
  });

  it("alternates the layout and gives every scene its own interaction", () => {
    expect(AQUA_SCENES.map((s) => s.layout)).toEqual(["text-right", "text-left", "text-right", "text-left", "center"]);
    expect(AQUA_SCENES.map((s) => s.interactionId)).toEqual([
      "magic-bubble",
      "sea-creatures",
      "tangled-net",
      "reef-cleanup",
      "aqua-reveal",
    ]);
  });

  it("keeps the approved narration and Maria's spoken lines", () => {
    const s1 = narrationParagraphs(AQUA_SCENES[0].narration);
    expect(s1[0].text).toBe(
      "One sunny afternoon, Maria was exploring a peaceful beach, collecting beautiful seashells beside the waves.",
    );
    expect(s1.filter((p) => p.spoken).map((p) => p.text)).toEqual(["“Ahh! Where am I going?”", "“Oh no! Are you lost too?”"]);
    expect(AQUA_SCENES[1].narration).toMatch(/It was someone’s home\.$/);
    expect(AQUA_SCENES[2].narration).toContain("“Oh no! I’m making it worse!”");
    expect(AQUA_SCENES[2].narration).toMatch(/understanding what they needed\.$/);
    expect(AQUA_SCENES[3].narration).toContain(
      "“I thought I needed to be brave enough to fight the ocean. But all I needed was to care for it.”",
    );
    expect(AQUA_SCENES[4].narration).toMatch(/And that was how Maria discovered another possible future\.$/);
  });

  it("passes the strict ready-story validation", () => {
    const result = futurePathSchema.safeParse({ ...aqua(), storyStatus: "ready" });
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
    expect(validateCatalog(CHARACTERS, FUTURES).success).toBe(true);
  });

  it("is ready, and loadFutureView returns all five scenes with the reveal last", () => {
    expect(aqua().storyStatus).toBe("ready");
    const view = loadFutureView("aqua")!;
    expect(view.story.canEnter).toBe(true);
    expect(view.story.scenes.map((s) => s.position)).toEqual([1, 2, 3, 4, 5]);
    expect(view.story.origin.map((s) => s.character.id)).toEqual([1, 1, 1, 1]);
    expect(view.story.reveal?.character.name).toBe("Aqua Maria");
    expect(view.story.scenes.every((s) => s.verifiedImage === s.image)).toBe(true);
  });
});

describe("Aqua portfolio data", () => {
  it("has the complete Ocean Guardian character sheet", () => {
    expect(AQUA_PROFILE).toMatchObject({
      species: "Baby red panda",
      profession: "Ocean Guardian, Marine Protector and Underwater Explorer",
      home: "The Forgotten Ocean Kingdom",
      theme: "Compassion and responsibility",
      specialTalent: "Protecting sea creatures and restoring ocean habitats",
      motto: "The ocean is everyone’s home. Let’s protect it together.",
    });
    expect(AQUA_PROFILE.personality).toEqual(["Caring", "brave", "gentle", "observant", "protective"]);
    expect(AQUA_PROFILE.strengths).toEqual(["Compassion", "Responsibility", "Observation", "Teamwork", "Courage", "Problem-solving"]);
    expect(AQUA_PROFILE.about[0]).toBe("Hi! I’m Aqua Maria!");
  });

  it("registers three projects, each with its own verified artwork", () => {
    expect(AQUA_PROJECTS.map((p) => p.title)).toEqual(["Ocean Discovery", "Coral Care Garden", "Turtle’s Safe Passage"]);
    for (const p of AQUA_PROJECTS) {
      expect(isAssetVerified(p.image)).toBe(true);
      expect(p.image).toMatch(/^\/projects\/aqua\//);
    }
  });
});

describe("Blossom, Star and Cloud are unchanged", () => {
  it("keep their own scenes and reveals", () => {
    expect(getStoryScenes("blossom")).toBe(BLOSSOM_SCENES);
    expect(getStoryScenes("star")).toBe(STAR_SCENES);
    expect(getStoryScenes("cloud")).toBe(CLOUD_SCENES);
    expect([BLOSSOM_SCENES[4].characterId, STAR_SCENES[4].characterId, CLOUD_SCENES[4].characterId]).toEqual([2, 3, 4]);
    for (const slug of ["blossom", "star", "cloud"]) {
      expect(getFutureBySlug(slug)!).toMatchObject({ storyStatus: "ready", portfolioStatus: "ready" });
    }
  });
});
