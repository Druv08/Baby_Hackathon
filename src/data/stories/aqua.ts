import type { CharacterProfile, StoryIntro } from "@/types/future";
import type { PortfolioProject } from "@/types/project";
import type { StoryScene } from "@/types/story";

/**
 * Aqua Maria's origin story — "The Heart of the Forgotten Ocean".
 * Scenes 1–4 feature Normal Maria (character 1); scene 5 reveals
 * Aqua Maria (character 5). Narration paragraphs are separated by a blank
 * line; lines that open with a quote mark are Maria speaking.
 *
 * Scene 5's "Aqua Maria — The Ocean Guardian." and her tagline are rendered
 * from the character record, so only the narration around them is kept here.
 */

export const AQUA_STORY_INTRO: StoryIntro = {
  title: "Aqua Path",
  subtitle: "How Maria became the Ocean Guardian",
  blurb:
    "One little red panda. A mysterious ocean. And a tiny turtle waiting for someone to help. Follow Maria beneath the waves as she discovers that true strength can come from caring for others.",
};

export const AQUA_SCENES: StoryScene[] = [
  {
    id: 1,
    title: "The Storm and the Little Turtle",
    characterId: 1,
    image: "/stories/aqua/scene-1.png",
    layout: "text-right",
    interactionId: "magic-bubble",
    narration: [
      "One sunny afternoon, Maria was exploring a peaceful beach, collecting beautiful seashells beside the waves.",
      "Suddenly, dark clouds covered the sky.",
      "The wind grew stronger, the waves became enormous, and before Maria could run, a powerful wave swept her into the ocean!",
      "“Ahh! Where am I going?”",
      "Just as she began to panic, a magical bubble surrounded her, allowing her to breathe beneath the water.",
      "Maria opened her eyes and discovered a beautiful underwater world.",
      "But something caught her attention.",
      "A tiny sea turtle was struggling to swim against the powerful current.",
      "Maria forgot her own fear for a moment.",
      "“Oh no! Are you lost too?”",
      "She reached toward the little turtle.",
    ].join("\n\n"),
  },
  {
    id: 2,
    title: "A Kingdom Beneath the Waves",
    characterId: 1,
    image: "/stories/aqua/scene-2.png",
    layout: "text-left",
    interactionId: "sea-creatures",
    narration: [
      "Maria followed the little turtle through a glowing underwater passage.",
      "Along the way, she discovered colorful fish, dancing jellyfish and magnificent coral gardens.",
      "Far in the distance stood a beautiful underwater kingdom.",
      "“Wow! I never knew a whole world existed beneath the waves!”",
      "But as Maria swam closer, she noticed something strange.",
      "Some of the coral had lost its colors. Empty shells covered the ocean floor, and several little creatures were hiding.",
      "The turtle guided Maria toward a reef tangled in old fishing nets.",
      "Its home had become dangerous.",
      "Maria looked at the frightened animals.",
      "“Don’t worry, little friends. I’ll try to help you!”",
      "For the first time, Maria understood that the ocean wasn’t just beautiful.",
      "It was someone’s home.",
    ].join("\n\n"),
  },
  {
    id: 3,
    title: "The Reef That Needed Help",
    characterId: 1,
    image: "/stories/aqua/scene-3.png",
    layout: "text-right",
    interactionId: "tangled-net",
    narration: [
      "Maria hurried toward the tangled reef.",
      "She tried pulling the fishing net away, but it was caught tightly around the coral.",
      "Every time she pulled harder, the delicate coral bent.",
      "“Oh no! I’m making it worse!”",
      "Maria stopped.",
      "She wanted to help, but she didn’t know how.",
      "The little turtle gently nudged her paw.",
      "Maria looked closely and noticed that the net was caught around three large rocks.",
      "“If I move it carefully, maybe I can free everyone without hurting their home!”",
      "She examined the knots and watched how the water moved.",
      "Then she began making a plan.",
      "Maria realized that helping someone wasn’t always about being the strongest.",
      "Sometimes, it meant slowing down and understanding what they needed.",
    ].join("\n\n"),
  },
  {
    id: 4,
    title: "The Ocean Comes Alive Again",
    characterId: 1,
    image: "/stories/aqua/scene-4.png",
    layout: "text-left",
    interactionId: "reef-cleanup",
    narration: [
      "Maria carefully loosened the net, one knot at a time.",
      "She waited for the current to settle and gently lifted the tangled pieces away from the coral.",
      "At last, the net came free!",
      "The little turtle happily swam around her.",
      "“We did it! You’re safe now!”",
      "With help from the sea creatures, Maria gathered the remaining debris and made room for the coral garden to recover.",
      "As the water became clearer, colorful fish returned to the reef.",
      "A beautiful glow spread through the underwater kingdom.",
      "Maria watched the turtle swim freely through its home.",
      "“I thought I needed to be brave enough to fight the ocean. But all I needed was to care for it.”",
      "And in that moment, Maria discovered something wonderful.",
    ].join("\n\n"),
  },
  {
    id: 5,
    title: "Becoming the Ocean Guardian",
    characterId: 5,
    image: "/stories/aqua/scene-5.png",
    layout: "center",
    interactionId: "aqua-reveal",
    narration: [
      "As Maria looked across the peaceful reef, she remembered how frightened she had been when the storm carried her into the ocean.",
      "She had discovered a world she never knew existed.",
      "A world filled with beautiful creatures, hidden wonders and little lives that needed protecting.",
      "Maria realized she loved exploring the ocean, helping sea creatures and caring for the places they called home.",
      "She imagined a future where she could protect underwater kingdoms, restore forgotten reefs and make the ocean safer for everyone.",
      "The little turtle swam into her arms as the water filled with magical light.",
      "And that was how Maria discovered another possible future.",
    ].join("\n\n"),
  },
];

