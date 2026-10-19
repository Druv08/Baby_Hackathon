import type { CharacterProfile, StoryIntro } from "@/types/future";
import type { PortfolioProject } from "@/types/project";
import type { StoryScene } from "@/types/story";

/**
 * Inventor Maria's origin story — "The Little Spark That Couldn't Shine".
 * Scenes 1–4 feature Normal Maria (character 1); scene 5 reveals
 * Inventor Maria (character 6). Narration paragraphs are separated by a
 * blank line; lines that open with a quote mark are Maria speaking.
 *
 * Scene 5's "Inventor Maria — The Star Mechanic." and her tagline are
 * rendered from the character record, so only the narration around them is
 * kept here.
 */

export const INVENTOR_STORY_INTRO: StoryIntro = {
  title: "Inventor Path",
  subtitle: "How Maria became the Star Mechanic",
  blurb:
    "One little red panda. A workshop filled with broken machines. And a tiny Dream Spark waiting to shine again. Follow Maria as she learns that every mistake is an opportunity to discover something new.",
};

export const INVENTOR_SCENES: StoryScene[] = [
  {
    id: 1,
    title: "The Night the Lanterns Went Dark",
    characterId: 1,
    image: "/stories/inventor/scene-1.png",
    layout: "text-right",
    interactionId: "flicker-lantern",
    narration: [
      "One evening, Maria wandered into a little village filled with beautiful star-shaped lanterns.",
      "Usually, the lanterns lit up every pathway, but tonight the village was strangely dark.",
      "One by one, the remaining lights began to flicker.",
      "“Oh no! Where did all the stars go?”",
      "Maria noticed a tiny glowing spark drifting toward an old workshop at the edge of the village.",
      "Curious, she followed it through the quiet streets.",
      "Through the workshop window, she could see a strange golden machine surrounded by gears, tools and unfinished inventions.",
      "A faint light was blinking deep inside it.",
      "Maria pressed her little paws against the window.",
      "“Is that where the missing light has gone?”",
      "She carefully opened the workshop door.",
    ].join("\n\n"),
  },
  {
    id: 2,
    title: "The Spark Inside the Machine",
    characterId: 1,
    image: "/stories/inventor/scene-2.png",
    layout: "text-left",
    interactionId: "machine-diagram",
    narration: [
      "Inside the workshop, Maria discovered an enormous machine made of spinning wheels, brass pipes and glowing glass.",
      "At its center was a tiny Dream Spark trapped between two broken gears.",
      "The machine had once collected magical starlight and carried it to every lantern in the village.",
      "But now its gears could barely move.",
      "“Don’t worry, little star! I’ll get you out!”",
      "Maria gently wished for the machine to start working.",
      "Nothing happened.",
      "She tried waving her paws like a magician.",
      "Still nothing.",
      "Then she noticed an old instruction book lying beneath the workbench.",
      "Its pages were filled with drawings of gears, tools and little machines.",
      "Maria’s eyes widened.",
      "“Maybe I need to learn how you work first!”",
      "For the first time, she began studying how things were built.",
    ].join("\n\n"),
  },
  {
    id: 3,
    title: "A Hundred Tiny Tries",
    characterId: 1,
    image: "/stories/inventor/scene-3.png",
    layout: "text-right",
    interactionId: "gear-challenge",
    narration: [
      "Maria gathered some tools and began repairing the machine.",
      "First, she tried turning a loose gear.",
      "Clunk!",
      "It slipped out of place.",
      "Then she tightened a tiny spring.",
      "Boing!",
      "The spring bounced across the workshop.",
      "Maria tried again and again, but the machine still wouldn’t work.",
      "“Oh crumbs! Why is everything going wrong?”",
      "She sat beside her scattered tools, feeling disappointed.",
      "For a moment, she wondered whether she should give up.",
      "Then she looked at her sketches.",
      "Every failed attempt had shown her something new.",
      "One gear was too small. Another was pointing the wrong way. A tiny wheel was missing entirely.",
      "Maria picked up her pencil.",
      "“Wait... I think I know what’s wrong!”",
      "She didn’t need to try harder.",
      "She needed to try differently.",
    ].join("\n\n"),
  },
  {
    id: 4,
    title: "The Machine Wakes Up",
    characterId: 1,
    image: "/stories/inventor/scene-4.png",
    layout: "text-left",
    interactionId: "machine-activation",
    narration: [
      "With her new plan ready, Maria returned to the workbench.",
      "She carefully arranged the gears, adjusted the spring and built a little replacement wheel from spare parts.",
      "Then she gave the machine one gentle turn.",
      "Click.",
      "Click.",
      "Whirrrrr!",
      "The gears began moving together!",
      "The trapped Dream Spark floated free and filled the workshop with golden light.",
      "Outside, the village lanterns began glowing again.",
      "One lantern lit another, until the entire village sparkled like a sky full of stars.",
      "Maria jumped with excitement.",
      "“I did it! I really built something that works!”",
      "She realized that the best part wasn’t just fixing the machine.",
      "It was imagining a solution, trying new ideas and creating something with her own paws.",
    ].join("\n\n"),
  },
  {
    id: 5,
    title: "Becoming the Star Mechanic",
    characterId: 6,
    image: "/stories/inventor/scene-5.png",
    layout: "center",
    interactionId: "inventor-reveal",
    narration: [
      "As Maria watched the village sparkle again, she looked around the workshop with a big smile.",
      "There were still so many things waiting to be created.",
      "Little lanterns, helpful machines, wonderful inventions and ideas nobody had thought of yet.",
      "She remembered how many times her first invention had failed.",
      "But every mistake had helped her understand something new.",
      "Maria realized that she loved solving problems, experimenting with ideas and building things that could make others happy.",
      "She imagined a future full of magical workshops, tiny tools and inventions that could turn impossible dreams into reality.",
      "And that was how Maria discovered another possible future.",
      "The little red panda who once knew nothing about machines had become a creator of wonderful possibilities.",
    ].join("\n\n"),
  },
];

