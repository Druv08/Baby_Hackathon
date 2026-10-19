/**
 * Pure state for Luna Maria's story interactions, plus the keepsakes and
 * memories shared with the Keepsake Cabinet project. Free of React so every
 * rule is unit-tested directly.
 */

// ── Keepsakes and the memories they belong to ──────────────────────────
export type KeepsakeId = "flower" | "bell" | "boat" | "photo";
export type MemoryId = "rabbit-friend" | "celebration" | "squirrel-adventure" | "owlet-flight";

export const KEEPSAKES: { id: KeepsakeId; name: string; icon: string; clue: string }[] = [
  {
    id: "flower",
    name: "Pressed Flower",
    icon: "🌸",
    clue: "Pressed between two pages, with a tiny paw print beside it. Someone small kept it from a very special day.",
  },
  {
    id: "bell",
    name: "Silver Bell",
    icon: "🔔",
    clue: "Its ribbon is tied in a party bow, and it still smells faintly of lantern wax. It once rang for a celebration.",
  },
  {
    id: "boat",
    name: "Tiny Wooden Boat",
    icon: "⛵",
    clue: "Carved from an acorn-wood branch, with little nibble marks on the mast. Its owner loves climbing and exploring.",
  },
  {
    id: "photo",
    name: "Faded Photograph",
    icon: "🖼️",
    clue: "A picture of two owls on a branch: one big and proud, one small with wings spread wide.",
  },
];

/** The fictional game's defined answers: each keepsake belongs to one memory. */
export const MEMORIES: { id: MemoryId; keepsake: KeepsakeId; owner: string; story: string }[] = [
  {
    id: "rabbit-friend",
    keepsake: "flower",
    owner: "Little Rabbit",
    story: "The day the little rabbit met its best friend, and they picked the first spring flower together.",
  },
  {
    id: "celebration",
    keepsake: "bell",
    owner: "The Villagers",
    story: "A village celebration where friends gathered beneath glowing lanterns and rang little bells until midnight.",
  },
  {
    id: "squirrel-adventure",
    keepsake: "boat",
    owner: "Brave Squirrel",
    story: "A squirrel’s first adventure across the little lake, sailing a tiny wooden boat it carved itself.",
  },
  {
    id: "owlet-flight",
    keepsake: "photo",
    owner: "Elderly Owl",
    story: "The elderly owl teaching his little owlet to fly, and how proud he felt when she finally spread her wings.",
  },
];

export const keepsake = (id: KeepsakeId) => KEEPSAKES.find((k) => k.id === id)!;
export const memory = (id: MemoryId) => MEMORIES.find((m) => m.id === id)!;

// ── Scene 1: a fading lantern that flickers but can't stay lit ─────────
export const LANTERN_MESSAGES = [
  "Tap the fading lantern by the lake.",
  "It flickers… a faint picture of a memory appears, then fades away.",
  "For a moment it glowed! But the memory inside is incomplete.",
  "Something is missing from this memory. Maria will need to find out what.",
] as const;

export function lanternLevel(taps: number): number {
  return Math.max(0, Math.min(taps, LANTERN_MESSAGES.length - 1));
}

// ── Scene 2: investigate three keepsakes in the library ────────────────
export const LIBRARY_KEEPSAKES: KeepsakeId[] = ["flower", "bell", "boat"];

export interface CluesState {
  found: KeepsakeId[];
  last: KeepsakeId | null;
}

export const initialClues: CluesState = { found: [], last: null };

export function cluesReducer(state: CluesState, action: { type: "examine"; id: KeepsakeId } | { type: "reset" }): CluesState {
  if (action.type === "reset") return initialClues;
  if (!LIBRARY_KEEPSAKES.includes(action.id)) return state;
  return { found: state.found.includes(action.id) ? state.found : [...state.found, action.id], last: action.id };
}

// ── Scene 3: an object alone, or the story behind it? ──────────────────
export type Approach = "object" | "story";

export interface ApproachState {
  tried: Approach[];
  glowing: boolean;
}

export const initialApproach: ApproachState = { tried: [], glowing: false };

export function approachReducer(state: ApproachState, action: { type: "try"; approach: Approach } | { type: "reset" }): ApproachState {
  if (action.type === "reset") return initialApproach;
  const tried = state.tried.includes(action.approach) ? state.tried : [...state.tried, action.approach];
  return { tried, glowing: state.glowing || action.approach === "story" };
}

// ── Scene 4: match three keepsakes to their stories ────────────────────
export const STORY_PAIRS: { keepsake: KeepsakeId; memory: MemoryId }[] = [
  { keepsake: "flower", memory: "rabbit-friend" },
  { keepsake: "boat", memory: "squirrel-adventure" },
  { keepsake: "photo", memory: "owlet-flight" },
];

export interface MatchState {
  selected: KeepsakeId | null;
  matched: KeepsakeId[];
  last: "start" | "picked" | "matched" | "wrong" | "pick-first";
  tried: MemoryId | null;
}

export type MatchAction = { type: "pick"; id: KeepsakeId } | { type: "match"; memory: MemoryId } | { type: "reset" };

export const initialMatch: MatchState = { selected: null, matched: [], last: "start", tried: null };

/** Matching shared by Scene 4 (three pairs) and the Keepsake Cabinet (four). */
export function matchReducerFor(pairs: { keepsake: KeepsakeId; memory: MemoryId }[]) {
  return function matchReducer(state: MatchState, action: MatchAction): MatchState {
    switch (action.type) {
      case "reset":
        return initialMatch;
      case "pick":
        if (!pairs.some((p) => p.keepsake === action.id) || state.matched.includes(action.id)) return state;
        return { ...state, selected: action.id, last: "picked", tried: null };
      case "match": {
        if (!pairs.some((p) => p.memory === action.memory)) return state;
        if (state.selected === null) return { ...state, last: "pick-first", tried: action.memory };
        const right = pairs.find((p) => p.keepsake === state.selected)!.memory === action.memory;
        if (!right) return { ...state, last: "wrong", tried: action.memory };
        return { selected: null, matched: [...state.matched, state.selected], last: "matched", tried: action.memory };
      }
    }
  };
}

export const storyMatchReducer = matchReducerFor(STORY_PAIRS);
