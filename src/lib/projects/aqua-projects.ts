/**
 * Pure logic for Aqua Maria's three creations: Ocean Discovery, Coral Care
 * Garden and Turtle's Safe Passage. React components only render this state.
 * Creature descriptions are friendly character notes, not science facts.
 */

// ── Ocean Discovery ─────────────────────────────────────────────────────
export type SeaCreatureId = "turtle" | "jellyfish" | "seahorse" | "manta";

export interface SeaCreature {
  id: SeaCreatureId;
  name: string;
  description: string;
  /** Where it appears in the Ocean Discovery artwork (percent, 4:3). */
  x: number;
  y: number;
}

export const OCEAN_CREATURES: SeaCreature[] = [
  {
    id: "turtle",
    name: "Baby Sea Turtle",
    description: "A gentle little explorer who loves calm water and safe coral gardens.",
    x: 30,
    y: 72,
  },
  {
    id: "jellyfish",
    name: "Glowing Jellyfish",
    description: "A beautiful drifting ocean creature that glows like a tiny underwater lantern.",
    x: 19,
    y: 11,
  },
  {
    id: "seahorse",
    name: "Seahorse",
    description: "A tiny ocean traveler who likes resting among seagrass.",
    x: 86,
    y: 58,
  },
  {
    id: "manta",
    name: "Manta Ray",
    description: "A graceful swimmer who glides through the ocean with enormous wing-like fins.",
    x: 74,
    y: 15,
  },
];

export interface DiscoveryState {
  selected: SeaCreatureId | null;
  collected: SeaCreatureId[];
}

export type DiscoveryAction = { type: "select"; id: SeaCreatureId } | { type: "collect" } | { type: "reset" };

export const initialDiscovery: DiscoveryState = { selected: null, collected: [] };

export function discoveryReducer(state: DiscoveryState, action: DiscoveryAction): DiscoveryState {
  switch (action.type) {
    case "reset":
      return initialDiscovery;
    case "select":
      return OCEAN_CREATURES.some((c) => c.id === action.id) ? { ...state, selected: action.id } : state;
    case "collect":
      if (state.selected === null || state.collected.includes(state.selected)) return state;
      // Keep the collection in the creatures' own order.
      return {
        ...state,
        collected: OCEAN_CREATURES.map((c) => c.id).filter((id) => id === state.selected || state.collected.includes(id)),
      };
  }
}

export const allDiscovered = (s: DiscoveryState) => s.collected.length === OCEAN_CREATURES.length;

// ── Coral Care Garden ───────────────────────────────────────────────────
export type DebrisId = "can" | "net-scrap" | "bottle";
export type FragmentId = "branching" | "fan" | "brain";
export type SupportId = "sunny-ledge" | "gentle-arch" | "sandy-floor";

export const DEBRIS: { id: DebrisId; label: string; x: number; y: number }[] = [
  { id: "can", label: "Old tin can", x: 14, y: 84 },
  { id: "net-scrap", label: "Scrap of fishing net", x: 50, y: 58 },
  { id: "bottle", label: "Plastic bottle", x: 64, y: 86 },
];

export const FRAGMENTS: { id: FragmentId; label: string; likes: SupportId; color: string }[] = [
  { id: "branching", label: "Pink branching coral", likes: "sunny-ledge", color: "#ff8fb1" },
  { id: "fan", label: "Purple fan coral", likes: "gentle-arch", color: "#b48cff" },
  { id: "brain", label: "Golden brain coral", likes: "sandy-floor", color: "#ffc35c" },
];

export const SUPPORTS: { id: SupportId; label: string; hint: string; x: number; y: number }[] = [
  { id: "sunny-ledge", label: "Sunny ledge", hint: "bright and close to the light", x: 20, y: 52 },
  { id: "gentle-arch", label: "Gentle arch", hint: "where a soft current flows", x: 50, y: 39 },
  { id: "sandy-floor", label: "Sandy floor", hint: "low, calm and sheltered", x: 81, y: 66 },
];

export type GardenFeedback = "start" | "cleaned" | "picked" | "planted" | "not-suitable" | "clean-first" | "pick-first" | "restored";

export interface CoralGardenState {
  removed: DebrisId[];
  selected: FragmentId | null;
  planted: Partial<Record<SupportId, FragmentId>>;
  feedback: GardenFeedback;
}

export type CoralGardenAction =
  | { type: "remove"; id: DebrisId }
  | { type: "pick"; id: FragmentId }
  | { type: "plant"; support: SupportId }
  | { type: "reset" };

export const initialCoralGarden: CoralGardenState = { removed: [], selected: null, planted: {}, feedback: "start" };

export const isClean = (s: CoralGardenState) => s.removed.length === DEBRIS.length;
export const isRestored = (s: CoralGardenState) => SUPPORTS.every((sp) => s.planted[sp.id] !== undefined);
export function gardenStage(s: CoralGardenState): "clean" | "restore" | "celebrate" {
  if (!isClean(s)) return "clean";
  return isRestored(s) ? "celebrate" : "restore";
}

