/**
 * Pure state for Aqua Maria's four story interactions, kept free of React so
 * each rule is unit-tested directly. Positions are percentages of the 4:3
 * scene illustrations (1448 × 1086).
 */

// ── Scene 1: the magical breathing bubble ──────────────────────────────
export const BUBBLE_MESSAGES = [
  "Tap Maria’s magical bubble.",
  "The bubble glows! Now Maria can breathe under the water.",
  "Tiny bubbles float upward, and the ocean grows brighter.",
  "Look! A tiny turtle is struggling against the current. Maria wants to help…",
] as const;

export function bubbleLevel(taps: number): number {
  return Math.max(0, Math.min(taps, BUBBLE_MESSAGES.length - 1));
}

// ── Scene 2: three sea creatures to meet ───────────────────────────────
export type CreatureId = "turtle" | "jellyfish" | "reef-fish";

export interface Creature {
  id: CreatureId;
  name: string;
  /** A friendly character description, not a science fact. */
  about: string;
  x: number;
  y: number;
}

export const SCENE_CREATURES: Creature[] = [
  {
    id: "turtle",
    name: "Little Sea Turtle",
    about: "Maria’s brave new friend. It knows the glowing paths of the kingdom and is trying to find its way home.",
    x: 58,
    y: 68,
  },
  {
    id: "jellyfish",
    name: "Glowing Jellyfish",
    about: "It drifts slowly like a tiny lantern, and its soft glow lights the way for little fish.",
    x: 59,
    y: 44,
  },
  {
    id: "reef-fish",
    name: "Coral Reef Fish",
    about: "A bright little fish who loves the coral gardens, but it has been hiding ever since the nets came.",
    x: 75,
    y: 29,
  },
];

export interface CreaturesState {
  selected: CreatureId | null;
  met: CreatureId[];
}

export const initialCreatures: CreaturesState = { selected: null, met: [] };

export function creaturesReducer(state: CreaturesState, action: { type: "select"; id: CreatureId } | { type: "reset" }): CreaturesState {
  if (action.type === "reset") return initialCreatures;
  if (!SCENE_CREATURES.some((c) => c.id === action.id)) return state;
  return { selected: action.id, met: state.met.includes(action.id) ? state.met : [...state.met, action.id] };
}

// ── Scene 3: inspect three tangled points (the net stays for now) ──────
export type TangleId = "paw-knot" | "white-coral" | "big-rock";

export const TANGLES: { id: TangleId; label: string; note: string; x: number; y: number }[] = [
  {
    id: "paw-knot",
    label: "Knot by Maria’s paw",
    note: "Pulling here bends the coral. This knot needs to be loosened gently, not yanked.",
    x: 21,
    y: 41,
  },
  {
    id: "white-coral",
    label: "Net around the white coral",
    note: "The net is looped around a rock beside the pale coral. Lift it over the rock instead of pulling.",
    x: 9,
    y: 64,
  },
  {
    id: "big-rock",
    label: "Net under the big rock",
    note: "A corner is pinned under a large rock. Wait for the current to settle, then slide it free.",
    x: 50,
    y: 82,
  },
];

export interface TanglesState {
  inspected: TangleId[];
  last: TangleId | null;
}

export const initialTangles: TanglesState = { inspected: [], last: null };

export function tanglesReducer(state: TanglesState, action: { type: "inspect"; id: TangleId } | { type: "reset" }): TanglesState {
  if (action.type === "reset") return initialTangles;
  if (!TANGLES.some((t) => t.id === action.id)) return state;
  return {
    inspected: state.inspected.includes(action.id) ? state.inspected : [...state.inspected, action.id],
    last: action.id,
  };
}

export const allTanglesFound = (s: TanglesState) => s.inspected.length === TANGLES.length;

// ── Scene 4: clean the reef in three steps ─────────────────────────────
export type CleanupStep = "loose-net" | "debris" | "last-area";

export const CLEANUP_STEPS: { id: CleanupStep; label: string; done: string }[] = [
  { id: "loose-net", label: "Lift the loose net", done: "The loose net floats away from the coral." },
  { id: "debris", label: "Pick up the old bottle", done: "The old bottle is gone. The water looks clearer." },
  { id: "last-area", label: "Clear the last blocked corner", done: "The last corner is clear. The reef can breathe again!" },
];

export interface CleanupState {
  done: CleanupStep[];
}

export const initialCleanup: CleanupState = { done: [] };

/** The final corner can only be cleared once the net and debris are gone. */
export function canDoStep(state: CleanupState, step: CleanupStep): boolean {
  if (state.done.includes(step)) return false;
  if (step === "last-area") return state.done.includes("loose-net") && state.done.includes("debris");
  return true;
}

export function cleanupReducer(state: CleanupState, action: { type: "do"; step: CleanupStep } | { type: "reset" }): CleanupState {
  if (action.type === "reset") return initialCleanup;
  if (!CLEANUP_STEPS.some((s) => s.id === action.step) || !canDoStep(state, action.step)) return state;
  return { done: [...state.done, action.step] };
}

export const isReefClean = (s: CleanupState) => s.done.length === CLEANUP_STEPS.length;
