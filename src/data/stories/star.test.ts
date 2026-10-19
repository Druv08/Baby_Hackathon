import { describe, expect, it } from "vitest";

import { isAssetVerified } from "@/data/assets";
import { CHARACTERS } from "@/data/characters";
import { FUTURES } from "@/data/futures";
import { getFutureBySlug, getStoryScenes } from "@/lib/content";
import { narrationParagraphs } from "@/lib/story-text";
import { futurePathSchema, validateCatalog } from "@/lib/validation";
import { BLOSSOM_SCENES } from "./blossom";
import { STAR_PROFILE, STAR_PROJECTS, STAR_SCENES, STAR_STORY_INTRO } from "./star";

const star = () => getFutureBySlug("star")!;

describe("Star story content", () => {
  it("is future 3 with slug star, played by Star Maria", () => {
    expect(star().id).toBe(3);
    expect(star().slug).toBe("star");
    expect(star().characterId).toBe(3);
    expect(CHARACTERS.find((c) => c.id === 3)).toMatchObject({
      name: "Star Maria",
      profession: "Dream Mapper",
      tagline: "I can turn questions into discoveries.",
    });
  });

  it("registers the story and its introduction", () => {
    expect(getStoryScenes("star")).toBe(STAR_SCENES);
    expect(STAR_STORY_INTRO.title).toBe("Star Path");
    expect(STAR_STORY_INTRO.subtitle).toBe("How Maria became the Dream Mapper");
    expect(STAR_STORY_INTRO.blurb).toMatch(/^One little red panda\./);
  });

  it("has exactly five scenes in order", () => {
    expect(STAR_SCENES.map((s) => s.id)).toEqual([1, 2, 3, 4, 5]);
    expect(STAR_SCENES.map((s) => s.title)).toEqual([
      "The Night of a Thousand Questions",
      "The Forgotten Observatory",
      "The Stars That Wouldn’t Connect",
      "Connecting the Forgotten Dreams",
      "Becoming the Dream Mapper",
    ]);
  });

  it("uses Normal Maria for scenes 1–4 and Star Maria (never Luna) for scene 5", () => {
    expect(STAR_SCENES.slice(0, 4).every((s) => s.characterId === 1)).toBe(true);
    expect(STAR_SCENES[4].characterId).toBe(3);
    expect(STAR_SCENES.some((s) => s.characterId === 9)).toBe(false);
  });

  it("points every scene at its own verified illustration", () => {
    STAR_SCENES.forEach((s) => {
      expect(s.image).toBe(`/stories/star/scene-${s.id}.png`);
      expect(isAssetVerified(s.image)).toBe(true);
    });
    expect(isAssetVerified("/stories/star/background.png")).toBe(true);
  });

  it("alternates the layout and gives every scene its own interaction", () => {
    expect(STAR_SCENES.map((s) => s.layout)).toEqual(["text-right", "text-left", "text-right", "text-left", "center"]);
    expect(STAR_SCENES.map((s) => s.interactionId)).toEqual([
      "lonely-star",
      "telescope-peek",
      "unfinished-constellation",
      "connect-dreams",
      "star-reveal",
    ]);
  });

  it("keeps the approved narration and Maria's spoken lines", () => {
    const s1 = narrationParagraphs(STAR_SCENES[0].narration);
    expect(s1[0].text).toBe("One quiet evening, Maria sat beneath a sky filled with twinkling stars.");
    expect(s1.filter((p) => p.spoken).map((p) => p.text)).toEqual([
      "“Why are some stars all alone? Don’t they have friends?”",
      "“Are you trying to show me something?”",
    ]);
    expect(STAR_SCENES[2].narration).toContain("“I wish I could find my way home.”");
    expect(STAR_SCENES[3].narration).toMatch(/She had created her very first Dream Map\.$/);
    expect(STAR_SCENES[4].narration).toMatch(/had become someone who could bring them together\.$/);
  });

  it("passes the strict ready-story validation", () => {
    const result = futurePathSchema.safeParse({ ...star(), storyStatus: "ready" });
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
    expect(validateCatalog(CHARACTERS, FUTURES).success).toBe(true);
  });
});

describe("Star portfolio data", () => {
  it("has the complete Dream Mapper character sheet", () => {
    expect(STAR_PROFILE).toMatchObject({
      species: "Baby red panda",
      home: "The Forgotten Observatory",
      theme: "Curiosity and discovery",
      specialTalent: "Mapping forgotten wishes into constellations",
      motto: "Every question is the beginning of a new discovery.",
    });
    expect(STAR_PROFILE.strengths).toEqual(["Curiosity", "Observation", "Imagination", "Problem-solving", "Mapmaking", "Patience"]);
    expect(STAR_PROFILE.about[0]).toBe("Hi! I’m Star Maria!");
  });

  it("registers three projects, each with its own verified artwork", () => {
    expect(STAR_PROJECTS.map((p) => p.title)).toEqual(["Constellation Builder", "The Dream Atlas", "Stargazer’s Telescope"]);
    for (const p of STAR_PROJECTS) expect(isAssetVerified(p.image)).toBe(true);
  });
});

describe("Blossom is unchanged", () => {
  it("still has its own five scenes and Blossom Maria reveal", () => {
    expect(getStoryScenes("blossom")).toBe(BLOSSOM_SCENES);
    expect(BLOSSOM_SCENES[4].characterId).toBe(2);
    expect(getFutureBySlug("blossom")!.storyStatus).toBe("ready");
  });
});
