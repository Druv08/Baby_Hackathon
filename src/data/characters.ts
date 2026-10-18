import type { Character } from "@/types/character";

/**
 * The nine locked Maria designs. IDs are permanent. Each points at its
 * locked art in `/characters/`, which matches the id for every character
 * except Star (3) and Luna (9): their canonical files hold each other's
 * design (confirmed against both hero mockups), so they are cross-mapped here
 * rather than renaming the locked files. Taglines come from the hero designs.
 */
export const CHARACTERS: Character[] = [
  {
    id: 1,
    slug: "normal",
    name: "Normal Maria",
    profession: "Curious Dreamer",
    characterImage: "/characters/1.png",
  },
  {
    id: 2,
    slug: "blossom",
    name: "Blossom Maria",
    profession: "Garden Keeper",
    tagline: "I can help things grow.",
    characterImage: "/characters/2.png",
  },
  {
    id: 3,
    slug: "star",
    name: "Star Maria",
    profession: "Dream Mapper",
    tagline: "I can turn questions into discoveries.",
    // Design swap: the hooded dream-jar art (Star) is stored as 9.png.
    characterImage: "/characters/9.png",
  },
  {
    id: 4,
    slug: "cloud",
    name: "Cloud Maria",
    profession: "Sky Explorer",
    tagline: "I can go somewhere I've never been before.",
    characterImage: "/characters/4.png",
  },
  {
    id: 5,
    slug: "aqua",
    name: "Aqua Maria",
    profession: "Ocean Guardian",
    tagline: "Being strong can mean protecting someone else.",
    characterImage: "/characters/5.png",
  },
  {
    id: 6,
    slug: "inventor",
    name: "Inventor Maria",
    profession: "Star Mechanic",
    tagline: "If something doesn't exist, I can build it.",
    characterImage: "/characters/6.png",
  },
  {
    id: 7,
    slug: "forest",
    name: "Forest Maria",
    profession: "Pathfinder",
    tagline: "Knowing the way means helping others find theirs.",
    characterImage: "/characters/7.png",
  },
  {
    id: 8,
    slug: "melody",
    name: "Melody Maria",
    profession: "Lullaby Maker",
    tagline: "Sometimes a feeling can do what tools cannot.",
    characterImage: "/characters/8.png",
  },
  {
    id: 9,
    slug: "luna",
    name: "Luna Maria",
    profession: "Memory Keeper",
    tagline: "Every version of me is still me.",
    // Design swap: the witch-hat art (Luna) is stored as 3.png.
    characterImage: "/characters/3.png",
  },
];
