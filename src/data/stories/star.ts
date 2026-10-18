import type { CharacterProfile, StoryIntro } from "@/types/future";
import type { PortfolioProject } from "@/types/project";
import type { StoryScene } from "@/types/story";

/**
 * Star Maria's origin story — "The Sky of Forgotten Wishes".
 * Scenes 1–4 feature Normal Maria (character 1); scene 5 reveals
 * Star Maria (character 3). Narration paragraphs are separated by a blank
 * line; lines that open with a quote mark are Maria speaking.
 *
 * Scene 5's closing lines ("Star Maria — The Dream Mapper." and
 * “I can turn questions into discoveries.”) are rendered from the character
 * record, so only the final sentence is kept here.
 */

export const STAR_STORY_INTRO: StoryIntro = {
  title: "Star Path",
  subtitle: "How Maria became the Dream Mapper",
  blurb:
    "One little red panda. A sky full of questions. And a forgotten observatory waiting to be discovered. Join Maria as she follows a mysterious star and learns that every forgotten wish has a story worth finding.",
};

export const STAR_SCENES: StoryScene[] = [
  {
    id: 1,
    title: "The Night of a Thousand Questions",
    characterId: 1,
    image: "/stories/star/scene-1.png",
    layout: "text-right",
    interactionId: "lonely-star",
    narration: [
      "One quiet evening, Maria sat beneath a sky filled with twinkling stars.",
      "She loved watching them, but tonight something felt different.",
      "Some stars shone brightly together, while others seemed scattered and lonely.",
      "Maria tilted her head.",
      "“Why are some stars all alone? Don’t they have friends?”",
      "Suddenly, one tiny star flickered and drifted toward an old tower standing on a distant hill.",
      "Maria’s eyes widened.",
      "“Are you trying to show me something?”",
      "With her little pink scarf wrapped tightly around her, Maria decided to follow the mysterious light.",
      "Sometimes, the biggest adventures begin with a tiny question.",
    ].join("\n\n"),
  },
  {
    id: 2,
    title: "The Forgotten Observatory",
    characterId: 1,
    image: "/stories/star/scene-2.png",
    layout: "text-left",
    interactionId: "telescope-peek",
    narration: [
      "Following the little star, Maria reached an ancient observatory.",
      "Inside were dusty telescopes, scattered maps, and books filled with drawings of beautiful constellations.",
      "But something was wrong.",
      "The patterns drawn in the books no longer matched the sky.",
      "Maria discovered an old journal explaining that every constellation once represented someone’s dream or wish.",
      "Over time, many of those wishes had been forgotten, leaving their stars scattered.",
      "“So these stars are actually little dreams?” Maria whispered.",
      "She picked up a star map and looked through the telescope.",
      "For the first time, Maria wanted to understand the sky instead of simply admiring it.",
    ].join("\n\n"),
  },
  {
    id: 3,
    title: "The Stars That Wouldn’t Connect",
    characterId: 1,
    image: "/stories/star/scene-3.png",
    layout: "text-right",
    interactionId: "unfinished-constellation",
    narration: [
      "Maria spent hours studying the sky.",
      "She drew little dots on paper, compared old maps, and tried connecting the scattered stars.",
      "But every pattern she made disappeared.",
      "Again and again, she tried.",
      "“Why isn’t it working? I followed the map!”",
      "Feeling discouraged, Maria sat beside the observatory window.",
      "Then she noticed a tiny handwritten wish in the journal.",
      "“I wish I could find my way home.”",
      "Three nearby stars began to glow.",
      "Maria suddenly understood.",
      "“Maybe I shouldn’t just connect the stars. Maybe I need to understand their stories!”",
    ].join("\n\n"),
  },
  {
    id: 4,
    title: "Connecting the Forgotten Dreams",
    characterId: 1,
    image: "/stories/star/scene-4.png",
    layout: "text-left",
    interactionId: "connect-dreams",
    narration: [
      "Maria returned to the journal and began reading every forgotten wish.",
      "Some wished for friendship. Some dreamed of adventures. Others simply wanted someone to remember them.",
      "Carefully, Maria grouped wishes that belonged together and traced paths between their stars.",
      "This time, the lights stayed connected.",
      "One by one, beautiful constellations appeared in the night sky.",
      "The lonely stars were no longer alone.",
      "Maria laughed with delight.",
      "“Every little dream has its own place in the sky!”",
      "The observatory filled with golden light, and a magical star chart appeared before her.",
      "She had created her very first Dream Map.",
    ].join("\n\n"),
  },
  {
    id: 5,
    title: "Becoming the Dream Mapper",
    characterId: 3,
    image: "/stories/star/scene-5.png",
    layout: "center",
    interactionId: "star-reveal",
    narration: [
      "As the last constellation lit up, Maria looked across the glowing sky.",
      "She realized that she loved asking questions, exploring mysteries, and discovering stories hidden among the stars.",
      "Every new question made her curious about something else.",
      "And every discovery made the universe feel a little bigger.",
      "Maria imagined a future spent mapping forgotten wishes, discovering constellations, and helping others find their dreams.",
      "She had finally found another path she could choose.",
      "The little red panda who once wondered why stars were lonely had become someone who could bring them together.",
    ].join("\n\n"),
  },
];

export const STAR_PROFILE: CharacterProfile = {
  species: "Baby red panda",
  personality: ["Curious", "imaginative", "observant", "gentle", "adventurous"],
  specialTalent: "Mapping forgotten wishes into constellations",
  home: "The Forgotten Observatory",
  theme: "Curiosity and discovery",
  about: [
    "Hi! I’m Star Maria!",
    "I explore the night sky, discover forgotten constellations, and turn little dreams into glowing star maps.",
    "Every star has a story, and I love finding out what makes it special!",
  ],
  whatIDo:
    "I study the sky, collect forgotten wishes, create constellation maps, and help others discover the wonders hidden above them.",
  strengths: ["Curiosity", "Observation", "Imagination", "Problem-solving", "Mapmaking", "Patience"],
  journey:
    "I discovered my passion when I visited an abandoned observatory and learned how to reconnect scattered stars by understanding the wishes they represented.",
  motto: "Every question is the beginning of a new discovery.",
};

/**
 * Star Maria's three creations. Metadata only for now: they stay `proposed`
 * until their interactive modules exist.
 */
export const STAR_PROJECTS: PortfolioProject[] = [
  {
    id: "constellation-builder",
    title: "Constellation Builder",
    description:
      "A magical stargazing board where visitors can connect glowing stars, create constellations, and discover the stories hidden in the night sky.",
    image: "/projects/star/constellation-builder.png",
    status: "draft",
    implementation: "proposed",
  },
  {
    id: "dream-atlas",
    title: "The Dream Atlas",
    description:
      "An enchanted atlas containing the constellations Maria discovered and the forgotten wishes hidden among them.",
    image: "/projects/star/dream-atlas.png",
    status: "draft",
    implementation: "proposed",
  },
  {
    id: "stargazers-telescope",
    title: "Stargazer’s Telescope",
    description:
      "A magical telescope Maria created to help little explorers discover stars, moons, and hidden wonders across the night sky.",
    image: "/projects/star/stargazers-telescope.png",
    status: "draft",
    implementation: "proposed",
  },
];
