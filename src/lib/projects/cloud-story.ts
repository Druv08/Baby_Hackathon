/**
 * Pure state for Cloud Maria's four story interactions. Kept free of React
 * so each rule (one step at a time, the right chime, the right-sized cloud)
 * is unit-tested directly.
 */

// ── Scene 1: the worried little cloud ──────────────────────────────────
export const WORRIED_CLOUD_MESSAGES = [
  "Tap the worried little cloud.",
  "The little cloud bounces and brightens. It’s happy you noticed it!",
  "It points up at a broken sky bridge. Its home is way up there…",
  "Maria wants to help… but she has never been so high before.",
] as const;

/** Each tap cheers the cloud up a little more, up to the last message. */
export function worriedCloudLevel(taps: number): number {
  return Math.max(0, Math.min(taps, WORRIED_CLOUD_MESSAGES.length - 1));
}

// ── Scene 2: three cloud steps, one at a time ──────────────────────────
export const STEP_COUNT = 3;

export interface StepsState {
  /** How many steps Maria has climbed (0–3). */
  climbed: number;
  /** The step that wobbled because it was tried out of order. */
  wobble: number | null;
}

export type StepsAction = { type: "step"; index: number } | { type: "reset" };

export const initialSteps: StepsState = { climbed: 0, wobble: null };

export function stepsReducer(state: StepsState, action: StepsAction): StepsState {
  if (action.type === "reset") return initialSteps;
  if (state.climbed >= STEP_COUNT) return state;
  // Only the next step holds; any other one wobbles.
  if (action.index === state.climbed) return { climbed: state.climbed + 1, wobble: null };
  return { ...state, wobble: action.index };
}

// ── Scene 3: which wind chime shows the way? ───────────────────────────
export type ChimeId = "left" | "middle" | "right";

export interface Chime {
  id: ChimeId;
  label: string;
  /** Which way its wind pushes the nearby clouds. */
  drift: "down" | "back" | "forward";
  message: string;
}

export const CHIMES: Chime[] = [
  {
    id: "left",
    label: "Left wind chime",
    drift: "down",
    message: "Ting! The clouds sink down into the fog… that’s not the way.",
  },
  {
    id: "middle",
    label: "Middle wind chime",
    drift: "back",
    message: "Ting-a-ling! The clouds drift back toward the waterfall. Hmm, not that way.",
  },
  {
    id: "right",
    label: "Right wind chime",
    drift: "forward",
    message: "Ding! Every cloud drifts the same way… toward a floating island! The wind is showing the way!",
  },
];

export const CORRECT_CHIME: ChimeId = "right";

export interface ChimesState {
  rung: ChimeId | null;
  /** Counts rings so the swing animation can replay on the same chime. */
  rings: number;
  found: boolean;
}

export const initialChimes: ChimesState = { rung: null, rings: 0, found: false };

export function chimesReducer(state: ChimesState, action: { type: "ring"; id: ChimeId } | { type: "reset" }): ChimesState {
  if (action.type === "reset") return initialChimes;
  if (!CHIMES.some((c) => c.id === action.id)) return state;
  return { rung: action.id, rings: state.rings + 1, found: state.found || action.id === CORRECT_CHIME };
}

// ── Scene 4: three cloud platforms make a bridge ───────────────────────
export type CloudSize = "small" | "medium" | "large";

/** The bridge's three gaps, from Maria's cliff outward. */
export const BRIDGE_GAPS: CloudSize[] = ["large", "small", "medium"];

export const BRIDGE_CLOUDS: { size: CloudSize; label: string }[] = [
  { size: "small", label: "Small cloud" },
  { size: "medium", label: "Medium cloud" },
  { size: "large", label: "Big cloud" },
];

export interface BridgeState {
  /** Cloud chosen and waiting to be placed. */
  selected: CloudSize | null;
  /** Which cloud fills each gap (by gap index). */
  placed: (CloudSize | null)[];
  /** Feedback for the last attempt. */
  last: "placed" | "wrong-fit" | "pick-first" | null;
}

export type BridgeAction =
  | { type: "select"; size: CloudSize }
  | { type: "place"; gap: number }
  | { type: "reset" };

export const initialBridge: BridgeState = { selected: null, placed: [null, null, null], last: null };

export function bridgeReducer(state: BridgeState, action: BridgeAction): BridgeState {
  switch (action.type) {
    case "reset":
      return initialBridge;
    case "select":
      if (state.placed.includes(action.size)) return state;
      return { ...state, selected: action.size, last: null };
    case "place": {
      const gapSize = BRIDGE_GAPS[action.gap];
      if (gapSize === undefined || state.placed[action.gap] !== null) return state;
      if (state.selected === null) return { ...state, last: "pick-first" };
      // A cloud only settles into the gap that matches its size.
      if (state.selected !== gapSize) return { ...state, last: "wrong-fit" };
      const placed = state.placed.map((p, i) => (i === action.gap ? state.selected : p));
      return { selected: null, placed, last: "placed" };
    }
  }
}

export function isBridgeComplete(state: BridgeState): boolean {
  return state.placed.every((p, i) => p === BRIDGE_GAPS[i]);
}
