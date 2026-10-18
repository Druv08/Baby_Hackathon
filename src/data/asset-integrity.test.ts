import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { isAssetVerified } from "./assets";

const sha256 = (publicPath: string) =>
  createHash("sha256").update(readFileSync(join(process.cwd(), "public", publicPath))).digest("hex");

/** Locked character designs. Any change to these files is a bug. */
const CANONICAL_CHARACTERS: Record<string, string> = {
  "/characters/1.png": "5d8ba4091d3e93db86742def97320373ae7a94ba3f90a84def16423000b6fbf4",
  "/characters/2.png": "df3c0fb8703f74e3fbc1dd58e3e36657fb7e93453c17e9da055d1878540f1d74",
  "/characters/3.png": "6b6455eb6c7c32808ccc90c9b656220d31d40aaf20bca553b31cb447696de03d",
  "/characters/4.png": "06d60e0d92c1589e215f219daa9fd11a882f9e88777539e3a53e0edf8d9b439f",
  "/characters/5.png": "500aac1f7828078bccc1b95410005ef943149e04bcc7d81bce69ee82808f7abe",
  "/characters/6.png": "e126cc0a5c4b19ee75fbb7c46bb9e962af4be35074ae032c728d6215ebbd0170",
  "/characters/7.png": "de67b4d989ff5eef3d95842b48a5b333feef4b986308d56e07ac511751720e96",
  "/characters/8.png": "8a06ba6fcdd3dc13893ecec8bd29388e552c93a842902033034c93f6a5b222cf",
  "/characters/9.png": "c5b2e43568c954e00fd39c634b415417e9af4961f6c9648b479ef2e53c3963db",
};

/**
 * Blossom artwork, copied byte-for-byte from the supplied files.
 * scene-1 is the corrected version (concerned expression, wilted garden),
 * not the rejected smiling one.
 */
const BLOSSOM_ARTWORK: Record<string, string> = {
  "/stories/blossom/scene-1.png": "ae215e06739d96be9fb8811d527529d1f494e5ba6dc351b4895d03d86cd2546e",
  "/stories/blossom/scene-2.png": "d8ba59c10ffca2089ae45f078277266b68861f6558fffe3deafdc7634be0b6b4",
  "/stories/blossom/scene-3.png": "089f6a010c19c802df673f879192691998da821c10dd2cce4dfc10a671a41f93",
  "/stories/blossom/scene-4.png": "93b84bf6b990f018d61cfc272ec3e101ce438d7eb6176133c2ae590a5ddd3104",
  "/stories/blossom/scene-5.png": "b80900104c24cc9c77fa83e769a997addafc9e6ec55dc84f7b6688eafcc3d9bc",
  "/projects/blossom/dream-garden.png": "51718a012c61cbc1ecdfe1588f10d1c6d697aa4cf3c16c5db34fdbe9118b9e04",
  "/projects/blossom/butterfly-corner.png": "07125c749f6b057205ac59954eed57a0779075b1f022a500013de8147118cac3",
  "/projects/blossom/bloom-book.png": "fa53e53b180948a8cf207a264774a372d1983fd785023ce124ee4fd3cc2edc84",
  "/stories/blossom/background.png": "bfdca3efb965010a2b40e0f1967709547fd0f53b735a5cd062511885fd1a4891",
};

describe("canonical character integrity", () => {
  it.each(Object.entries(CANONICAL_CHARACTERS))("%s is unchanged", (path, hash) => {
    expect(sha256(path)).toBe(hash);
  });
});

describe("Blossom artwork", () => {
  it.each(Object.entries(BLOSSOM_ARTWORK))("%s is the approved file and is registered", (path, hash) => {
    expect(sha256(path)).toBe(hash);
    expect(isAssetVerified(path)).toBe(true);
  });

  it("uses the corrected Scene 1 illustration", () => {
    expect(sha256("/stories/blossom/scene-1.png")).toBe(
      "ae215e06739d96be9fb8811d527529d1f494e5ba6dc351b4895d03d86cd2546e",
    );
  });

  it("does not register artwork that was never supplied", () => {
    expect(isAssetVerified("/stories/blossom/scene-6.png")).toBe(false);
    expect(isAssetVerified("/projects/blossom/unknown.png")).toBe(false);
  });
});

/** Star artwork, copied byte-for-byte from Folder 3 after visual inspection. */
const STAR_ARTWORK: Record<string, string> = {
  "/stories/star/scene-1.png": "a76ed16f530f66a95cd155b6ddf817f27897a535fb0b60fdbb960f0a3f028614",
  "/stories/star/scene-2.png": "8d0cfd42ac59c7373c19d539233fbd9b1f5bde526a2bc07371336234d74668ba",
  "/stories/star/scene-3.png": "7d4038328110229cf8096cc610a98ab1976e13cf90943422f2ec28d57b00ac44",
  "/stories/star/scene-4.png": "a76d0cb0de273b59940706dcde6178bca8e490b774b203a38483ec8e6fed8b29",
  "/stories/star/scene-5.png": "0b9a5e3b1a6f7c406b787865693b17487a32cc4b343d93f8e71347002aa326a3",
  "/stories/star/background.png": "61145f6fa3cef44474cb9b815a17c9889296345b6c68ee322a0c5b530fabdeed",
  "/projects/star/constellation-builder.png": "156991a9eed1f70d3254058dfdf7e756a988802b8e86a990ff6eee44636ae563",
  "/projects/star/dream-atlas.png": "d8eb98bb64d71dc0fd70fa3dd10b83cb9281cd7195b23ab8b3a52eee14066c59",
  "/projects/star/stargazers-telescope.png": "04adf2ac3326db123a949e4b8460f6183fdf46ce0c895be0273783eec86a8e8f",
};

describe("Star artwork", () => {
  it.each(Object.entries(STAR_ARTWORK))("%s is the approved file and is registered", (path, hash) => {
    expect(sha256(path)).toBe(hash);
    expect(isAssetVerified(path)).toBe(true);
  });
});

describe("Star / Luna design mapping", () => {
  it("shows Star with the hooded dream-jar design and Luna with the witch hat, without touching the files", async () => {
    const { CHARACTERS } = await import("./characters");
    const star = CHARACTERS.find((c) => c.slug === "star")!;
    const luna = CHARACTERS.find((c) => c.slug === "luna")!;
    expect(star.id).toBe(3);
    expect(luna.id).toBe(9);
    expect(sha256(star.characterImage)).toBe(CANONICAL_CHARACTERS["/characters/9.png"]);
    expect(sha256(luna.characterImage)).toBe(CANONICAL_CHARACTERS["/characters/3.png"]);
    expect(star.characterImage).not.toBe(luna.characterImage);
  });
});
