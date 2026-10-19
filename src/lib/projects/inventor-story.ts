/**
 * Pure state for Inventor Maria's four story interactions, kept free of
 * React so each rule is unit-tested directly. Positions are percentages of
 * the 16:9 scene illustrations (1672 × 941).
 */

// ── Scene 1: a flickering star lantern (it never stays lit here) ───────
export const LANTERN_MESSAGES = [
  "Tap the flickering star lantern.",
  "It glows brightly for a moment… then fades again.",
  "Flicker, flicker… the lanterns are losing their magic.",
  "Something is wrong with the village’s starlight. The little spark is drifting toward the old workshop…",
] as const;

export function lanternLevel(taps: number): number {
  return Math.max(0, Math.min(taps, LANTERN_MESSAGES.length - 1));
}

// ── Scene 2: learn the machine's parts ─────────────────────────────────
export type MachinePartId = "gear" | "spring" | "chamber";

export const MACHINE_PARTS: { id: MachinePartId; name: string; purpose: string; x: number; y: number }[] = [
  {
    id: "gear",
    name: "Gear",
    purpose: "Gears turn together, passing the machine’s movement from one wheel to the next.",
    x: 72,
    y: 41,
  },
  {
    id: "spring",
    name: "Spring",
    purpose: "The spring stores up energy and gives the gears a gentle push to keep them turning.",
    x: 85,
    y: 72,
  },
  {
    id: "chamber",
    name: "Star Chamber",
    purpose: "The glass Star Chamber holds the Dream Spark and sends its starlight to every lantern.",
    x: 81,
    y: 48,
  },
];

export interface PartsState {
  learned: MachinePartId[];
  last: MachinePartId | null;
}

export const initialParts: PartsState = { learned: [], last: null };

export function partsReducer(state: PartsState, action: { type: "learn"; id: MachinePartId } | { type: "reset" }): PartsState {
  if (action.type === "reset") return initialParts;
  if (!MACHINE_PARTS.some((p) => p.id === action.id)) return state;
  return { learned: state.learned.includes(action.id) ? state.learned : [...state.learned, action.id], last: action.id };
}

// ── Scene 3: put the right gear in each slot ───────────────────────────
export type GearSize = "small" | "medium" | "large";

/** The gear train, left to right: big driver, medium, small pinion. */
export const GEAR_SLOTS: { need: GearSize; label: string }[] = [
  { need: "large", label: "Driving wheel" },
  { need: "medium", label: "Middle gear" },
  { need: "small", label: "Little wheel" },
];

export const GEAR_TRAY: { size: GearSize; label: string; teeth: number }[] = [
  { size: "small", label: "Small gear", teeth: 8 },
  { size: "medium", label: "Medium gear", teeth: 12 },
  { size: "large", label: "Large gear", teeth: 16 },
];

export interface GearChallengeState {
  /** Gear placed in each slot (by slot index). */
  slots: (GearSize | null)[];
  selected: GearSize | null;
  /** Result of the last "test the gears" press. */
  checked: "none" | "wrong" | "right";
  tries: number;
}

export type GearChallengeAction =
  | { type: "pick"; size: GearSize }
  | { type: "place"; slot: number }
  | { type: "test" }
  | { type: "clear" };

export const initialGearChallenge: GearChallengeState = { slots: [null, null, null], selected: null, checked: "none", tries: 0 };

export function gearChallengeReducer(state: GearChallengeState, action: GearChallengeAction): GearChallengeState {
  switch (action.type) {
    case "clear":
      return { ...initialGearChallenge, tries: state.tries };
    case "pick":
      if (state.checked === "right" || !GEAR_TRAY.some((g) => g.size === action.size)) return state;
      return { ...state, selected: action.size, checked: "none" };
    case "place": {
      if (state.checked === "right" || state.selected === null || action.slot < 0 || action.slot >= GEAR_SLOTS.length) return state;
      // A gear moved into a slot leaves any slot it was in before.
      const slots = state.slots.map((g, i) => (i === action.slot ? state.selected : g === state.selected ? null : g));
      return { ...state, slots, selected: null, checked: "none" };
    }
    case "test": {
      if (state.slots.some((g) => g === null)) return state;
      const right = state.slots.every((g, i) => g === GEAR_SLOTS[i].need);
      return { ...state, checked: right ? "right" : "wrong", tries: state.tries + 1 };
    }
  }
}

/** Gentle, specific hints for a wrong arrangement — every try teaches something. */
export function gearHint(state: GearChallengeState): string {
  const i = state.slots.findIndex((g, idx) => g !== GEAR_SLOTS[idx].need);
  if (i === -1) return "";
  const placed = state.slots[i];
  const need = GEAR_SLOTS[i].need;
  const order: GearSize[] = ["small", "medium", "large"];
  const tooBig = placed !== null && order.indexOf(placed) > order.indexOf(need);
  return `The ${GEAR_SLOTS[i].label.toLowerCase()} is ${tooBig ? "too big" : "too small"}. Try a ${need} gear there!`;
}

// ── Scene 4: fit three parts, then the machine wakes up ────────────────
export type ActivationPart = "main-gear" | "spring" | "wheel";

export const ACTIVATION_PARTS: { id: ActivationPart; label: string; done: string }[] = [
  { id: "main-gear", label: "Fit the main gear", done: "Click! The main gear slides into place." },
  { id: "spring", label: "Adjust the spring", done: "Boing… the spring is just right now." },
  { id: "wheel", label: "Add the replacement wheel", done: "The little wheel Maria built fits perfectly!" },
];

export interface ActivationState {
  fitted: ActivationPart[];
  running: boolean;
}

export const initialActivation: ActivationState = { fitted: [], running: false };

export function activationReducer(state: ActivationState, action: { type: "fit"; part: ActivationPart } | { type: "start" } | { type: "reset" }): ActivationState {
  switch (action.type) {
    case "reset":
      return initialActivation;
    case "fit":
      if (state.running || state.fitted.includes(action.part) || !ACTIVATION_PARTS.some((p) => p.id === action.part)) return state;
      return { ...state, fitted: [...state.fitted, action.part] };
    case "start":
      return state.fitted.length === ACTIVATION_PARTS.length ? { ...state, running: true } : state;
  }
}
