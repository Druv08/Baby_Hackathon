import { describe, expect, it } from "vitest";

import { isAssetVerified } from "@/data/assets";
import { CHARACTERS } from "@/data/characters";
import { FUTURES } from "@/data/futures";
import { getFutureBySlug, getStoryScenes } from "@/lib/content";
import { narrationParagraphs } from "@/lib/story-text";
import { futurePathSchema, validateCatalog } from "@/lib/validation";
import { BLOSSOM_SCENES, BLOSSOM_STORY_INTRO } from "./blossom";

const blossom = () => getFutureBySlug("blossom")!;

describe("Blossom story content", () => {
  it("is future 2, played by Blossom Maria", () => {
    expect(blossom().id).toBe(2);
    expect(blossom().characterId).toBe(2);
    expect(CHARACTERS.find((c) => c.id === 2)).toMatchObject({ name: "Blossom Maria", profession: "Garden Keeper" });
  });

  it("registers the story and its introduction", () => {
    expect(getStoryScenes("blossom")).toBe(BLOSSOM_SCENES);
    expect(blossom().storyIntro).toEqual({
      title: "Blossom Path",
      subtitle: "How Maria became the Garden Keeper",
      blurb: "A new path begins, filled with flowers, new friends, and a garden waiting to bloom.",
    });
    expect(BLOSSOM_STORY_INTRO.title).toBe("Blossom Path");
  });

  it("has exactly five scenes in order", () => {
    expect(BLOSSOM_SCENES.map((s) => s.id)).toEqual([1, 2, 3, 4, 5]);
    expect(BLOSSOM_SCENES.map((s) => s.title)).toEqual([
      "The Forgotten Garden",
      "One Little Seed",
      "Learning to Wait",
      "The Garden Wakes Up",
      "Becoming Blossom Maria",
    ]);
  });

  it("uses Normal Maria for scenes 1–4 and Blossom Maria for scene 5", () => {
    expect(BLOSSOM_SCENES.slice(0, 4).every((s) => s.characterId === 1)).toBe(true);
    expect(BLOSSOM_SCENES[4].characterId).toBe(2);
  });

  it("points every scene at its own verified illustration", () => {
    BLOSSOM_SCENES.forEach((s) => {
      expect(s.image).toBe(`/stories/blossom/scene-${s.id}.png`);
      expect(isAssetVerified(s.image)).toBe(true);
    });
  });

  it("alternates the layout and gives every scene one interaction", () => {
    expect(BLOSSOM_SCENES.map((s) => s.layout)).toEqual(["text-right", "text-left", "text-right", "text-left", "center"]);
    expect(BLOSSOM_SCENES.map((s) => s.interactionId)).toEqual([
      "wilted-flower",
      "water-seed",
      "sunrise",
      "bloom-flowers",
      "blossom-reveal",
    ]);
  });

  it("keeps the approved narration, including Maria's spoken lines", () => {
    const scene1 = narrationParagraphs(BLOSSOM_SCENES[0].narration);
    expect(scene1).toHaveLength(6);
    expect(scene1[0].text).toMatch(/^One sunny morning, Maria wandered down a quiet path/);
    expect(scene1.filter((p) => p.spoken).map((p) => p.text)).toEqual(["“I wonder if I can make you smile again.”"]);
    expect(narrationParagraphs(BLOSSOM_SCENES[2].narration).find((p) => p.spoken)?.text).toBe(
      "“Oh! You were growing all along!” Maria giggled.",
    );
    expect(BLOSSOM_SCENES[4].narration).toMatch(/one of her eight possible futures\.$/);
  });

  it("passes the strict ready-story validation", () => {
    const result = futurePathSchema.safeParse({ ...blossom(), storyStatus: "ready" });
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
    expect(validateCatalog(CHARACTERS, FUTURES).success).toBe(true);
  });
});

describe("other futures are untouched", () => {
  it("leaves the futures without content pending with no scenes", () => {
    const others = FUTURES.filter((f) => !["blossom", "star", "cloud", "aqua", "inventor", "forest", "melody"].includes(f.slug));
    expect(others).toHaveLength(1);
    for (const f of others) {
      expect({ slug: f.slug, status: f.storyStatus, scenes: f.scenes.length, intro: f.storyIntro }).toEqual({
        slug: f.slug,
        status: "pending",
        scenes: 0,
        intro: undefined,
      });
    }
  });
});
