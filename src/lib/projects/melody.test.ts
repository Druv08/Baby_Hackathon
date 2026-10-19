import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkFlower, makeFlowerSequence, DEFAULT_SCORE, FREQUENCIES, INSTRUMENTS, MELODIES, MOOD_TRACKS, NOTES, RECORDED_NOTE_FILES } from "./melody";

describe("Melody musical models", () => {
  it("provides eight editable steps and different playable melodies", () => {
    expect(DEFAULT_SCORE).toHaveLength(8);
    expect(new Set(Object.values(MELODIES).map(score => score.join())).size).toBe(3);
    for (const score of [DEFAULT_SCORE, ...Object.values(MELODIES)]) for (const note of score) expect(FREQUENCIES[note]).toBeGreaterThan(0);
    expect(new Set(NOTES.map(n => FREQUENCIES[n])).size).toBe(NOTES.length);
  });
  it("generates repeatable sequences and checks each prefix, success and failure", () => {
    expect(makeFlowerSequence(4, () => .6)).toEqual([2, 2, 2, 2]);
    expect(makeFlowerSequence(3, () => 1)).toEqual([3, 3, 3]);
    expect(checkFlower([0, 2, 1], [0, 2])).toBe("continue");
    expect(checkFlower([0, 2, 1], [0, 2, 1])).toBe("complete");
    expect(checkFlower([0, 2, 1], [0, 1])).toBe("wrong");
    expect(checkFlower([0], [0, 1])).toBe("wrong");
  });
});

describe("Melody recorded music", () => {
  const onDisk = (url: string) => existsSync(join(process.cwd(), "public", decodeURIComponent(url)));
  it("has a recorded guitar note on disk for every playable note", () => {
    expect(Object.keys(RECORDED_NOTE_FILES).sort()).toEqual([...NOTES].sort());
    for (const file of Object.values(RECORDED_NOTE_FILES)) expect(onDisk(file)).toBe(true);
    expect(INSTRUMENTS[0]).toBe("Recorded guitar");
  });
  it("has a real song on disk for each mood", () => {
    expect(Object.keys(MOOD_TRACKS).sort()).toEqual(["Cheerful", "Energetic", "Gentle"]);
    for (const file of Object.values(MOOD_TRACKS)) expect(onDisk(file)).toBe(true);
  });
});
