import { describe, expect, it } from "vitest";

import {
  BUBBLE_MESSAGES,
  CLEANUP_STEPS,
  SCENE_CREATURES,
  TANGLES,
  allTanglesFound,
  bubbleLevel,
  canDoStep,
  cleanupReducer,
  creaturesReducer,
  initialCleanup,
  initialCreatures,
  initialTangles,
  isReefClean,
  tanglesReducer,
} from "./aqua-story";

describe("Scene 1: magical bubble", () => {
  it("brightens one step per tap, ending on the turtle without solving its problem", () => {
    expect(bubbleLevel(0)).toBe(0);
    expect(bubbleLevel(1)).toBe(1);
    expect(bubbleLevel(50)).toBe(BUBBLE_MESSAGES.length - 1);
    expect(BUBBLE_MESSAGES.at(-1)).toMatch(/turtle/);
    expect(BUBBLE_MESSAGES.at(-1)).not.toMatch(/safe|rescued|saved/i);
  });
});

describe("Scene 2: sea creatures", () => {
  it("has a turtle, a jellyfish and a reef fish", () => {
    expect(SCENE_CREATURES.map((c) => c.id)).toEqual(["turtle", "jellyfish", "reef-fish"]);
  });

  it("selects a creature and remembers who has been met", () => {
    let s = creaturesReducer(initialCreatures, { type: "select", id: "jellyfish" });
    s = creaturesReducer(s, { type: "select", id: "turtle" });
    s = creaturesReducer(s, { type: "select", id: "jellyfish" });
    expect(s).toEqual({ selected: "jellyfish", met: ["jellyfish", "turtle"] });
    // @ts-expect-error — not a creature
    expect(creaturesReducer(s, { type: "select", id: "shark" })).toBe(s);
    expect(creaturesReducer(s, { type: "reset" })).toEqual(initialCreatures);
  });
});

describe("Scene 3: tangled net", () => {
  it("counts each of the three tangles once, from 0/3 to 3/3", () => {
    let s = initialTangles;
    expect(s.inspected).toHaveLength(0);
    for (const t of TANGLES) s = tanglesReducer(s, { type: "inspect", id: t.id });
    s = tanglesReducer(s, { type: "inspect", id: "paw-knot" });
    expect(s.inspected).toHaveLength(3);
    expect(allTanglesFound(s)).toBe(true);
    expect(s.last).toBe("paw-knot");
  });
});

describe("Scene 4: reef cleanup", () => {
  it("clears the last corner only after the net and debris", () => {
    expect(canDoStep(initialCleanup, "last-area")).toBe(false);
    let s = cleanupReducer(initialCleanup, { type: "do", step: "last-area" });
    expect(s).toBe(initialCleanup);
    s = cleanupReducer(s, { type: "do", step: "debris" });
    s = cleanupReducer(s, { type: "do", step: "loose-net" });
    expect(isReefClean(s)).toBe(false);
    s = cleanupReducer(s, { type: "do", step: "last-area" });
    expect(isReefClean(s)).toBe(true);
    expect(s.done).toHaveLength(CLEANUP_STEPS.length);
  });

  it("doesn't repeat a step, and resets", () => {
    const s = cleanupReducer(initialCleanup, { type: "do", step: "debris" });
    expect(cleanupReducer(s, { type: "do", step: "debris" })).toBe(s);
    expect(cleanupReducer(s, { type: "reset" })).toEqual(initialCleanup);
  });
});
