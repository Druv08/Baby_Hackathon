import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { isAssetVerified } from "@/data/assets";
import { CHARACTERS } from "@/data/characters";
import { FUTURES } from "@/data/futures";
import { getFutureBySlug, getStoryScenes } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";
import { narrationParagraphs } from "@/lib/story-text";
import { futurePathSchema, validateCatalog } from "@/lib/validation";
import { LUNA_PROFILE, LUNA_PROJECTS, LUNA_SCENES, LUNA_STORY_INTRO } from "./luna";
import { STAR_SCENES } from "./star";

const luna = () => getFutureBySlug("luna")!;
const sha256 = (p: string) => createHash("sha256").update(readFileSync(join(process.cwd(), "public", p))).digest("hex");

describe("Luna story content", () => {
  it("is future 9 with slug luna, played by Luna Maria", () => {
    expect(luna().id).toBe(9);
    expect(luna().slug).toBe("luna");
    expect(luna().characterId).toBe(9);
    expect(CHARACTERS.find((c) => c.id === 9)).toMatchObject({
      name: "Luna Maria",
      profession: "Memory Keeper",
      tagline: "Every version of me is still me.",
    });
  });

  it("registers the story and its Luna Path introduction", () => {
    expect(getStoryScenes("luna")).toBe(LUNA_SCENES);
    expect(LUNA_STORY_INTRO).toMatchObject({ title: "Luna Path", subtitle: "How Maria became the Memory Keeper" });
    expect(LUNA_STORY_INTRO.blurb).toMatch(/^One little red panda\. A village of forgotten memories\./);
    expect(LUNA_STORY_INTRO.blurb).toMatch(/part of what makes us who we are\.$/);
  });

  it("has exactly five scenes in order", () => {
    expect(LUNA_SCENES.map((s) => s.id)).toEqual([1, 2, 3, 4, 5]);
    expect(LUNA_SCENES.map((s) => s.title)).toEqual([
      "The Village of Fading Lanterns",
      "The Library of Forgotten Moments",
      "The Memory That Wouldn’t Return",
      "A Thousand Memories, One Beautiful Night",
      "Becoming the Memory Keeper",
    ]);
  });

  it("uses Normal Maria for scenes 1–4 and Luna Maria (never Star) for scene 5", () => {
    expect(LUNA_SCENES.slice(0, 4).every((s) => s.characterId === 1)).toBe(true);
    expect(LUNA_SCENES[4].characterId).toBe(9);
    expect(LUNA_SCENES.some((s) => s.characterId === 3)).toBe(false);
  });

  it("points scenes 1–4 at their own verified illustrations, never Star's", () => {
    const star = new Set(STAR_SCENES.map((s) => s.image));
    LUNA_SCENES.slice(0, 4).forEach((s) => {
      expect(s.image).toBe(`/stories/luna/scene-${s.id}.png`);
      expect(isAssetVerified(s.image)).toBe(true);
      expect(star.has(s.image)).toBe(false);
    });
    expect(isAssetVerified("/stories/luna/background.png")).toBe(true);
  });

  it("shows Luna's own locked design in scene 5 (the witch-hat art, not Star's hooded art)", () => {
    const lunaArt = CHARACTERS.find((c) => c.id === 9)!.characterImage;
    const starArt = CHARACTERS.find((c) => c.id === 3)!.characterImage;
    expect(isAssetVerified("/stories/luna/scene-5.png")).toBe(false);
    expect(LUNA_SCENES[4].image).toBe(lunaArt);
    expect(sha256(LUNA_SCENES[4].image!)).not.toBe(sha256(starArt));
  });

  it("alternates the layout and gives every scene its own interaction", () => {
    expect(LUNA_SCENES.map((s) => s.layout)).toEqual(["text-right", "text-left", "text-right", "text-left", "center"]);
    expect(LUNA_SCENES.map((s) => s.interactionId)).toEqual([
      "fading-lantern",
      "keepsake-clues",
      "story-behind",
      "memory-match",
      "luna-reveal",
    ]);
  });

  it("keeps the approved narration and spoken lines", () => {
    const s1 = narrationParagraphs(LUNA_SCENES[0].narration);
    expect(s1[0].text).toBe("One beautiful evening, Maria wandered into a peaceful village beside a moonlit lake.");
    expect(s1.filter((p) => p.spoken).at(-1)?.text).toBe("“Then maybe I can find a way!”");
    expect(LUNA_SCENES[1].narration).toMatch(/“Maybe these little things can help everyone remember!”$/);
    expect(LUNA_SCENES[2].narration).toContain("“It’s the story behind it!”");
    expect(LUNA_SCENES[3].narration).toMatch(/It was about remembering why that moment mattered\.$/);
    expect(LUNA_SCENES[4].narration).toContain("And that was how Maria discovered another possible future.");
    expect(LUNA_SCENES[4].narration).toMatch(/remember where she came from\.$/);
  });

  it("passes the strict ready-story validation", () => {
    const result = futurePathSchema.safeParse({ ...luna(), storyStatus: "ready" });
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
    expect(validateCatalog(CHARACTERS, FUTURES).success).toBe(true);
  });

  it("loads all five scenes through loadFutureView, with the reveal last", () => {
    const view = loadFutureView("luna", { includeDrafts: true })!;
    expect(view.story.scenes.map((s) => s.position)).toEqual([1, 2, 3, 4, 5]);
    expect(view.story.origin.map((s) => s.character.id)).toEqual([1, 1, 1, 1]);
    expect(view.story.reveal?.character.name).toBe("Luna Maria");
  });
});

describe("Luna portfolio data", () => {
  it("has the complete Memory Keeper character sheet", () => {
    expect(LUNA_PROFILE).toMatchObject({
      species: "Baby red panda",
      profession: "Memory Keeper, Story Collector and Guardian of Precious Moments",
      home: "The Moonlit Village of Memories",
      motto: "Little moments become the stories we carry forever.",
    });
    expect(LUNA_PROFILE.personality).toEqual(["Gentle", "thoughtful", "caring", "nostalgic", "imaginative"]);
    expect(LUNA_PROFILE.strengths).toEqual(["Empathy", "Listening", "Creativity", "Reflection", "Storytelling", "Thoughtfulness"]);
    expect(LUNA_PROFILE.about[0]).toBe("Hi! I’m Luna Maria!");
  });

  it("registers three projects, each with its own verified artwork", () => {
    expect(LUNA_PROJECTS.map((p) => p.title)).toEqual(["Moonlit Memory Book", "Memory Lantern Studio", "The Keepsake Cabinet"]);
    for (const p of LUNA_PROJECTS) {
      expect(isAssetVerified(p.image)).toBe(true);
      expect(p.image).toMatch(/^\/projects\/luna\//);
    }
  });
});