export const INVENTOR_PROFILE: CharacterProfile = {
  species: "Baby red panda",
  profession: "Star Mechanic, Magical Inventor and Dream Engineer",
  personality: ["Curious", "inventive", "determined", "playful", "resourceful"],
  specialTalent: "Repairing magical machines and creating helpful inventions",
  home: "The Forgotten Star Workshop",
  theme: "Creativity and perseverance",
  about: [
    "Hi! I’m Inventor Maria!",
    "I love building magical machines, fixing broken things and turning little ideas into wonderful creations.",
    "Sometimes my inventions don’t work the first time, but that’s okay! Every mistake helps me discover something new.",
  ],
  whatIDo:
    "I design magical inventions, repair star-powered machines, create glowing lanterns and build helpful little gadgets for my friends.",
  strengths: ["Creativity", "Problem-solving", "Persistence", "Observation", "Experimentation", "Engineering"],
  journey:
    "I discovered my passion when I repaired a broken machine that powered an entire village’s lanterns. I learned that every great invention begins with curiosity, patience and a willingness to try again.",
  motto: "Every mistake teaches me something new.",
};

/**
 * Inventor Maria's three creations. Proposed until each playable module
 * exists; a project only becomes `live` once its interaction genuinely works.
 */
export const INVENTOR_PROJECTS: PortfolioProject[] = [
  {
    id: "star-workshop",
    title: "Star Workshop",
    description:
      "A magical workshop where visitors can help Inventor Maria repair broken machines, arrange gears and power wonderful star-filled inventions.",
    image: "/projects/inventor/star-workshop.png",
    interactionId: "star-workshop",
    status: "draft",
    implementation: "proposed",
  },
  {
    id: "dream-lantern-lab",
    title: "Dream Lantern Lab",
    description:
      "Design your own magical star lantern using Inventor Maria’s collection of glowing shapes, colors and enchanting lights.",
    image: "/projects/inventor/dream-lantern-lab.png",
    interactionId: "dream-lantern-lab",
    status: "draft",
    implementation: "proposed",
  },
  {
    id: "little-helper-machines",
    title: "Little Helper Machines",
    description:
      "Build adorable little clockwork helpers using Inventor Maria’s magical mechanical parts, then watch them perform helpful tasks.",
    image: "/projects/inventor/little-helper-machines.png",
    interactionId: "little-helper-machines",
    status: "draft",
    implementation: "proposed",
  },
];
