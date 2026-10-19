import { CHARACTERS } from "@/data/characters";
import type { CharacterSlug } from "@/types/character";

export type Intent = "greeting" | "identity" | "story" | "interests" | "projects" | "help" | "lesson" | "secret" | "farewell" | "fallback";
interface Voice { interest: string; lesson: string; help: string; project: string; anchor: string; secret: string }
const VOICES: Record<CharacterSlug, Voice> = {
  normal: { interest: "I love flowers, stars, clouds, the ocean, making things, woodland paths, music and memories. I’m still discovering who I might become!", lesson: "I don’t have to choose every answer today. Each little adventure helps me understand myself.", help: "Let’s explore one future at a time. Which of my eight dreams makes you curious?", project: "Eight possible futures", anchor: "/#futures", secret: "Each future holds a little secret. Find all eight and we can celebrate the heart that connects them." },
  blossom: { interest: "I love tending little flowers. A patient paw and a little kindness can help a garden bloom.", lesson: "Growing takes care and patience. Even something small deserves a chance to blossom.", help: "Start with one flower. Notice what it needs, then give it time. We can try my Dream Garden together.", project: "Dream Garden", anchor: "dream-garden", secret: "Look closely among the blossoms. A tiny golden seed is waiting for a curious friend." },
  star: { interest: "I love asking questions about the stars and joining bright dots into constellations. The sky is full of discoveries!", lesson: "A question can become a map to something wonderful. I don’t need every answer to begin looking.", help: "Choose a few stars and imagine how they connect. My Constellation Builder is a lovely place to start.", project: "Constellation Builder", anchor: "constellation-builder", secret: "A hidden constellation belongs to this path. Keep your eyes on the little lights." },
  cloud: { interest: "I love exploring new skies! A little courage helps me fly toward places I haven’t seen before.", lesson: "Being brave doesn’t mean knowing the whole journey. Sometimes it means taking one small step into the unknown.", help: "Let’s choose a gentle route through the sky. We can plan it before we take off!", project: "Sky Route Planner", anchor: "sky-route-planner", secret: "There’s a little rainbow hiding in my cloud adventure. A curious tap might help you find it." },
  aqua: { interest: "I love the ocean and the creatures who call it home. I want every little swimmer to feel safe.", lesson: "Being strong can mean protecting someone else. Small acts of care can make a whole ocean kinder.", help: "Let’s help a turtle find a safe passage. Watch what is ahead and choose a caring path.", project: "Turtle’s Safe Passage", anchor: "turtles-safe-passage", secret: "A little pearl is tucked into this ocean journey. Look for a gentle glow." },
  inventor: { interest: "I love building things, testing ideas and trying again. A mistake can be the beginning of my next invention!", lesson: "If something doesn’t exist, I can try to build it. Every experiment teaches me something.", help: "Let’s take the problem apart into little pieces. My Star Workshop has room for your next experiment.", project: "Star Workshop", anchor: "star-workshop", secret: "A tiny golden cog is hiding in my workshop adventure. Curious inventors notice little details." },
  forest: { interest: "I love mapping woodland paths and helping my friends reach home safely. Every traveler needs a route that suits them.", lesson: "The shortest path isn’t always the best one. A good guide makes sure everyone can travel safely together!", help: "Choose a messenger, then a destination. On my Dream Delivery Map, rabbits use ground paths while birds can fly.", project: "Dream Delivery Map", anchor: "dream-delivery-map", secret: "There’s a golden acorn tucked away in my forest story. Take a careful look around." },
  melody: { interest: "I love creating little lullabies! Sometimes the smallest melody can make someone’s day a little brighter.", lesson: "Sometimes a feeling can do what tools cannot. Listening is part of making music, too.", help: "Of course! Start with three little notes, then listen to how they feel together. Would you like to try my Lullaby Lab?", project: "Lullaby Lab", anchor: "lullaby-lab", secret: "A tiny golden musical note is waiting along my path. Listen with your eyes as well as your ears." },
  luna: { interest: "I love keeping little memories and sharing their stories. Even an ordinary moment can become precious.", lesson: "Our memories help remind us who we are. Every little moment can hold a piece of our heart.", help: "Choose a moment you want to remember. You can leave a little wish in our shared Memory Book, where it waits for moderation.", project: "Moonlit Memory Book", anchor: "moonlit-memory-book", secret: "A silver memory key waits in my moonlit story. Some treasures are quiet little things." },
};

export function detectIntent(input: string): Intent {
  const text = input.toLowerCase().replace(/[’']/g, "");
  if (/\b(secret|hidden|collectible)\b/.test(text)) return "secret";
  if (/\b(bye|goodbye|farewell|see you)\b/.test(text)) return "farewell";
  if (/\b(learn|lesson|memories matter)\b/.test(text)) return "lesson";
  if (/\b(help|teach|start|how do|how can)\b/.test(text)) return "help";
  if (/\b(projects?|creations?|making|games?|lab|workshop)\b/.test(text)) return "projects";
  if (/\b(story|journey|happened|become)\b/.test(text)) return "story";
  if (/\b(love|like|enjoy|favorite|music|flowers|ocean|memories)\b/.test(text)) return "interests";
  if (/\b(who|name|yourself)\b/.test(text)) return "identity";
  if (/\b(hi|hello|hey|greetings)\b/.test(text)) return "greeting";
  return "fallback";
}

export function replyTo(slug: CharacterSlug, input: string, turn = 0) {
  const character = CHARACTERS.find(item => item.slug === slug)!;
  const voice = VOICES[slug], intent = detectIntent(input.slice(0, 280));
  const story = slug === "normal" ? "/#futures" : `/futures/${slug}/story`;
  const projectHref = slug === "normal" ? voice.anchor : `${story}#project-${voice.anchor}`;
  const replies: Record<Intent, string> = {
    greeting: `Hello, friend! I’m ${character.name}. ${voice.help}`,
    identity: `I’m ${character.name}, Maria’s ${character.profession.toLowerCase()} ${slug === "normal" ? "self" : "future"}. ${voice.interest}`,
    story: `${character.tagline ? `“${character.tagline}” ` : ""}${voice.lesson} You can follow my whole journey in the story.`,
    interests: voice.interest, projects: `Come try my ${voice.project}! ${voice.help}`, help: voice.help, lesson: voice.lesson,
    secret: voice.secret, farewell: `See you soon, friend! ${voice.lesson}`,
    fallback: turn % 2 ? `That makes me curious. ${voice.lesson} Would you like to ask about my story?` : `I’m not sure about that one yet. ${voice.interest} You can ask about my creations or what I learned.`,
  };
  return { text: replies[intent], intent, href: ["projects", "help"].includes(intent) ? projectHref : intent === "story" ? story : undefined, linkLabel: intent === "story" ? "Read my story" : `Try ${voice.project}` };
}
