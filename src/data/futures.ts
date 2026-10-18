import type { FuturePath } from "@/types/future";
import { BLOSSOM_SCENES, BLOSSOM_STORY_INTRO } from "./stories/blossom";

/**
 * The eight independent futures. To add content for one future, edit only its
 * entry: add scenes/projects, then flip `storyStatus` / `portfolioStatus` to
 * `ready` once validation passes.
 *
 * Planned projects are `proposed` — metadata only, no interactive feature yet.
 * Featured-project names come from each future's hero design.
 */
export const FUTURES: FuturePath[] = [
  {
    id: 2,
    slug: "blossom",
    characterId: 2,
    heroImage: "/heroes/blossom.png",
    storyCoverImage: "/heroes/blossom-story-cover.png",
    // Draft until the story route is live and verified.
    storyStatus: "draft",
    portfolioStatus: "pending",
    storyIntro: BLOSSOM_STORY_INTRO,
    scenes: BLOSSOM_SCENES,
    projects: [
      {
        id: "dream-garden",
        title: "Dream Garden",
        description:
          "A magical garden waiting to bloom again. Explore, plant, and help bring the colors back to life.",
        status: "draft",
        implementation: "proposed",
      },
      {
        id: "bloom-book",
        title: "Bloom Book",
        description: "",
        status: "pending",
        implementation: "proposed",
      },
      {
        id: "butterfly-corner",
        title: "Butterfly Corner",
        description: "",
        status: "pending",
        implementation: "proposed",
      },
    ],
  },
  {
    id: 3,
    slug: "star",
    characterId: 3,
    heroImage: "/heroes/star.png",
    storyStatus: "pending",
    portfolioStatus: "pending",
    scenes: [],
    projects: [
      {
        id: "constellation-builder",
        title: "Constellation Builder",
        description:
          "Connect forgotten wishes and create your own constellation in Maria's night sky.",
        status: "draft",
        implementation: "proposed",
      },
      {
        id: "little-star-atlas",
        title: "Little Star Atlas",
        description: "",
        status: "pending",
        implementation: "proposed",
      },
      {
        id: "wish-observatory",
        title: "Wish Observatory",
        description: "",
        status: "pending",
        implementation: "proposed",
      },
    ],
  },
  {
    id: 4,
    slug: "cloud",
    characterId: 4,
    heroImage: "/heroes/cloud.png",
    storyStatus: "pending",
    portfolioStatus: "pending",
    scenes: [],
    projects: [
      {
        id: "cloud-maker",
        title: "Cloud Maker",
        description: "Let's find more skies together!",
        status: "draft",
        implementation: "proposed",
      },
    ],
  },
  {
    id: 5,
    slug: "aqua",
    characterId: 5,
    heroImage: "/heroes/aqua.png",
    storyStatus: "pending",
    portfolioStatus: "pending",
    scenes: [],
    projects: [
      {
        id: "ocean-discovery",
        title: "Ocean Discovery",
        description:
          "Dive into Maria's underwater world and meet the amazing sea friends she protects.",
        status: "draft",
        implementation: "proposed",
      },
    ],
  },
  {
    id: 6,
    slug: "inventor",
    characterId: 6,
    heroImage: "/heroes/inventor.png",
    storyStatus: "pending",
    portfolioStatus: "pending",
    scenes: [],
    projects: [
      {
        id: "star-workshop",
        title: "Star Workshop",
        description: "Where broken dreams become new possibilities.",
        status: "draft",
        implementation: "proposed",
      },
    ],
  },
  {
    id: 7,
    slug: "forest",
    characterId: 7,
    heroImage: "/heroes/forest.png",
    storyStatus: "pending",
    portfolioStatus: "pending",
    scenes: [],
    projects: [
      {
        id: "dream-delivery-map",
        title: "Dream Delivery Map",
        description: "See the forest map Maria created to help her new friends.",
        status: "draft",
        implementation: "proposed",
      },
    ],
  },
  {
    id: 8,
    slug: "melody",
    characterId: 8,
    heroImage: "/heroes/melody.png",
    storyStatus: "pending",
    portfolioStatus: "pending",
    scenes: [],
    projects: [
      {
        id: "lullaby-lab",
        title: "Lullaby Lab",
        description:
          "Explore the magic of music and create your own lullaby with Maria.",
        status: "draft",
        implementation: "proposed",
      },
    ],
  },
  {
    id: 9,
    slug: "luna",
    characterId: 9,
    heroImage: "/heroes/luna.png",
    storyStatus: "pending",
    portfolioStatus: "pending",
    scenes: [],
    projects: [],
  },
];
