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

/** Cloud artwork, copied byte-for-byte from Folder 4 after visual inspection. */
const CLOUD_ARTWORK: Record<string, string> = {
  "/stories/cloud/scene-1.png": "ba88873856a1fe81e20c3c749c0e1ce2de6a9ba39be27a7fc0e4721d234db6f7",
  "/stories/cloud/scene-2.png": "f67b88adc48564c67573fa5fe3863029a838f163efe0b6a393b0abd2cee53ba4",
  "/stories/cloud/scene-3.png": "44923129866cdaa6db0c631cc9dd732431f46ee1c3181df59e389c60b0e92191",
  "/stories/cloud/scene-4.png": "49d493dab15195b601ac59630ada9c77a9fb9c6cc99ab09e8e094c8e41e68a64",
  "/stories/cloud/scene-5.png": "c20b8c30e2289698f5938e206bc4301969cb3a3e17c272013f68cc15940380b5",
  "/stories/cloud/background.png": "c302caad549a0c116b5a8ecb8b96d1fa6e0ac9a5d54f5de76c789dc0cb543f06",
  "/projects/cloud/cloud-maker.png": "d1b341274e8940714cf12c34464e57926900c41ee2773188967734a58bddbab7",
  "/projects/cloud/sky-route-planner.png": "126df352435d21d9d69f05de2d7066b8bfe636971f14efcc98ffae004be6ccfb",
  "/projects/cloud/cloud-postcards.png": "c01fb15a50319ed49506ce59631399e1dd2cd8243f7aa5431b1e1cdf28238b79",
};

describe("Cloud artwork", () => {
  it.each(Object.entries(CLOUD_ARTWORK))("%s is the approved file and is registered", (path, hash) => {
    expect(sha256(path)).toBe(hash);
    expect(isAssetVerified(path)).toBe(true);
  });

  it("never reuses Star's celestial artwork", () => {
    const starHashes = new Set(Object.values(STAR_ARTWORK));
    for (const hash of Object.values(CLOUD_ARTWORK)) expect(starHashes.has(hash)).toBe(false);
  });

  it("Cloud Maria keeps her own locked design (4.png)", async () => {
    const { CHARACTERS } = await import("./characters");
    const cloud = CHARACTERS.find((c) => c.slug === "cloud")!;
    expect(cloud.id).toBe(4);
    expect(cloud.characterImage).toBe("/characters/4.png");
    expect(sha256(cloud.characterImage)).toBe(CANONICAL_CHARACTERS["/characters/4.png"]);
  });
});

/** Aqua artwork, copied byte-for-byte from Folder 5 after visual inspection. */
const AQUA_ARTWORK: Record<string, string> = {
  "/stories/aqua/scene-1.png": "a00765a5576a76e394c0fb02c62e2251b4b8eef2da6ec5e38873a36103fb7d6b",
  "/stories/aqua/scene-2.png": "874d59f7d434cede6b53bfda7f2bcf3131a3451a3ba3f9262c2039dc6d2b2d1d",
  "/stories/aqua/scene-3.png": "b233f42b9d6490c270e2e3f5caef4171cff16a0785a1e0502630e64885e5b8ca",
  "/stories/aqua/scene-4.png": "7f8e6415cfe5e6f3191dec7763cebe03cc4352e442255e5377bd85642a626ea0",
  "/stories/aqua/scene-5.png": "795cf61e838b74e43e83a161ecae96c4f987a1efe813560f745384ffac736770",
  "/stories/aqua/background.png": "5fa35fd05a7886dac62cce6e2bed047725689247f53cf519d6c43f742f210de6",
  "/projects/aqua/ocean-discovery.png": "478d6847c6a85a740dcf0b0a3ed13cc7011df51ca2b5e5dfb57cc27b72f80b63",
  "/projects/aqua/coral-care-garden.png": "6668824a98a66f8a758f2b3fb4b5e14739461d563883ebda7cfb5b7f5568b8a8",
  "/projects/aqua/turtles-safe-passage.png": "5516a74526b019970e0d75b932bf762e877d6f04e0020b041a800d74be2ac3f4",
};

describe("Aqua artwork", () => {
  it.each(Object.entries(AQUA_ARTWORK))("%s is the approved file and is registered", (path, hash) => {
    expect(sha256(path)).toBe(hash);
    expect(isAssetVerified(path)).toBe(true);
  });

  it("never reuses another world's artwork", () => {
    const others = new Set([...Object.values(BLOSSOM_ARTWORK), ...Object.values(STAR_ARTWORK), ...Object.values(CLOUD_ARTWORK)]);
    for (const hash of Object.values(AQUA_ARTWORK)) expect(others.has(hash)).toBe(false);
  });

  it("Aqua Maria keeps her own locked design (5.png)", async () => {
    const { CHARACTERS } = await import("./characters");
    const aqua = CHARACTERS.find((c) => c.slug === "aqua")!;
    expect(aqua.id).toBe(5);
    expect(aqua.characterImage).toBe("/characters/5.png");
    expect(sha256(aqua.characterImage)).toBe(CANONICAL_CHARACTERS["/characters/5.png"]);
  });
});

