import type { CharacterProfile, StoryIntro } from "@/types/future";
import type { PortfolioProject } from "@/types/project";
import type { StoryScene } from "@/types/story";

/**
 * Blossom Maria's origin story — "How Maria became the Garden Keeper".
 * Scenes 1–4 feature Normal Maria (character 1); scene 5 reveals
 * Blossom Maria (character 2). Narration paragraphs are separated by a
 * blank line; lines wrapped in quotes are Maria speaking.
 *
 * Scene 5's closing lines ("Blossom Maria — The Garden Keeper." and
 * “I can help things grow.”) are rendered from the character record.
 */

export const BLOSSOM_STORY_INTRO: StoryIntro = {
  title: "Blossom Path",
  subtitle: "How Maria became the Garden Keeper",
  blurb: "A new path begins, filled with flowers, new friends, and a garden waiting to bloom.",
};

export const BLOSSOM_SCENES: StoryScene[] = [
  {
    id: 1,
    title: "The Forgotten Garden",
    characterId: 1,
    image: "/stories/blossom/scene-1.png",
    layout: "text-right",
    interactionId: "wilted-flower",
    narration: [
      "One sunny morning, Maria wandered down a quiet path and discovered an old garden hidden behind a wooden gate.",
      "The flowers were drooping, the butterflies had disappeared, and the garden had lost its beautiful colors.",
      "Maria gently touched a wilted flower.",
      "“I wonder if I can make you smile again.”",
      "For the first time, Maria wanted to do more than explore.",
      "She wanted to help.",
    ].join("\n\n"),
  },
  {
    id: 2,
    title: "One Little Seed",
    characterId: 1,
    image: "/stories/blossom/scene-2.png",
    layout: "text-left",
    interactionId: "water-seed",
    narration: [
      "Maria found a tiny seed beside the garden path.",
      "She had never planted anything before, but she decided to give it a chance.",
      "She dug a little hole, covered the seed with soil, and carefully watered it.",
      "“Every big garden must start with one little seed!”",
      "Maria smiled, imagining all the flowers that might someday grow.",
      "She didn’t know whether it would work, but she wanted to try.",
    ].join("\n\n"),
  },
  {
    id: 3,
    title: "Learning to Wait",
    characterId: 1,
    image: "/stories/blossom/scene-3.png",
    layout: "text-right",
    interactionId: "sunrise",
    narration: [
      "The next morning, Maria rushed back to the garden.",
      "Nothing had grown.",
      "She returned the following day, but the soil still looked the same.",
      "For a moment, Maria wondered if she had failed.",
      "Instead of giving up, she kept watering the seed, giving it sunlight, and caring for the garden.",
      "One morning, a tiny green sprout appeared.",
      "“Oh! You were growing all along!” Maria giggled.",
      "She was beginning to understand that beautiful things take time.",
    ].join("\n\n"),
  },
  {
    id: 4,
    title: "The Garden Wakes Up",
    characterId: 1,
    image: "/stories/blossom/scene-4.png",
    layout: "text-left",
    interactionId: "bloom-flowers",
    narration: [
      "Days passed, and Maria’s little sprout finally opened into a beautiful flower.",
      "Maria was delighted!",
      "Encouraged by her success, she cared for the other plants, planted more seeds, and slowly restored the neglected garden.",
      "Soon, flowers filled the pathways, butterflies returned, and the garden became brighter than ever.",
      "Maria looked around proudly.",
      "“We did it! All you needed was a little love and patience!”",
      "For the first time, Maria knew what made her truly happy.",
    ].join("\n\n"),
  },
  {
    id: 5,
    title: "Becoming Blossom Maria",
    characterId: 2,
    image: "/stories/blossom/scene-5.png",
    layout: "center",
    interactionId: "blossom-reveal",
    narration: [
      "Maria had discovered something wonderful.",
      "She loved planting seeds, helping flowers grow, and bringing forgotten places back to life.",
      "What started as one little act of kindness had become something she wanted to keep doing.",
      "Maria imagined a future where she could care for magical gardens and make the world a little more beautiful.",
      "And that was how she discovered one of her eight possible futures.",
    ].join("\n\n"),
  },
];

export const BLOSSOM_PROFILE: CharacterProfile = {
  species: "Baby red panda",
  personality: ["Gentle", "curious", "patient", "caring", "optimistic"],
  specialTalent: "Helping forgotten gardens bloom again",
  home: "The Forgotten Garden",
  theme: "Patience, kindness and growth",
  about: [
    "Hi! I’m Blossom Maria!",
    "I take care of magical gardens, grow beautiful flowers, and create safe little homes for butterflies.",
    "I believe that even the smallest seed can become something wonderful when someone cares for it.",
  ],
  whatIDo:
    "I restore forgotten gardens, nurture magical plants, collect special seeds, and help tiny garden creatures find safe places to live.",
  strengths: ["Patience", "Kindness", "Creativity", "Observation", "Caring for nature"],
  journey: "I discovered my passion when I brought a forgotten garden back to life, starting with just one tiny seed.",
  motto: "Every little flower deserves a chance to bloom.",
};

/**
 * Blossom Maria's three creations — each a small playable experience.
 * No Bloom Book artwork was supplied, so it has no image.
 */
export const BLOSSOM_PROJECTS: PortfolioProject[] = [
  {
    id: "dream-garden",
    title: "Dream Garden",
    description:
      "A magical garden Maria created where visitors can plant seeds, water them, and watch beautiful flowers bloom.",
    image: "/projects/blossom/dream-garden.png",
    interactionId: "dream-garden",
    status: "ready",
    implementation: "live",
  },
  {
    id: "bloom-book",
    title: "Bloom Book",
    description:
      "Blossom Maria’s magical flower journal, filled with little discoveries, beautiful petals, and stories about the flowers she has cared for.",
    interactionId: "bloom-book",
    status: "ready",
    implementation: "live",
  },
  {
    id: "butterfly-corner",
    title: "Butterfly Corner",
    description:
      "A peaceful little sanctuary Blossom Maria built to help butterflies find flowers, shelter, and a safe place to rest.",
    image: "/projects/blossom/butterfly-corner.png",
    interactionId: "butterfly-corner",
    status: "ready",
    implementation: "live",
  },
];
