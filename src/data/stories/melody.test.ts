import { describe, expect, it } from "vitest";
import { MELODY_SCENES, MELODY_PROJECTS, MELODY_PROFILE } from "./melody";
import { getFutureBySlug } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";
import { isAssetVerified } from "@/data/assets";
import { futurePathSchema } from "@/lib/validation";

describe("Melody content and artwork readiness", () => {
  it("opens the complete story and portfolio from the main character page", () => {
    expect(getFutureBySlug("melody")).toMatchObject({ id: 8, characterId: 8, storyStatus: "ready", portfolioStatus: "ready" });
    expect(loadFutureView("melody")!.story.canEnter).toBe(true);
    expect(loadFutureView("melody")!.story.scenes).toHaveLength(5);
    expect(futurePathSchema.safeParse(getFutureBySlug("melody")).success).toBe(true);
  });
  it("preserves origin/reveal identity, scene order, narration and alternating layouts", () => {
    expect(MELODY_SCENES.map(s => s.id)).toEqual([1, 2, 3, 4, 5]);
    expect(MELODY_SCENES.map(s => s.characterId)).toEqual([1, 1, 1, 1, 8]);
    expect(MELODY_SCENES.map(s => s.layout)).toEqual(["text-right", "text-left", "text-right", "text-left", "center"]);
    for (const scene of MELODY_SCENES) {
      expect(isAssetVerified(scene.image)).toBe(true);
      expect(scene.narration.length).toBeGreaterThan(600);
      expect(scene.image).toBe(`/stories/melody/scene-${scene.id}.png`);
    }
    expect(isAssetVerified("/stories/melody/background.png")).toBe(true);
  });
  it("registers three functioning creations with the supplied project pictures", () => {
    expect(MELODY_PROJECTS.map(p => p.id)).toEqual(["lullaby-lab", "rhythm-garden", "moonlight-music-box"]);
    expect(MELODY_PROJECTS.every(p => p.implementation === "live")).toBe(true);
    expect(MELODY_PROJECTS.map(p => p.image)).toEqual([
      "/projects/melody/lullaby-lab.png",
      "/projects/melody/supplied-dream-songbook.png",
      "/projects/melody/supplied-performance.png",
    ]);
    expect(MELODY_PROFILE.strengths).toContain("Empathy");
    expect(MELODY_PROFILE.motto).toBe("Every heart has a little song waiting to be heard.");
  });
});
