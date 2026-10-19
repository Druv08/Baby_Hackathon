import type { CharacterProfile, StoryIntro } from "@/types/future";
import type { PortfolioProject } from "@/types/project";
import type { StoryScene } from "@/types/story";

/**
 * Luna Maria's origin story — "The Memories That Forgot to Shine".
 * Scenes 1–4 feature Normal Maria (character 1); scene 5 reveals
 * Luna Maria (character 9). Narration paragraphs are separated by a blank
 * line; lines that open with a quote mark are spoken.
 *
 * Scene 5's "Luna Maria — The Memory Keeper." and her tagline are rendered
 * from the character record, so only the narration around them is kept here.
 *
 * Scene 5's illustration has not been supplied yet. Until it is, scene 5
 * shows Luna's locked character art. Note the design swap in
 * `src/data/characters.ts`: Luna's witch-hat design is stored as
 * `/characters/3.png` (and Star's hooded design as `9.png`). When the
 * illustration arrives, copy it to `/stories/luna/scene-5.png`, register it
 * in `src/data/assets.ts` and point scene 5's `image` at it.
 */

export const LUNA_STORY_INTRO: StoryIntro = {
  title: "Luna Path",
  subtitle: "How Maria became the Memory Keeper",
  blurb:
    "One little red panda. A village of forgotten memories. And hundreds of fading lanterns waiting to shine again. Follow Maria as she discovers that the moments we remember are part of what makes us who we are.",
};

export const LUNA_SCENES: StoryScene[] = [
  {
    id: 1,
    title: "The Village of Fading Lanterns",
    characterId: 1,
    image: "/stories/luna/scene-1.png",
    layout: "text-right",
    interactionId: "fading-lantern",
    narration: [
      "One beautiful evening, Maria wandered into a peaceful village beside a moonlit lake.",
      "Thousands of little lanterns floated above the water, surrounded by glowing flowers and sparkling stars.",
      "But something was wrong.",
      "Some lanterns were glowing brightly, while others had slowly lost their light.",
      "Maria noticed an elderly owl sitting beside the lake, holding an old picture.",
      "“Why are those lanterns so dark?” Maria asked.",
      "The owl looked at the faded picture and sighed.",
      "“Each lantern holds a precious memory. But after a terrible storm scattered our memory pages, some of our favorite stories began to fade.”",
      "Maria looked across the quiet village.",
      "The lanterns were beautiful, but every dark lantern represented a moment someone was afraid of forgetting.",
      "“Can’t we make them shine again?”",
      "The owl smiled sadly.",
      "“I wish I knew how, little one.”",
      "Maria looked at the nearest fading lantern.",
      "“Then maybe I can find a way!”",
    ].join("\n\n"),
  },
  {
    id: 2,
    title: "The Library of Forgotten Moments",
    characterId: 1,
    image: "/stories/luna/scene-2.png",
    layout: "text-left",
    interactionId: "keepsake-clues",
    narration: [
      "Maria followed the owl into an ancient library hidden beneath a great flowering tree.",
      "Inside were thousands of books, photographs, little keepsakes and glowing glass jars.",
      "Each shelf contained memories collected from the village.",
      "Maria discovered a pressed flower, a little silver bell and a tiny wooden boat.",
      "“These are just ordinary things!” she said.",
      "The owl shook his head.",
      "“Not always. A little flower might remind someone of their first friend. A tiny boat might hold the memory of a wonderful adventure.”",
      "Maria carefully opened an old journal.",
      "Its pages contained stories about joyful celebrations, friendships and little moments that had once made someone happy.",
      "She began to understand.",
      "Memories weren’t only pictures of what happened.",
      "They were stories filled with feelings.",
      "“Maybe these little things can help everyone remember!”",
    ].join("\n\n"),
  },
  {
    id: 3,
    title: "The Memory That Wouldn’t Return",
    characterId: 1,
    image: "/stories/luna/scene-3.png",
    layout: "text-right",
    interactionId: "story-behind",
    narration: [
      "Excited by her discovery, Maria hurried back to the lake.",
      "She placed the pressed flower beside one of the fading lanterns.",
      "Nothing happened.",
      "She tried the silver bell.",
      "Still nothing.",
      "“Why won’t you shine?”",
      "Maria looked through the old journal again and again.",
      "She knew which objects belonged to the villagers, but the lanterns remained dark.",
      "Feeling disappointed, she sat beside the elderly owl.",
      "“I found their things, but I still can’t bring their memories back.”",
      "The owl gently opened his faded photograph.",
      "“This picture is from the day I taught my little owlet how to fly.”",
      "His voice softened.",
      "“I remember how afraid she was, and how happy I felt when she finally spread her wings.”",
      "As the owl spoke, the lantern beside him began glowing.",
      "Maria’s eyes widened.",
      "“Wait! It’s not just the picture!”",
      "“It’s the story behind it!”",
      "She realized that memories became meaningful because of the feelings and people connected to them.",
    ].join("\n\n"),
  },
  {
    id: 4,
    title: "A Thousand Memories, One Beautiful Night",
    characterId: 1,
    image: "/stories/luna/scene-4.png",
    layout: "text-left",
    interactionId: "memory-match",
    narration: [
      "Maria returned to the village with a wonderful new idea.",
      "Instead of collecting only objects, she began asking everyone about their happiest memories.",
      "A little rabbit remembered the day it met its best friend.",
      "A squirrel remembered the first tree it had climbed.",
      "The elderly owl remembered watching his little owlet learn to fly.",
      "Maria carefully wrote down each story.",
      "She placed the memories inside little magical lanterns, together with the keepsakes that belonged to them.",
      "One by one, the lanterns began glowing again.",
      "Golden lights floated above the lake, carrying precious moments into the night sky.",
      "Soon, the entire village gathered beside the water, sharing stories and remembering wonderful times together.",
      "Maria watched the lanterns dance across the moonlit lake.",
      "“Every little moment has its own story.”",
      "“And every story deserves to be remembered.”",
      "She realized that preserving a memory wasn’t about keeping the past from changing.",
      "It was about remembering why that moment mattered.",
    ].join("\n\n"),
  },
  {
    id: 5,
    title: "Becoming the Memory Keeper",
    characterId: 9,
    // Scene 5 artwork not supplied yet: show Luna's locked design (stored as 3.png).
    image: "/characters/3.png",
    layout: "center",
    interactionId: "luna-reveal",
    narration: [
      "As the moon rose high above the village, Maria stood beside the lake and watched hundreds of memory lanterns floating across the water.",
      "She thought about everything she had discovered.",
      "Every memory was different.",
      "Some were happy. Some were a little sad. Others were so small that people almost forgot them.",
      "But together, those memories told the story of who someone had become.",
      "Maria remembered her own little adventures, the friends she had met and all the things she had learned along the way.",
      "She realized that every moment, every feeling and every experience had helped her grow.",
      "Maria imagined a future where she could collect beautiful stories, preserve precious memories and help others remember the moments that made them special.",
      "And that was how Maria discovered another possible future.",
      "The little red panda who once wondered what she might become had discovered how important it was to remember where she came from.",
    ].join("\n\n"),
  },
];

