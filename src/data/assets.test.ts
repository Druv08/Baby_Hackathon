import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { getFutureReadiness, getHeroImage } from "@/lib/content";
import type { FuturePath } from "@/types/future";
import { isAssetVerified, VERIFIED_ASSETS } from "./assets";
import { CHARACTERS } from "./characters";
import { FUTURES } from "./futures";

const PUBLIC_DIR = join(process.cwd(), "public");

function referencedAssets(f: FuturePath): (string | undefined)[] {
  return [
    f.heroImage,
    f.storyCoverImage,
    ...f.scenes.map((s) => s.image),
    ...f.projects.map((p) => p.image),
  ];
}

describe("asset files", () => {
  it("every verified asset exists on disk", () => {
    const missing = [...VERIFIED_ASSETS].filter((p) => !existsSync(join(PUBLIC_DIR, p)));
    expect(missing).toEqual([]);
  });

  it("all nine locked character images are present and verified", () => {
    for (const c of CHARACTERS) expect(isAssetVerified(c.characterImage)).toBe(true);
  });

  it("every asset referenced by shipped content is verified", () => {
    const unverified = FUTURES.flatMap(referencedAssets).filter((p) => p !== undefined && !isAssetVerified(p));
    expect(unverified).toEqual([]);
  });

  it("missing optional images do not crash and are reported as unavailable", () => {
    expect(isAssetVerified(undefined)).toBe(false);
    expect(isAssetVerified("/heroes/not-supplied.webp")).toBe(false);
    // Readiness for a future still works whether or not a hero is set.
    expect(getFutureReadiness("star")?.heroAvailable).toBe(true);
    expect(getHeroImage("does-not-exist")).toBeUndefined();
  });
});