export const AQUA_PROFILE: CharacterProfile = {
  species: "Baby red panda",
  profession: "Ocean Guardian, Marine Protector and Underwater Explorer",
  personality: ["Caring", "brave", "gentle", "observant", "protective"],
  specialTalent: "Protecting sea creatures and restoring ocean habitats",
  home: "The Forgotten Ocean Kingdom",
  theme: "Compassion and responsibility",
  about: [
    "Hi! I’m Aqua Maria!",
    "I explore beautiful underwater kingdoms, make friends with sea creatures, and protect the magical ocean we all share.",
    "I believe every little creature deserves a safe home, no matter how big or small they are!",
  ],
  whatIDo:
    "I protect underwater habitats, help lost sea creatures, restore damaged coral gardens, and discover wonderful secrets hidden beneath the waves.",
  strengths: ["Compassion", "Responsibility", "Observation", "Teamwork", "Courage", "Problem-solving"],
  journey:
    "I discovered my passion when a powerful storm carried me into the ocean. There, I helped a little turtle and learned how important it is to protect the homes of underwater creatures.",
  motto: "The ocean is everyone’s home. Let’s protect it together.",
};

/**
 * Aqua Maria's three creations. Proposed until each playable module exists;
 * a project only becomes `live` once its interaction genuinely works.
 */
export const AQUA_PROJECTS: PortfolioProject[] = [
  {
    id: "ocean-discovery",
    title: "Ocean Discovery",
    description:
      "Explore Aqua Maria’s magical underwater kingdom, discover fascinating sea creatures, and collect little ocean discoveries along the way.",
    image: "/projects/aqua/ocean-discovery.png",
    interactionId: "ocean-discovery",
    status: "draft",
    implementation: "proposed",
  },
  {
    id: "coral-care-garden",
    title: "Coral Care Garden",
    description:
      "A magical underwater garden Maria created to help damaged coral reefs recover and give little sea creatures a safer home.",
    image: "/projects/aqua/coral-care-garden.png",
    interactionId: "coral-care-garden",
    status: "draft",
    implementation: "proposed",
  },
  {
    id: "turtles-safe-passage",
    title: "Turtle’s Safe Passage",
    description:
      "Help Aqua Maria guide her little turtle friend through a magical underwater route filled with beautiful reefs, ocean currents and hidden obstacles.",
    image: "/projects/aqua/turtles-safe-passage.png",
    interactionId: "turtles-safe-passage",
    status: "draft",
    implementation: "proposed",
  },
];
