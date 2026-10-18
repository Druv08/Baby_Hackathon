import { describe, expect, it } from "vitest";

import {
  getAllCharacters,
  getAllFutures,
  getFutureBySlug,
  getFutureCharacter,
  getFutureReadiness,
  getHeroImage,
  getPortfolioProjects,
  getStoryScenes,
  isFutureStoryReady,
  isProjectPlayable,
} from "./content";

describe("content helpers", () => {
  it("returns all characters and futures", () => {
    expect(getAllCharacters()).toHaveLength(9);
    expect(getAllFutures()).toHaveLength(8);
  });

  it("looks up a future and its character by slug", () => {
    expect(getFutureBySlug("melody")?.characterId).toBe(8);
    expect(getFutureCharacter("melody")?.profession).toBe("Lullaby Maker");
  });

  it("returns undefined for unknown slugs instead of throwing", () => {
    for (const slug of ["unknown", "normal", ""]) {
      expect(getFutureBySlug(slug)).toBeUndefined();
      expect(getStoryScenes(slug)).toBeUndefined();
      expect(getPortfolioProjects(slug)).toBeUndefined();
      expect(getFutureReadiness(slug)).toBeUndefined();
      expect(getHeroImage(slug)).toBeUndefined();
      expect(isFutureStoryReady(slug)).toBe(false);
    }
  });

  it("handles pending futures with no scenes", () => {
    expect(getStoryScenes("luna")).toEqual([]);
    expect(isFutureStoryReady("luna")).toBe(false);
    expect(getFutureReadiness("luna")).toEqual({
      heroAvailable: true,
      storyReady: false,
      portfolioReady: false,
      complete: false,
    });
  });

  it("only exposes hero images that are verified", () => {
    expect(getHeroImage("star")).toBe("/heroes/star.png");
  });

  it("does not report proposed projects as playable", () => {
    for (const f of getAllFutures()) {
      for (const p of f.projects) {
        if (p.implementation !== "live") expect(isProjectPlayable(p)).toBe(false);
      }
    }
    expect(
      isProjectPlayable({ id: "x", title: "X", description: "", status: "ready", implementation: "live", interactionId: "x" }),
    ).toBe(true);
  });
});