export const LUNA_PROFILE: CharacterProfile = {
  species: "Baby red panda",
  profession: "Memory Keeper, Story Collector and Guardian of Precious Moments",
  personality: ["Gentle", "thoughtful", "caring", "nostalgic", "imaginative"],
  specialTalent: "Preserving precious memories within magical lanterns",
  home: "The Moonlit Village of Memories",
  theme: "Memories and identity",
  about: [
    "Hi! I’m Luna Maria!",
    "I love collecting beautiful memories, listening to wonderful stories and keeping little moments safe so they can always be remembered.",
    "Every memory is special, because every little moment helps make us who we are!",
  ],
  whatIDo:
    "I collect stories, preserve precious moments in magical lanterns, create memory books and help my friends remember the wonderful things they’ve experienced.",
  strengths: ["Empathy", "Listening", "Creativity", "Reflection", "Storytelling", "Thoughtfulness"],
  journey:
    "I discovered my passion when I visited a moonlit village where the memory lanterns were slowly fading. I learned that what makes memories special isn’t simply what happened, but the feelings and people connected to them.",
  motto: "Little moments become the stories we carry forever.",
};

/**
 * Luna Maria's three creations — each a small playable experience. The
 * Moonlit Memory Book is a themed view of the site's one shared, moderated
 * Memory Book (same API and table), not a separate store.
 */
export const LUNA_PROJECTS: PortfolioProject[] = [
  {
    id: "moonlit-memory-book",
    title: "Moonlit Memory Book",
    description:
      "A magical memory book where visitors can share their favorite moments from Maria’s world and discover little messages left by others.",
    image: "/projects/luna/moonlit-memory-book.png",
    interactionId: "moonlit-memory-book",
    status: "ready",
    implementation: "live",
  },
  {
    id: "memory-lantern-studio",
    title: "Memory Lantern Studio",
    description: "Design a beautiful magical lantern to hold a little memory of your own.",
    image: "/projects/luna/memory-lantern-studio.png",
    interactionId: "memory-lantern-studio",
    status: "ready",
    implementation: "live",
  },
  {
    id: "keepsake-cabinet",
    title: "The Keepsake Cabinet",
    description:
      "Explore Luna Maria’s magical cabinet of treasured objects and discover the wonderful memories hidden inside them.",
    image: "/projects/luna/keepsake-cabinet.png",
    interactionId: "keepsake-cabinet",
    status: "ready",
    implementation: "live",
  },
];
