import { describe, expect, it } from "vitest";

import { getStoryRouteSlugs, storyHref } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";
import {
  connectedStars,
  constellationReducer,
  initialConstellation,
  isPatternComplete,
  type ConstellationAction,
  type ConstellationOptions,
  type ConstellationState,
  type Edge,
} from "./constellation";

const stars = ["a", "b", "c", "d"].map((id, i) => ({ id, x: i * 20, y: 50, label: id }));
const run = (actions: ConstellationAction[], options: ConstellationOptions = { stars }) =>
  actions.reduce<ConstellationState>((s, a) => constellationReducer(s, a, options), initialConstellation);
const sel = (starId: string): ConstellationAction => ({ type: "select", starId });

describe("constellation engine", () => {
  it("connects consecutive stars with lines and keeps them", () => {
    const s = run([sel("a"), sel("b"), sel("c")]);
    expect(s.edges).toEqual([["a", "b"], ["b", "c"]]);
    expect(s.active).toBe("c");
    expect([...connectedStars(s.edges)].sort()).toEqual(["a", "b", "c"]);
  });

  it("ignores unknown stars and duplicate lines; reselecting a star deselects it", () => {
    expect(run([sel("zzz")])).toEqual(initialConstellation);
    expect(run([sel("a"), sel("b"), sel("a")]).edges).toHaveLength(1); // b–a is the same line
    expect(run([sel("a"), sel("a")]).active).toBeNull();
  });

  it("undoes, clears and keeps the name across a clear", () => {
    const s = run([sel("a"), sel("b"), sel("c"), { type: "rename", name: "Little Paw" }, { type: "undo" }]);
    expect(s.edges).toEqual([["a", "b"]]);
    const cleared = constellationReducer(s, { type: "clear" }, { stars });
    expect(cleared).toEqual({ active: null, edges: [], rejected: null, name: "Little Paw" });
  });

  it("caps and cleans constellation names", () => {
    expect(run([{ type: "rename", name: "x".repeat(80) }]).name).toHaveLength(30);
    expect(run([{ type: "rename", name: "Star\u0000\nMap" }]).name).toBe("StarMap");
  });

  it("softly rejects lines outside the target pattern, then completes it", () => {
    const target: Edge[] = [["a", "b"], ["b", "c"]];
    const options = { stars, target };
    const wrong = run([sel("a"), sel("d")], options);
    expect(wrong.edges).toEqual([]);
    expect(wrong.rejected).toEqual(["a", "d"]);
    expect(wrong.active).toBe("a"); // stays on the same star
    const done = run([sel("a"), sel("d"), sel("b"), sel("c")], options);
    expect(done.rejected).toBeNull();
    expect(isPatternComplete(done.edges, target)).toBe(true);
    expect(isPatternComplete([], target)).toBe(false);
    expect(isPatternComplete([["a", "b"]], [])).toBe(false);
  });
});

describe("Star story route", () => {
  it("opens from the hero and reveals Star Maria (not Luna)", () => {
    const view = loadFutureView("star")!;
    expect(view.story.canEnter).toBe(true);
    expect(storyHref("star")).toBe("/futures/star/story");
    expect(getStoryRouteSlugs()).toContain("star");
    expect(view.story.origin.map((s) => s.character.id)).toEqual([1, 1, 1, 1]);
    expect(view.story.reveal?.character.slug).toBe("star");
    expect(view.story.reveal?.character.characterImage).toBe("/characters/9.png"); // Star's design
    expect(view.story.scenes.every((s) => s.verifiedImage === s.image)).toBe(true);
  });
});
