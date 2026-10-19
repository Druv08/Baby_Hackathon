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
import { FOREST_PROFILE, FOREST_PROJECTS, FOREST_SCENES, FOREST_STORY_INTRO } from "./forest";
import { INVENTOR_SCENES } from "./inventor";
import { STAR_SCENES } from "./star";

const forest = () => getFutureBySlug("forest")!;

describe("Forest story content", () => {
  it("is future 7 with slug forest, played by Forest Maria", () => {
    expect(forest().id).toBe(7);
    expect(forest().slug).toBe("forest");
    expect(forest().characterId).toBe(7);
    expect(CHARACTERS.find((c) => c.id === 7)).toMatchObject({
      name: "Forest Maria",
      profession: "Pathfinder",
      tagline: "Knowing the way means helping others find theirs.",
      characterImage: "/characters/7.png",
    });
  });

  it("registers the story and its Forest Path introduction", () => {
    expect(getStoryScenes("forest")).toBe(FOREST_SCENES);
    expect(FOREST_STORY_INTRO).toMatchObject({ title: "Forest Path", subtitle: "How Maria became the Pathfinder" });
    expect(FOREST_STORY_INTRO.blurb).toMatch(/^One little red panda\. A forest filled with changing paths\./);
    expect(FOREST_STORY_INTRO.blurb).toMatch(/caring for everyone traveling beside you\.$/);
  });

  it("has exactly five scenes in order", () => {
    expect(FOREST_SCENES.map((s) => s.id)).toEqual([1, 2, 3, 4, 5]);
    expect(FOREST_SCENES.map((s) => s.title)).toEqual([
      "The Forest of Missing Footprints",
      "The Map That Couldn’t Stay Still",
      "When the Shortest Path Was Wrong",
      "A Path for Everyone",
      "Becoming the Pathfinder",
    ]);
  });

  it("uses Normal Maria for scenes 1–4 and Forest Maria for scene 5", () => {
    expect(FOREST_SCENES.slice(0, 4).every((s) => s.characterId === 1)).toBe(true);
    expect(FOREST_SCENES[4].characterId).toBe(7);
  });

  it("points scenes 1–4 at their own verified illustrations, never another world's", () => {
    const others = new Set([...BLOSSOM_SCENES, ...STAR_SCENES, ...CLOUD_SCENES, ...AQUA_SCENES, ...INVENTOR_SCENES].map((s) => s.image));
    FOREST_SCENES.slice(0, 4).forEach((s) => {
      expect(s.image).toBe(`/stories/forest/scene-${s.id}.png`);
      expect(isAssetVerified(s.image)).toBe(true);
      expect(others.has(s.image)).toBe(false);
    });
    expect(isAssetVerified("/stories/forest/background.png")).toBe(true);
  });

  it("shows the locked Forest Maria design in scene 5 until its illustration is supplied", () => {
    expect(isAssetVerified("/stories/forest/scene-5.png")).toBe(false);
    expect(FOREST_SCENES[4].image).toBe("/characters/7.png");
  });

  it("alternates the layout and gives every scene its own interaction", () => {
    expect(FOREST_SCENES.map((s) => s.layout)).toEqual(["text-right", "text-left", "text-right", "text-left", "center"]);
    expect(FOREST_SCENES.map((s) => s.interactionId)).toEqual([
      "turning-signpost",
      "shifting-map",
      "route-choice",
      "safe-route-map",
      "forest-reveal",
    ]);
  });

  it("keeps the approved narration and spoken lines", () => {
    const s1 = narrationParagraphs(FOREST_SCENES[0].narration);
    expect(s1[0].text).toBe("One sunny morning, Maria wandered along a little woodland trail, following the sounds of singing birds.");
    expect(s1.filter((p) => p.spoken).map((p) => p.text)).toEqual([
      "“Huh? Wasn’t there a path here a moment ago?”",
      "“Hello? Can somebody help me?”",
      "“Don’t worry! I’ll help you find your way home.”",
    ]);
    expect(FOREST_SCENES[1].narration).toContain("“Wait! That’s not where the path was!”");
    expect(FOREST_SCENES[2].narration).toContain("“Wait... what if the best path depends on who’s traveling?”");
    expect(FOREST_SCENES[3].narration).toMatch(/“Don’t worry\. We’ll find a way that’s right for you too!”$/);
    expect(FOREST_SCENES[4].narration).toContain("And that was how Maria discovered another possible future.");
    expect(FOREST_SCENES[4].narration).toMatch(/a guide who helped others find their own\.$/);
  });

  it("passes the strict ready-story validation", () => {
    const result = futurePathSchema.safeParse({ ...forest(), storyStatus: "ready" });
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
    expect(validateCatalog(CHARACTERS, FUTURES).success).toBe(true);
  });

  it("is ready, and loadFutureView returns all five scenes with the reveal last", () => {
    expect(forest().storyStatus).toBe("ready");
    const view = loadFutureView("forest")!;
    expect(view.story.canEnter).toBe(true);
    expect(view.story.scenes.map((s) => s.position)).toEqual([1, 2, 3, 4, 5]);
    expect(view.story.origin.map((s) => s.character.id)).toEqual([1, 1, 1, 1]);
    expect(view.story.reveal?.character.name).toBe("Forest Maria");
    expect(view.story.reveal?.character.characterImage).toBe("/characters/7.png");
  });
});

describe("Forest portfolio data", () => {
  it("has the complete Pathfinder character sheet", () => {
    expect(FOREST_PROFILE).toMatchObject({
      species: "Baby red panda",
      profession: "Pathfinder, Forest Guide and Magical Cartographer",
      home: "The Whispering Forest",
      theme: "Leadership, guidance and empathy",
      specialTalent: "Finding safe routes and helping lost creatures",
      motto: "Every journey deserves a little kindness.",
    });
    expect(FOREST_PROFILE.personality).toEqual(["Kind", "observant", "adventurous", "responsible", "resourceful"]);
    expect(FOREST_PROFILE.strengths).toEqual(["Leadership", "Empathy", "Navigation", "Observation", "Problem-solving", "Teamwork"]);
    expect(FOREST_PROFILE.about[0]).toBe("Hi! I’m Forest Maria!");
  });

  it("registers three projects; two have verified artwork, the signpost art is not supplied yet", () => {
    expect(FOREST_PROJECTS.map((p) => p.title)).toEqual(["Dream Delivery Map", "Forest Friends Field Guide", "Whispering Signpost Workshop"]);
    expect(FOREST_PROJECTS.map((p) => p.image)).toEqual([
      "/projects/forest/dream-delivery-map.png",
      "/projects/forest/forest-friends-field-guide.png",
      undefined,
    ]);
    for (const p of FOREST_PROJECTS.slice(0, 2)) expect(isAssetVerified(p.image)).toBe(true);
  });
});

describe("Earlier futures are unchanged", () => {
  it("keep their own scenes, reveals and readiness", () => {
    expect(getStoryScenes("blossom")).toBe(BLOSSOM_SCENES);
    expect(getStoryScenes("star")).toBe(STAR_SCENES);
    expect(getStoryScenes("cloud")).toBe(CLOUD_SCENES);
    expect(getStoryScenes("aqua")).toBe(AQUA_SCENES);
    expect(getStoryScenes("inventor")).toBe(INVENTOR_SCENES);
    for (const slug of ["blossom", "star", "cloud", "aqua", "inventor"]) {
      expect(getFutureBySlug(slug)!).toMatchObject({ storyStatus: "ready", portfolioStatus: "ready" });
    }
  });
});
