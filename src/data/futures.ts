import { MELODY_PROFILE, MELODY_PROJECTS, MELODY_SCENES, MELODY_STORY_INTRO } from "./stories/melody";
import type { FuturePath } from "@/types/future";
import { AQUA_PROFILE, AQUA_PROJECTS, AQUA_SCENES, AQUA_STORY_INTRO } from "./stories/aqua";
import { BLOSSOM_PROFILE, BLOSSOM_PROJECTS, BLOSSOM_SCENES, BLOSSOM_STORY_INTRO } from "./stories/blossom";
import { CLOUD_PROFILE, CLOUD_PROJECTS, CLOUD_SCENES, CLOUD_STORY_INTRO } from "./stories/cloud";
import { FOREST_PROFILE, FOREST_PROJECTS, FOREST_SCENES, FOREST_STORY_INTRO } from "./stories/forest";
import { INVENTOR_PROFILE, INVENTOR_PROJECTS, INVENTOR_SCENES, INVENTOR_STORY_INTRO } from "./stories/inventor";
import { STAR_PROFILE, STAR_PROJECTS, STAR_SCENES, STAR_STORY_INTRO } from "./stories/star";

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
    storyStatus: "ready",
    portfolioStatus: "ready",
    storyIntro: BLOSSOM_STORY_INTRO,
    scenes: BLOSSOM_SCENES,
    profile: BLOSSOM_PROFILE,
    projects: BLOSSOM_PROJECTS,
  },
  {
    id: 3,
    slug: "star",
    characterId: 3,
    heroImage: "/heroes/star.png",
    storyStatus: "ready",
    portfolioStatus: "ready",
    storyIntro: STAR_STORY_INTRO,
    scenes: STAR_SCENES,
    profile: STAR_PROFILE,
    projects: STAR_PROJECTS,
  },
  {
    id: 4,
    slug: "cloud",
    characterId: 4,
    heroImage: "/heroes/cloud.png",
    storyStatus: "ready",
    portfolioStatus: "ready",
    storyIntro: CLOUD_STORY_INTRO,
    scenes: CLOUD_SCENES,
    profile: CLOUD_PROFILE,
    projects: CLOUD_PROJECTS,
  },
  {
    id: 5,
    slug: "aqua",
    characterId: 5,
    heroImage: "/heroes/aqua.png",
    storyStatus: "ready",
    portfolioStatus: "ready",
    storyIntro: AQUA_STORY_INTRO,
    scenes: AQUA_SCENES,
    profile: AQUA_PROFILE,
    projects: AQUA_PROJECTS,
  },
  {
    id: 6,
    slug: "inventor",
    characterId: 6,
    heroImage: "/heroes/inventor.png",
    storyStatus: "ready",
    portfolioStatus: "ready",
    storyIntro: INVENTOR_STORY_INTRO,
    scenes: INVENTOR_SCENES,
    profile: INVENTOR_PROFILE,
    projects: INVENTOR_PROJECTS,
  },
  {
    id: 7,
    slug: "forest",
    characterId: 7,
    heroImage: "/heroes/forest.png",
    storyStatus: "ready",
    portfolioStatus: "ready",
    storyIntro: FOREST_STORY_INTRO,
    scenes: FOREST_SCENES,
    profile: FOREST_PROFILE,
    projects: FOREST_PROJECTS,
  },
  {
    id: 8,
    slug: "melody",
    characterId: 8,
    heroImage: "/heroes/melody.png",
    storyStatus: "ready",
    portfolioStatus: "ready",
    storyIntro: MELODY_STORY_INTRO,
    scenes: MELODY_SCENES,
    profile: MELODY_PROFILE,
    projects: MELODY_PROJECTS,
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
