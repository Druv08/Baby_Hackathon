import { describe, expect, it } from "vitest";

import { FUTURES } from "@/data/futures";
import type { FuturePath } from "@/types/future";
import type { StoryScene } from "@/types/story";
import { buildFutureView, FUTURE_SECTIONS, loadFutureView } from "./future-view";
import { futurePathSchema } from "./validation";

function readyStar(): FuturePath {
  const scenes: StoryScene[] = [1, 2, 3, 4, 5].map((id) => ({
    id,
    title: `Scene ${id}`,
    narration: `Narration ${id}`,
    image: `/stories/test-fixture/scene-${id}.png`, // deliberately not a real file,
    characterId: id <= 4 ? 1 : 3,
    layout: id % 2 ? "text-left" : "text-right",
    interactionId: id === 5 ? "star-reveal" : undefined,
  }));
  const future: FuturePath = {
    ...FUTURES.find((f) => f.slug === "star")!,
    storyStatus: "ready",
    scenes,
  };
  futurePathSchema.parse(future); // the fixture itself must be valid
  return future;
}

describe("loadFutureView", () => {
  it("selects the right future and character by slug", () => {
    for (const f of FUTURES) {
      const view = loadFutureView(f.slug)!;
      expect(view.slug).toBe(f.slug);
      expect(view.id).toBe(f.characterId);
      expect(view.character.id).toBe(f.characterId);
      expect(view.character.slug).toBe(f.slug);
      expect(view.normalMaria.id).toBe(1);
    }
  });

  it("returns undefined for unknown slugs", () => {
    for (const slug of ["", "normal", "STAR", "unknown", "../star"]) {
      expect(loadFutureView(slug)).toBeUndefined();
    }
  });

  it("associates each future with its own hero image", () => {
    for (const f of FUTURES) {
      expect(loadFutureView(f.slug)!.heroImage).toBe(`/heroes/${f.slug}.png`);
    }
    expect(loadFutureView("blossom")!.storyCoverImage).toBe("/heroes/blossom-story-cover.png");
  });

  it("keeps unfinished stories usable with a hero but no story content", () => {
    for (const f of FUTURES.filter((f) => f.storyStatus !== "ready")) {
      const view = loadFutureView(f.slug)!;
      expect(view.story.status).not.toBe("ready");
      expect(view.story.canEnter).toBe(false);
      expect(view.story.scenes).toEqual([]);
      expect(view.story.reveal).toBeUndefined();
      expect(view.sections.hero).toBe(true);
      expect(view.sections.return).toBe(true);
      expect(view.sections["enter-story"]).toBe(false);
      expect(view.sections.origin).toBe(false);
      expect(view.readiness.heroAvailable).toBe(true);
    }
  });

  it("never exposes a project as playable unless it is live", () => {
    for (const f of FUTURES) {
      const view = loadFutureView(f.slug)!;
      for (const p of view.portfolio.projects) {
        expect(p.playable).toBe(p.implementation === "live" && p.interactionId !== undefined);
      }
      // Interactions come only from visible story scenes or live projects.
      const allowed = [
        ...view.story.scenes.flatMap((s) => (s.interactionId ? [s.interactionId] : [])),
        ...view.portfolio.projects.flatMap((p) => (p.playable && p.interactionId ? [p.interactionId] : [])),
      ];
      expect(view.interactions).toEqual(allowed);
      if (!view.readiness.portfolioReady) expect(view.sections.showcase).toBe(false);
      if (view.interactions.length === 0) expect(view.sections.interaction).toBe(false);
    }
  });

  it("lists sections in the documented order", () => {
    expect(Object.keys(loadFutureView("aqua")!.sections)).toEqual([...FUTURE_SECTIONS]);
  });
});

describe("buildFutureView with a ready story", () => {
  it("keeps scenes in declared order with the right characters", () => {
    const view = buildFutureView(readyStar())!;
    expect(view.story.canEnter).toBe(true);
    expect(view.story.scenes.map((s) => s.id)).toEqual([1, 2, 3, 4, 5]);
    expect(view.story.scenes.map((s) => s.position)).toEqual([1, 2, 3, 4, 5]);
    expect(view.story.origin.map((s) => s.character.id)).toEqual([1, 1, 1, 1]);
    expect(view.story.reveal?.character.id).toBe(3);
    expect(view.story.reveal?.character.characterImage).toBe("/characters/9.png"); // Star's design
    expect(view.sections.origin && view.sections.reveal).toBe(true);
  });

  it("collects scene interactions and does not mark unsupplied images as verified", () => {
    const view = buildFutureView(readyStar())!;
    expect(view.interactions).toEqual(["star-reveal"]);
    expect(view.story.scenes.every((s) => s.verifiedImage === undefined)).toBe(true);
  });

  it("hides draft scenes from visitors but shows them on request", () => {
    const draft = { ...readyStar(), storyStatus: "draft" as const };
    expect(buildFutureView(draft)!.story.scenes).toEqual([]);
    expect(buildFutureView(draft, { includeDrafts: true })!.story.scenes).toHaveLength(5);
    expect(buildFutureView(draft, { includeDrafts: true })!.story.canEnter).toBe(false);
  });

  it("only marks live projects with an interaction as playable", () => {
    const future = readyStar();
    future.projects = [
      ...future.projects,
      { id: "live-one", title: "Live", description: "d", status: "ready", implementation: "live", interactionId: "live-one" },
    ];
    const view = buildFutureView(future)!;
    expect(view.portfolio.projects.filter((p) => p.playable).map((p) => p.id)).toEqual(["live-one"]);
    expect(view.interactions).toContain("live-one");
  });
});
