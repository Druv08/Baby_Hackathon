import type { CharacterProfile, StoryIntro } from "@/types/future";
import type { PortfolioProject } from "@/types/project";
import type { StoryScene } from "@/types/story";

/**
 * Forest Maria's origin story — "The Forest That Changed Its Paths".
 * Scenes 1–4 feature Normal Maria (character 1); scene 5 reveals
 * Forest Maria (character 7). Narration paragraphs are separated by a blank
 * line; lines that open with a quote mark are spoken.
 *
 * Scene 5's "Forest Maria — The Pathfinder." and her tagline are rendered
 * from the character record, so only the narration around them is kept here.
 *
 * Scene 5's illustration has not been supplied yet, so the reveal shows
 * the locked Forest Maria design (`/characters/7.png`). When it arrives,
 * copy it to `/stories/forest/scene-5.png`, register it in `src/data/assets.ts`
 * and update the scene's image field. All three project illustrations exist.
 */

export const FOREST_STORY_INTRO: StoryIntro = {
  title: "Forest Path",
  subtitle: "How Maria became the Pathfinder",
  blurb:
    "One little red panda. A forest filled with changing paths. And a lost little rabbit waiting for a friend. Follow Maria as she learns that finding the right way isn’t just about knowing the destination — it’s about caring for everyone traveling beside you.",
};

export const FOREST_SCENES: StoryScene[] = [
  {
    id: 1,
    title: "The Forest of Missing Footprints",
    characterId: 1,
    image: "/stories/forest/scene-1.png",
    layout: "text-right",
    interactionId: "turning-signpost",
    narration: [
      "One sunny morning, Maria wandered along a little woodland trail, following the sounds of singing birds.",
      "The forest was beautiful, filled with glowing flowers, giant mushrooms and trees taller than anything she had ever seen.",
      "But as Maria walked deeper, something strange happened.",
      "The pathway behind her slowly disappeared beneath the leaves.",
      "“Huh? Wasn’t there a path here a moment ago?”",
      "Suddenly, she heard a tiny voice.",
      "“Hello? Can somebody help me?”",
      "Maria looked behind a tree and discovered a little rabbit sitting beside a fallen wooden signpost.",
      "The rabbit had been trying to find its way home, but every path seemed to lead somewhere different.",
      "Maria gently held out her paw.",
      "“Don’t worry! I’ll help you find your way home.”",
      "Neither of them knew that this little promise would become the beginning of Maria’s greatest adventure.",
    ].join("\n\n"),
  },
  {
    id: 2,
    title: "The Map That Couldn’t Stay Still",
    characterId: 1,
    image: "/stories/forest/scene-2.png",
    layout: "text-left",
    interactionId: "shifting-map",
    narration: [
      "Maria and the little rabbit searched for someone who knew the forest.",
      "Eventually, they discovered an ancient wooden wayfinder hidden beneath the roots of a giant tree.",
      "Inside was a beautiful map covered in tiny glowing paths.",
      "But the old machine had stopped working.",
      "Maria noticed a small wooden leaf-shaped piece lying beside it.",
      "Carefully, she placed the piece back into its matching slot.",
      "Click!",
      "The wayfinder began glowing, and a magical map appeared.",
      "“We found it! Now we can go home!”",
      "Maria studied the map and chose the shortest path toward the rabbit’s village.",
      "But as they walked, the paths on the map began moving.",
      "Bridges disappeared, new trails appeared, and their destination seemed farther away than before.",
      "“Wait! That’s not where the path was!”",
      "Maria realized that finding a map was only the beginning.",
      "She still needed to understand how the forest worked.",
    ].join("\n\n"),
  },
  {
    id: 3,
    title: "When the Shortest Path Was Wrong",
    characterId: 1,
    image: "/stories/forest/scene-3.png",
    layout: "text-right",
    interactionId: "route-choice",
    narration: [
      "Maria tried following the shortest route on the map.",
      "At first, everything seemed easy.",
      "But soon they reached a stream with a narrow fallen-log bridge.",
      "Maria could cross it easily, but the little rabbit was too frightened.",
      "“Come on! It’s only a little bridge!” Maria said.",
      "The rabbit shook its head.",
      "Maria stopped.",
      "She had been so busy finding the fastest path that she had forgotten about the friend walking beside her.",
      "“I’m sorry. I didn’t think about how scary this might be for you.”",
      "They sat beside the stream and looked at the forest together.",
      "Maria noticed something important.",
      "The birds traveled through the treetops, the squirrels used branches, and the rabbits preferred quiet paths close to the ground.",
      "Maybe there wasn’t one perfect path for everyone.",
      "“Wait... what if the best path depends on who’s traveling?”",
      "For the first time, Maria began looking at the forest through someone else’s eyes.",
    ].join("\n\n"),
  },
  {
    id: 4,
    title: "A Path for Everyone",
    characterId: 1,
    image: "/stories/forest/scene-4.png",
    layout: "text-left",
    interactionId: "safe-route-map",
    narration: [
      "Maria returned to the magical map and began adding everything she had learned.",
      "She marked the quiet trails, the shallow streams, the safe bridges and the places where different animals liked to travel.",
      "Instead of drawing one route, she created many.",
      "A gentle path for little rabbits.",
      "A treetop route for squirrels.",
      "A flower-lined trail for butterflies.",
      "As Maria connected the pathways, the map began glowing brighter.",
      "The forest itself seemed to understand!",
      "The moving paths settled into beautiful routes that each creature could follow.",
      "Maria guided the rabbit along a peaceful trail beside the river.",
      "Soon, they reached a little cottage beneath an enormous oak tree.",
      "“We’re home!” the rabbit squeaked.",
      "Other forest creatures gathered around Maria, asking how they could find their own paths.",
      "Maria smiled.",
      "“Don’t worry. We’ll find a way that’s right for you too!”",
    ].join("\n\n"),
  },
  {
    id: 5,
    title: "Becoming the Pathfinder",
    characterId: 7,
    // Scene 5 artwork not supplied yet: show the locked Forest Maria design.
    image: "/characters/7.png",
    layout: "center",
    interactionId: "forest-reveal",
    narration: [
      "As the sun slowly set, Maria looked across the forest she had helped bring together.",
      "The little rabbit was home. The squirrels had found their treetop paths, and the birds were singing above the glowing trails.",
      "Maria realized she had discovered something wonderful.",
      "She didn’t just love exploring new places.",
      "She loved helping others discover where they belonged.",
      "Every creature had a different journey, and every journey deserved a safe path.",
      "Maria imagined a future where she could explore endless forests, create magical maps and guide anyone who needed a friend.",
      "She wanted to become someone others could trust when the road ahead felt uncertain.",
      "And that was how Maria discovered another possible future.",
      "The little red panda who once wandered without direction had become a guide who helped others find their own.",
    ].join("\n\n"),
  },
];