/** Inventor artwork, copied byte-for-byte from Folder 6 after visual inspection. */
const INVENTOR_ARTWORK: Record<string, string> = {
  "/stories/inventor/scene-1.png": "df7aa4b21206ddb7d777a213b1c8cc7d4a905002f0600fc8c8673cdb77b8eb20",
  "/stories/inventor/scene-2.png": "e0c7dadd88d480886f4b2d7694ced973ec5d56a79f40039f31a42b96c1118273",
  "/stories/inventor/scene-3.png": "83fa9a607f6041ca6012df558f0276381b3ad08d84e65c14d0803ffa895d14da",
  "/stories/inventor/scene-4.png": "0d164622148321aead672939d5f07a33077536282c3cf980ece136326e77dd4f",
  "/stories/inventor/scene-5.png": "900916552275ac488e5b9d9959c15b128326ab31c513b8f458df82d412e2114e",
  "/stories/inventor/background.png": "094df0a47c1b2fdb05e8fba8f7195560e956f0b6efd633cff75fe6daab3c8cd8",
  "/projects/inventor/star-workshop.png": "64766612e3f04a72a90fd505b1a682144a8b62aa24e325b6b432dba9cb56491b",
  "/projects/inventor/dream-lantern-lab.png": "43311a4d0a54850d00437510c71aeaadfa7acadd7803257a92b6806f482e0786",
  "/projects/inventor/little-helper-machines.png": "4af60ff9a36921acd5fdba47b15e4e47641572a68c13ac551ca2a3b1718c576f",
};

describe("Inventor artwork", () => {
  it.each(Object.entries(INVENTOR_ARTWORK))("%s is the approved file and is registered", (path, hash) => {
    expect(sha256(path)).toBe(hash);
    expect(isAssetVerified(path)).toBe(true);
  });

  it("never reuses another world's artwork", () => {
    const others = new Set([
      ...Object.values(BLOSSOM_ARTWORK),
      ...Object.values(STAR_ARTWORK),
      ...Object.values(CLOUD_ARTWORK),
      ...Object.values(AQUA_ARTWORK),
    ]);
    for (const hash of Object.values(INVENTOR_ARTWORK)) expect(others.has(hash)).toBe(false);
  });

  it("Inventor Maria keeps her own locked design (6.png)", async () => {
    const { CHARACTERS } = await import("./characters");
    const inventor = CHARACTERS.find((c) => c.slug === "inventor")!;
    expect(inventor.id).toBe(6);
    expect(inventor.characterImage).toBe("/characters/6.png");
    expect(sha256(inventor.characterImage)).toBe(CANONICAL_CHARACTERS["/characters/6.png"]);
  });
});

/** Forest artwork, copied byte-for-byte from Folder 7 after visual inspection. */
const FOREST_ARTWORK: Record<string, string> = {
  "/stories/forest/scene-1.png": "2f61fb028835d7c226a5d881fea896f153965bfb9d6692f5b2f74ef171ff97ec",
  "/stories/forest/scene-2.png": "992eb21287d1a87a00e3f109aca41a026b1fbff7d0f6ff3da3f912ee192b1278",
  "/stories/forest/scene-3.png": "24dffc187e22ef76f40bdc17a662c02a55a8ddb865c835f43ada7d1a4877bd7a",
  "/stories/forest/scene-4.png": "e50f8f74a33babe99e9ea0e94fd0e37398b0c11a74998758e9d46e58c06ed410",
  "/stories/forest/background.png": "263b40c7544411e574454f43431f8c609a8af94f9ee682cb8f4b8060a8658a3b",
  "/projects/forest/dream-delivery-map.png": "a22956946e3b7d4e96b691b8654bf58c4915ed73e45263c7f96a641394cd0613",
  "/projects/forest/forest-friends-field-guide.png": "12090806debdfd0adb089917256b43066d429867f82667d0e3017f688ae9ad0d",
};

describe("Forest artwork", () => {
  it.each(Object.entries(FOREST_ARTWORK))("%s is the approved file and is registered", (path, hash) => {
    expect(sha256(path)).toBe(hash);
    expect(isAssetVerified(path)).toBe(true);
  });

  it("registers the supplied signpost art while the reveal illustration remains missing", () => {
    expect(isAssetVerified("/stories/forest/scene-5.png")).toBe(false);
    expect(isAssetVerified("/projects/forest/whispering-signpost-workshop.png")).toBe(true);
  });

  it("never reuses another world's artwork", () => {
    const others = new Set([
      ...Object.values(BLOSSOM_ARTWORK),
      ...Object.values(STAR_ARTWORK),
      ...Object.values(CLOUD_ARTWORK),
      ...Object.values(AQUA_ARTWORK),
      ...Object.values(INVENTOR_ARTWORK),
    ]);
    for (const hash of Object.values(FOREST_ARTWORK)) expect(others.has(hash)).toBe(false);
  });

  it("Forest Maria keeps her own locked design (7.png)", async () => {
    const { CHARACTERS } = await import("./characters");
    const forest = CHARACTERS.find((c) => c.slug === "forest")!;
    expect(forest.id).toBe(7);
    expect(forest.characterImage).toBe("/characters/7.png");
    expect(sha256(forest.characterImage)).toBe(CANONICAL_CHARACTERS["/characters/7.png"]);
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
