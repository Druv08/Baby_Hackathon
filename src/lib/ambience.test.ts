import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { CHARACTER_SLUGS } from "@/types/character";
import { AMBIENCE, ambienceSlug } from "./ambience";

const onDisk = (url: string) => existsSync(join(process.cwd(), "public", decodeURIComponent(url)));

describe("character ambience", () => {
  it("gives all nine characters their own cursor, click sound and music, all present on disk", () => {
    expect(Object.keys(AMBIENCE).sort()).toEqual([...CHARACTER_SLUGS].sort());
    for (const a of Object.values(AMBIENCE)) {
      expect(onDisk(a.cursor)).toBe(true);
      expect(onDisk(a.click)).toBe(true);
      expect(onDisk(a.music)).toBe(true);
    }
    expect(new Set(Object.values(AMBIENCE).map((a) => a.cursor)).size).toBe(9);
    expect(new Set(Object.values(AMBIENCE).map((a) => a.music)).size).toBe(9);
  });

  it("uses the character's set on its pages and Normal Maria's everywhere else", () => {
    expect(ambienceSlug("/futures/aqua")).toBe("aqua");
    expect(ambienceSlug("/futures/luna/story")).toBe("luna");
    expect(ambienceSlug("/")).toBe("normal");
    expect(ambienceSlug("/memory-book")).toBe("normal");
    expect(ambienceSlug("/futures/normal")).toBe("normal");
    expect(ambienceSlug("/futures/unknown")).toBe("normal");
    expect(ambienceSlug(null)).toBe("normal");
  });
});