export const FOREST_PROFILE: CharacterProfile = {
  species: "Baby red panda",
  profession: "Pathfinder, Forest Guide and Magical Cartographer",
  personality: ["Kind", "observant", "adventurous", "responsible", "resourceful"],
  specialTalent: "Finding safe routes and helping lost creatures",
  home: "The Whispering Forest",
  theme: "Leadership, guidance and empathy",
  about: [
    "Hi! I’m Forest Maria!",
    "I love exploring magical forests, discovering secret pathways, and helping little creatures find their way home.",
    "Every trail leads somewhere special, and I believe nobody should have to feel lost when there’s a friend nearby!",
  ],
  whatIDo:
    "I explore enchanted forests, create magical maps, discover safe pathways, and help woodland creatures travel through places they’ve never visited before.",
  strengths: ["Leadership", "Empathy", "Navigation", "Observation", "Problem-solving", "Teamwork"],
  journey:
    "I discovered my passion when I helped a lost little rabbit find its way home through a forest where the paths kept changing. I learned that being a good guide means understanding the needs of everyone traveling with you.",
  motto: "Every journey deserves a little kindness.",
};

/** Forest Maria's three creations — each a small playable experience. */
export const FOREST_PROJECTS: PortfolioProject[] = [
  {
    id: "dream-delivery-map",
    title: "Dream Delivery Map",
    description:
      "A magical map Forest Maria created to help woodland creatures deliver little messages and find safe pathways through the Whispering Forest.",
    image: "/projects/forest/dream-delivery-map.png",
    interactionId: "dream-delivery-map",
    status: "ready",
    implementation: "live",
  },
  {
    id: "forest-friends-field-guide",
    title: "Forest Friends Field Guide",
    description:
      "An enchanted journal containing the forest creatures Maria met, the places they live, and the paths they love exploring.",
    image: "/projects/forest/forest-friends-field-guide.png",
    interactionId: "forest-friends-field-guide",
    status: "ready",
    implementation: "live",
  },
  {
    id: "whispering-signpost-workshop",
    title: "Whispering Signpost Workshop",
    description:
      "Create your own magical forest signpost using Forest Maria’s collection of wooden signs, flowers, leaves and woodland decorations.",
    image: "/projects/forest/whispering-signpost-workshop.png",
    interactionId: "whispering-signpost-workshop",
    status: "ready",
    implementation: "live",
  },
];
