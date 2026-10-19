import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { CHARACTER_SLUGS } from "@/types/character";
import { PAW_FILES, pawFor, pawForCharacterId } from "./paws";

describe("paw emblems", () => {
  it("gives all nine characters their own paw, present on disk", () => {
    expect(Object.keys(PAW_FILES).sort()).toEqual([...CHARACTER_SLUGS].sort());
    expect(new Set(Object.values(PAW_FILES)).size).toBe(9);
    for (const slug of CHARACTER_SLUGS) expect(existsSync(join(process.cwd(), "public", pawFor(slug)))).toBe(true);
  });

  it("maps slugs and ids, falling back to Normal Maria's paw", () => {
    expect(pawFor("inventor")).toBe("/paws/clockwork_paw_emblem.png");
    expect(pawForCharacterId(9)).toBe("/paws/celestial_sakura_paw_emblem.png");
    expect(pawFor("unknown")).toBe("/paws/glowing_sakura_paw_emblem.png");
    expect(pawFor(null)).toBe("/paws/glowing_sakura_paw_emblem.png");
    expect(pawForCharacterId(42)).toBe("/paws/glowing_sakura_paw_emblem.png");
  });
});
