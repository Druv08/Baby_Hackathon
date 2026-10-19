import { describe, expect, it } from "vitest";

import {
  KEEPSAKES,
  LANTERN_MESSAGES,
  LIBRARY_KEEPSAKES,
  MEMORIES,
  STORY_PAIRS,
  approachReducer,
  cluesReducer,
  initialApproach,
  initialClues,
  initialMatch,
  lanternLevel,
  storyMatchReducer,
  type MatchAction,
} from "./luna-story";

describe("Scene 1: fading lantern", () => {
  it("flickers without ever being restored", () => {
    expect(lanternLevel(0)).toBe(0);
    expect(lanternLevel(42)).toBe(LANTERN_MESSAGES.length - 1);
    expect(LANTERN_MESSAGES.join(" ")).not.toMatch(/restored|shines again/i);
    expect(LANTERN_MESSAGES.join(" ")).toMatch(/incomplete/);
  });
});

describe("Scene 2: keepsake clues", () => {
  it("has three keepsakes with distinct clues, counted 0/3 to 3/3", () => {
    expect(LIBRARY_KEEPSAKES).toEqual(["flower", "bell", "boat"]);
    const clues = KEEPSAKES.filter((k) => LIBRARY_KEEPSAKES.includes(k.id)).map((k) => k.clue);
    expect(new Set(clues).size).toBe(3);
    let s = initialClues;
    for (const id of [...LIBRARY_KEEPSAKES, "flower" as const]) s = cluesReducer(s, { type: "examine", id });
    expect(s.found).toHaveLength(3);
    expect(cluesReducer(s, { type: "examine", id: "photo" })).toBe(s);
  });
});

describe("Scene 3: the story behind it", () => {
  it("stays dim with the object alone and glows with the story", () => {
    const dim = approachReducer(initialApproach, { type: "try", approach: "object" });
    expect(dim.glowing).toBe(false);
    const lit = approachReducer(dim, { type: "try", approach: "story" });
    expect(lit).toEqual({ tried: ["object", "story"], glowing: true });
  });
});

describe("Scene 4: memory matching", () => {
  const run = (actions: MatchAction[]) => actions.reduce(storyMatchReducer, initialMatch);

  it("uses the flower, boat and photograph pairs from the story", () => {
    expect(STORY_PAIRS).toEqual([
      { keepsake: "flower", memory: "rabbit-friend" },
      { keepsake: "boat", memory: "squirrel-adventure" },
      { keepsake: "photo", memory: "owlet-flight" },
    ]);
    for (const p of STORY_PAIRS) expect(MEMORIES.find((m) => m.id === p.memory)!.keepsake).toBe(p.keepsake);
  });

  it("refuses wrong matches gently and completes at 3/3", () => {
    let s = run([{ type: "pick", id: "flower" }, { type: "match", memory: "owlet-flight" }]);
    expect(s.last).toBe("wrong");
    expect(s.matched).toEqual([]);
    s = run([
      ...STORY_PAIRS.flatMap((p) => [{ type: "pick", id: p.keepsake }, { type: "match", memory: p.memory }] as MatchAction[]),
    ]);
    expect(s.matched).toEqual(["flower", "boat", "photo"]);
    expect(storyMatchReducer(s, { type: "reset" })).toEqual(initialMatch);
  });

  it("asks for a keepsake before a memory", () => {
    expect(run([{ type: "match", memory: "rabbit-friend" }]).last).toBe("pick-first");
  });
});
