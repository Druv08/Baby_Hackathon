import { existsSync } from "node:fs";
import { join } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BLOSSOM_SCENES } from "@/data/stories/blossom";
import { getAllFutures, getStoryRouteSlugs, storyHref } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";
import { StoryText } from "./StoryText";

describe("Blossom story route", () => {
  it("lets the hero's Enter Story button reach the story page", () => {
    const view = loadFutureView("blossom")!;
    expect(view.story.canEnter).toBe(true);
    expect(view.sections["enter-story"]).toBe(true);
    expect(storyHref("blossom")).toBe("/futures/blossom/story");
    expect(existsSync(join(process.cwd(), "src/app/futures/[slug]/story/page.tsx"))).toBe(true);
  });

  it("only creates story pages for ready stories", () => {
    expect(getStoryRouteSlugs()).toEqual(["blossom", "star"]);
    for (const f of getAllFutures().filter((f) => !["blossom", "star"].includes(f.slug))) {
      expect(storyHref(f.slug)).toBeUndefined();
      expect(loadFutureView(f.slug)!.story.canEnter).toBe(false);
    }
  });

  it("keeps the reveal on Blossom Maria and the origin on Normal Maria", () => {
    const { story } = loadFutureView("blossom")!;
    expect(story.origin.map((s) => [s.id, s.character.id])).toEqual([[1, 1], [2, 1], [3, 1], [4, 1]]);
    expect(story.reveal?.id).toBe(5);
    expect(story.reveal?.character.characterImage).toBe("/characters/2.png");
    expect(story.scenes.every((s) => s.verifiedImage === s.image)).toBe(true);
  });
});

describe("StoryText", () => {
  it("renders every narration paragraph, setting spoken lines apart", () => {
    const html = renderToStaticMarkup(createElement(StoryText, { narration: BLOSSOM_SCENES[0].narration }));
    expect(html.match(/<p[ >]/g)).toHaveLength(6);
    expect(html).toContain("One sunny morning, Maria wandered down a quiet path");
    expect(html).toContain("She wanted to help.");
    expect(html).toMatch(/<p class="[^"]*spoken[^"]*">“I wonder if I can make you smile again\.”<\/p>/);
  });

  it("escapes text rather than rendering it as HTML", () => {
    const html = renderToStaticMarkup(createElement(StoryText, { narration: "<img src=x onerror=alert(1)>" }));
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });
});
