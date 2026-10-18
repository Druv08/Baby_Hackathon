import type { CharacterProfile, StoryIntro } from "@/types/future";
import type { PortfolioProject } from "@/types/project";
import type { StoryScene } from "@/types/story";

/**
 * Cloud Maria's origin story — "The Sky Beyond the Waterfall".
 * Scenes 1–4 feature Normal Maria (character 1); scene 5 reveals
 * Cloud Maria (character 4). Narration paragraphs are separated by a blank
 * line; lines that open with a quote mark are Maria speaking.
 *
 * Scene 5's "Cloud Maria — The Sky Explorer." and her tagline are rendered
 * from the character record, so only the narration around them is kept here.
 */

export const CLOUD_STORY_INTRO: StoryIntro = {
  title: "Cloud Path",
  subtitle: "How Maria became the Sky Explorer",
  blurb:
    "One little red panda. A lost little cloud. And a world waiting high above the mountains. Follow Maria as she discovers that sometimes the bravest adventures begin with one tiny step.",
};

export const CLOUD_SCENES: StoryScene[] = [
  {
    id: 1,
    title: "The Cloud That Fell From the Sky",
    characterId: 1,
    image: "/stories/cloud/scene-1.png",
    layout: "text-right",
    interactionId: "worried-cloud",
    narration: [
      "One beautiful morning, Maria was playing near a waterfall when something soft and fluffy landed beside her.",
      "It was a tiny cloud!",
      "The little cloud looked worried. It had drifted away from its home, a magical village floating high above the mountains.",
      "Maria looked up and noticed islands hidden among the clouds.",
      "“There are houses all the way up there?”",
      "The little cloud pointed toward a broken sky bridge.",
      "Maria wanted to help, but when she looked down from the nearby cliff, her paws began to tremble.",
      "She had never been so high before.",
      "“I want to help you... but what if I’m too scared?”",
    ].join("\n\n"),
  },
  {
    id: 2,
    title: "One Little Step Above the Clouds",
    characterId: 1,
    image: "/stories/cloud/scene-2.png",
    layout: "text-left",
    interactionId: "cloud-steps",
    narration: [
      "Maria discovered a staircase made of tiny floating clouds behind the waterfall.",
      "Each step gently bounced when she touched it.",
      "She placed one paw on the first cloud, then carefully lifted the other.",
      "Suddenly, a gust of wind made the staircase wobble!",
      "Maria crouched down and held on tightly.",
      "“Maybe exploring the sky isn’t such a good idea...”",
      "The little cloud floated beside her and waited patiently.",
      "Maria took a deep breath.",
      "“Okay. Just one more step.”",
      "Slowly, one step became two, then three.",
      "Before she knew it, Maria was standing above the waterfall.",
      "“Being brave doesn’t mean I’m not scared!”",
    ].join("\n\n"),
  },
  {
    id: 3,
    title: "Lost in the Endless Sky",
    characterId: 1,
    image: "/stories/cloud/scene-3.png",
    layout: "text-right",
    interactionId: "wind-chimes",
    narration: [
      "Maria finally reached the floating islands, but thick clouds suddenly covered everything.",
      "She couldn’t see the village, the waterfall, or even the path behind her.",
      "The wind scattered her little cloud friend away.",
      "“Hello? Where did everybody go?”",
      "Maria felt frightened and alone.",
      "She sat on a floating rock and wondered whether she should turn back.",
      "Then she heard a gentle ringing sound.",
      "Far away, golden wind chimes were swinging from an island.",
      "Maria noticed something interesting: every time the chimes rang, the nearby clouds drifted in the same direction.",
      "“Wait... the wind is showing me where to go!”",
    ].join("\n\n"),
  },
  {
    id: 4,
    title: "The Bridge That Reached the Sky",
    characterId: 1,
    image: "/stories/cloud/scene-4.png",
    layout: "text-left",
    interactionId: "cloud-bridge",
    narration: [
      "Maria followed the movement of the clouds and discovered a broken bridge leading toward the village.",
      "Now she understood how the sky worked!",
      "By ringing the nearby wind chimes in the right order, she could guide the little clouds into place.",
      "One by one, they gathered into a soft, glowing pathway.",
      "Maria carefully crossed the bridge and found her lost cloud friend waiting on the other side.",
      "The little cloud bounced happily.",
      "“We did it! We found our way home!”",
      "As Maria looked around the floating village, she discovered waterfalls pouring into clouds, beautiful windmills, and islands waiting to be explored.",
      "“There are so many wonderful places I’ve never seen!”",
    ].join("\n\n"),
  },
  {
    id: 5,
    title: "Becoming the Sky Explorer",
    characterId: 4,
    image: "/stories/cloud/scene-5.png",
    layout: "center",
    interactionId: "cloud-reveal",
    narration: [
      "Standing above the clouds, Maria looked across a world bigger than anything she had imagined.",
      "She remembered how frightened she had been when she first climbed the cloud staircase.",
      "But every small step had led her somewhere wonderful.",
      "Maria discovered that she loved exploring new places, studying the wind, and helping others find their way through the sky.",
      "She imagined a future filled with floating islands, cloud-making inventions, and countless adventures.",
      "And that was how Maria discovered another possible future.",
      "The little red panda who was once afraid of heights had finally found her wings.",
    ].join("\n\n"),
  },
];

export const CLOUD_PROFILE: CharacterProfile = {
  species: "Baby red panda",
  profession: "Sky Explorer, Cloud Maker and Floating-Island Adventurer",
  personality: ["Adventurous", "curious", "brave", "playful", "imaginative"],
  specialTalent: "Helping travelers navigate the sky",
  home: "The Floating Sky Islands",
  theme: "Courage and exploration",
  about: [
    "Hi! I’m Cloud Maria!",
    "I explore magical floating islands, discover hidden places in the sky, and make fluffy clouds to help little travelers.",
    "I used to be afraid of heights, but now every adventure reminds me that being brave means trying something new!",
  ],
  whatIDo:
    "I explore floating worlds, study the movement of clouds and winds, create little sky pathways, and help lost travelers find their way home.",
  strengths: ["Courage", "Curiosity", "Observation", "Navigation", "Creativity", "Problem-solving"],
  journey:
    "I discovered my passion when I helped a lost little cloud return to its floating village. Along the way, I learned how to follow the wind and create cloud bridges.",
  motto: "Every adventure begins with one little step.",
};

/**
 * Cloud Maria's three creations. Proposed until each playable module exists;
 * a project only becomes `live` once its interaction genuinely works.
 */
export const CLOUD_PROJECTS: PortfolioProject[] = [
  {
    id: "cloud-maker",
    title: "Cloud Maker",
    description:
      "A magical cloud-making machine Maria designed to help travelers create their own little floating worlds.",
    image: "/projects/cloud/cloud-maker.png",
    interactionId: "cloud-maker",
    status: "draft",
    implementation: "proposed",
  },
  {
    id: "sky-route-planner",
    title: "Sky Route Planner",
    description:
      "Cloud Maria’s magical map of floating islands, safe cloud bridges, and secret routes through the sky.",
    image: "/projects/cloud/sky-route-planner.png",
    interactionId: "sky-route-planner",
    status: "draft",
    implementation: "proposed",
  },
  {
    id: "cloud-postcards",
    title: "Cloud Postcards",
    description:
      "A magical postcard collection filled with the incredible places Cloud Maria discovered during her sky adventures.",
    image: "/projects/cloud/cloud-postcards.png",
    interactionId: "cloud-postcards",
    status: "draft",
    implementation: "proposed",
  },
];
