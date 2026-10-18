import { describe, expect, it } from "vitest";

import { isAssetVerified } from "@/data/assets";
import { CHARACTERS } from "@/data/characters";
import { FUTURES } from "@/data/futures";
import { getFutureBySlug, getStoryScenes } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";
import { narrationParagraphs } from "@/lib/story-text";
import { futurePathSchema, validateCatalog } from "@/lib/validation";
import { BLOSSOM_SCENES } from "./blossom";
import { CLOUD_PROFILE, CLOUD_PROJECTS, CLOUD_SCENES, CLOUD_STORY_INTRO } from "./cloud";
import { STAR_SCENES } from "./star";

const cloud = () => getFutureBySlug("cloud")!;

describe("Cloud story content", () => {
  it("is future 4 with slug cloud, played by Cloud Maria", () => {
    expect(cloud().id).toBe(4);
    expect(cloud().slug).toBe("cloud");
    expect(cloud().characterId).toBe(4);
    expect(CHARACTERS.find((c) => c.id === 4)).toMatchObject({
      name: "Cloud Maria",
      profession: "Sky Explorer",
      tagline: "I can go somewhere I've never been before.",
      characterImage: "/characters/4.png",
    });
  });

  it("registers the story and its Cloud Path introduction", () => {
    expect(getStoryScenes("cloud")).toBe(CLOUD_SCENES);
    expect(CLOUD_STORY_INTRO).toMatchObject({
      title: "Cloud Path",
      subtitle: "How Maria became the Sky Explorer",
    });
    expect(CLOUD_STORY_INTRO.blurb).toMatch(/^One little red panda\. A lost little cloud\./);
    expect(CLOUD_STORY_INTRO.blurb).toMatch(/begin with one tiny step\.$/);
  });

  it("has exactly five scenes in order", () => {
    expect(CLOUD_SCENES.map((s) => s.id)).toEqual([1, 2, 3, 4, 5]);
    expect(CLOUD_SCENES.map((s) => s.title)).toEqual([
      "The Cloud That Fell From the Sky",
      "One Little Step Above the Clouds",
      "Lost in the Endless Sky",
      "The Bridge That Reached the Sky",
      "Becoming the Sky Explorer",
    ]);
  });

  it("uses Normal Maria for scenes 1–4 and Cloud Maria for scene 5", () => {
    expect(CLOUD_SCENES.slice(0, 4).every((s) => s.characterId === 1)).toBe(true);
    expect(CLOUD_SCENES[4].characterId).toBe(4);
  });

  it("points every scene at its own verified illustration, never Star's", () => {
    const starImages = new Set(STAR_SCENES.map((s) => s.image));
    CLOUD_SCENES.forEach((s) => {
      expect(s.image).toBe(`/stories/cloud/scene-${s.id}.png`);
      expect(isAssetVerified(s.image)).toBe(true);
      expect(starImages.has(s.image)).toBe(false);
    });
    expect(isAssetVerified("/stories/cloud/background.png")).toBe(true);
  });

  it("alternates the layout and gives every scene its own interaction", () => {
    expect(CLOUD_SCENES.map((s) => s.layout)).toEqual(["text-right", "text-left", "text-right", "text-left", "center"]);
    expect(CLOUD_SCENES.map((s) => s.interactionId)).toEqual([
      "worried-cloud",
      "cloud-steps",
      "wind-chimes",
      "cloud-bridge",
      "cloud-reveal",
    ]);
  });

  it("keeps the approved narration and Maria's spoken lines", () => {
    const s1 = narrationParagraphs(CLOUD_SCENES[0].narration);
    expect(s1[0].text).toBe(
      "One beautiful morning, Maria was playing near a waterfall when something soft and fluffy landed beside her.",
    );
    expect(s1.filter((p) => p.spoken).map((p) => p.text)).toEqual([
      "“There are houses all the way up there?”",
      "“I want to help you... but what if I’m too scared?”",
    ]);
    expect(CLOUD_SCENES[1].narration).toMatch(/“Being brave doesn’t mean I’m not scared!”$/);
    expect(CLOUD_SCENES[2].narration).toMatch(/“Wait\.\.\. the wind is showing me where to go!”$/);
    expect(CLOUD_SCENES[3].narration).toContain("“We did it! We found our way home!”");
    expect(CLOUD_SCENES[4].narration).toContain("And that was how Maria discovered another possible future.");
    expect(CLOUD_SCENES[4].narration).toMatch(/had finally found her wings\.$/);
  });

  it("passes the strict ready-story validation", () => {
    const result = futurePathSchema.safeParse({ ...cloud(), storyStatus: "ready" });
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
    expect(validateCatalog(CHARACTERS, FUTURES).success).toBe(true);
  });

  it("loads all five scenes through loadFutureView, with the reveal last", () => {
    const view = loadFutureView("cloud", { includeDrafts: true })!;
    expect(view.story.scenes.map((s) => s.position)).toEqual([1, 2, 3, 4, 5]);
    expect(view.story.origin.map((s) => s.character.id)).toEqual([1, 1, 1, 1]);
    expect(view.story.reveal?.character.name).toBe("Cloud Maria");
    expect(view.story.scenes.every((s) => s.verifiedImage === s.image)).toBe(true);
  });
});

describe("Cloud portfolio data", () => {
  it("has the complete Sky Explorer character sheet", () => {
    expect(CLOUD_PROFILE).toMatchObject({
      species: "Baby red panda",
      profession: "Sky Explorer, Cloud Maker and Floating-Island Adventurer",
      home: "The Floating Sky Islands",
      theme: "Courage and exploration",
      specialTalent: "Helping travelers navigate the sky",
      motto: "Every adventure begins with one little step.",
    });
    expect(CLOUD_PROFILE.personality).toEqual(["Adventurous", "curious", "brave", "playful", "imaginative"]);
    expect(CLOUD_PROFILE.strengths).toEqual([
      "Courage",
      "Curiosity",
      "Observation",
      "Navigation",
      "Creativity",
      "Problem-solving",
    ]);
    expect(CLOUD_PROFILE.about[0]).toBe("Hi! I’m Cloud Maria!");
  });

  it("registers three projects, each with its own verified artwork", () => {
    expect(CLOUD_PROJECTS.map((p) => p.title)).toEqual(["Cloud Maker", "Sky Route Planner", "Cloud Postcards"]);
    for (const p of CLOUD_PROJECTS) {
      expect(isAssetVerified(p.image)).toBe(true);
      expect(p.image).toMatch(/^\/projects\/cloud\//);
    }
  });
});

describe("Blossom and Star are unchanged", () => {
  it("keep their own scenes and reveals", () => {
    expect(getStoryScenes("blossom")).toBe(BLOSSOM_SCENES);
    expect(getStoryScenes("star")).toBe(STAR_SCENES);
    expect(BLOSSOM_SCENES[4].characterId).toBe(2);
    expect(STAR_SCENES[4].characterId).toBe(3);
    expect(getFutureBySlug("blossom")!.storyStatus).toBe("ready");
    expect(getFutureBySlug("star")!.storyStatus).toBe("ready");
  });
});