export function coralGardenReducer(state: CoralGardenState, action: CoralGardenAction): CoralGardenState {
  switch (action.type) {
    case "reset":
      return initialCoralGarden;
    case "remove": {
      if (!DEBRIS.some((d) => d.id === action.id) || state.removed.includes(action.id)) return state;
      return { ...state, removed: [...state.removed, action.id], feedback: "cleaned" };
    }
    case "pick": {
      if (!FRAGMENTS.some((f) => f.id === action.id)) return state;
      if (!isClean(state)) return { ...state, feedback: "clean-first" };
      if (Object.values(state.planted).includes(action.id)) return state;
      return { ...state, selected: action.id, feedback: "picked" };
    }
    case "plant": {
      if (!SUPPORTS.some((s) => s.id === action.support) || state.planted[action.support]) return state;
      if (!isClean(state)) return { ...state, feedback: "clean-first" };
      if (state.selected === null) return { ...state, feedback: "pick-first" };
      const fragment = FRAGMENTS.find((f) => f.id === state.selected)!;
      if (fragment.likes !== action.support) return { ...state, feedback: "not-suitable" };
      const planted = { ...state.planted, [action.support]: fragment.id };
      const next = { ...state, planted, selected: null };
      return { ...next, feedback: isRestored(next) ? "restored" : "planted" };
    }
  }
}

// ── Turtle's Safe Passage ───────────────────────────────────────────────
export type SpotId = "nest" | "coral-passage" | "kelp-forest" | "seashell-crossing" | "shipwreck" | "safe-lagoon" | "deep-current" | "sanctuary";
export type PassageKind = "safe" | "current" | "net";

export const PASSAGE_SPOTS: { id: SpotId; name: string; x: number; y: number }[] = [
  { id: "nest", name: "Turtle’s Nest", x: 10, y: 80 },
  { id: "coral-passage", name: "Coral Passage", x: 28, y: 52 },
  { id: "kelp-forest", name: "Kelp Forest", x: 30, y: 18 },
  { id: "seashell-crossing", name: "Seashell Crossing", x: 52, y: 66 },
  { id: "shipwreck", name: "Old Shipwreck", x: 55, y: 26 },
  { id: "safe-lagoon", name: "Safe Lagoon", x: 72, y: 48 },
  { id: "deep-current", name: "Deep Current", x: 74, y: 84 },
  { id: "sanctuary", name: "Ocean Sanctuary", x: 90, y: 22 },
];

export const PASSAGE_ROUTES: { from: SpotId; to: SpotId; kind: PassageKind }[] = [
  { from: "nest", to: "coral-passage", kind: "safe" },
  { from: "nest", to: "deep-current", kind: "current" },
  { from: "coral-passage", to: "kelp-forest", kind: "safe" },
  { from: "coral-passage", to: "seashell-crossing", kind: "safe" },
  { from: "kelp-forest", to: "shipwreck", kind: "net" },
  { from: "seashell-crossing", to: "safe-lagoon", kind: "safe" },
  { from: "seashell-crossing", to: "deep-current", kind: "current" },
  { from: "shipwreck", to: "sanctuary", kind: "safe" },
  { from: "safe-lagoon", to: "sanctuary", kind: "safe" },
  { from: "deep-current", to: "sanctuary", kind: "current" },
];

export const PASSAGE_START: SpotId = "nest";
export const PASSAGE_GOAL: SpotId = "sanctuary";

export function passageBetween(a: SpotId, b: SpotId) {
  return PASSAGE_ROUTES.find((r) => (r.from === a && r.to === b) || (r.from === b && r.to === a));
}

export function passagesFrom(id: SpotId): { to: SpotId; kind: PassageKind }[] {
  return PASSAGE_ROUTES.flatMap((r) => (r.from === id ? [{ to: r.to, kind: r.kind }] : r.to === id ? [{ to: r.from, kind: r.kind }] : []));
}

export type PassageFeedback = "start" | "swam" | "current" | "net" | "not-connected" | "visited" | "arrived";

export interface PassageState {
  path: SpotId[];
  feedback: PassageFeedback;
  tried: SpotId | null;
}

export const initialPassage: PassageState = { path: [PASSAGE_START], feedback: "start", tried: null };

export const turtleArrived = (s: PassageState) => s.path.at(-1) === PASSAGE_GOAL;

export function passageReducer(state: PassageState, action: { type: "swim"; to: SpotId } | { type: "back" } | { type: "reset" }): PassageState {
  if (action.type === "reset") return initialPassage;
  if (action.type === "back") {
    return state.path.length > 1 && !turtleArrived(state) ? { path: state.path.slice(0, -1), feedback: "swam", tried: null } : state;
  }
  if (turtleArrived(state) || !PASSAGE_SPOTS.some((s) => s.id === action.to)) return state;
  const here = state.path.at(-1)!;
  const route = passageBetween(here, action.to);
  if (!route) return { ...state, feedback: "not-connected", tried: action.to };
  // Unsafe routes give gentle feedback; the turtle stays put and can try again.
  if (route.kind !== "safe") return { ...state, feedback: route.kind, tried: action.to };
  if (state.path.includes(action.to)) return { ...state, feedback: "visited", tried: action.to };
  const path = [...state.path, action.to];
  return { path, feedback: action.to === PASSAGE_GOAL ? "arrived" : "swam", tried: null };
}

/** Fewest safe swims from the nest to the sanctuary (breadth-first). */
export function safestRoute(): SpotId[] | null {
  const previous = new Map<SpotId, SpotId | null>([[PASSAGE_START, null]]);
  const queue: SpotId[] = [PASSAGE_START];
  while (queue.length) {
    const here = queue.shift()!;
    if (here === PASSAGE_GOAL) {
      const path: SpotId[] = [];
      for (let at: SpotId | null = PASSAGE_GOAL; at !== null; at = previous.get(at) ?? null) path.unshift(at);
      return path;
    }
    for (const { to, kind } of passagesFrom(here)) {
      if (kind === "safe" && !previous.has(to)) {
        previous.set(to, here);
        queue.push(to);
      }
    }
  }
  return null;
}
