/**
 * Pure logic for Inventor Maria's three creations: Star Workshop, Dream
 * Lantern Lab and Little Helper Machines. React components only render it.
 */

// ── Star Workshop: three mechanical puzzles ─────────────────────────────
export type PartId =
  | "gear-s"
  | "gear-m"
  | "gear-l"
  | "spring"
  | "star-core"
  | "belt"
  | "crank";

export const PARTS: Record<PartId, { label: string; kind: "gear" | "other"; size?: number }> = {
  "gear-s": { label: "Small gear", kind: "gear", size: 8 },
  "gear-m": { label: "Medium gear", kind: "gear", size: 12 },
  "gear-l": { label: "Large gear", kind: "gear", size: 16 },
  spring: { label: "Spring", kind: "other" },
  "star-core": { label: "Star core", kind: "other" },
  belt: { label: "Drive belt", kind: "other" },
  crank: { label: "Hand crank", kind: "other" },
};

export interface WorkshopLevel {
  id: number;
  title: string;
  goal: string;
  /** Slots in order, each with the part that belongs there. */
  slots: { label: string; needs: PartId }[];
  /** Parts on the bench (includes decoys). */
  bench: PartId[];
}

export const WORKSHOP_LEVELS: WorkshopLevel[] = [
  {
    id: 1,
    title: "Missing Gear",
    goal: "One gear has fallen out of the music box. Find the one that fits the gap between the two medium gears.",
    slots: [{ label: "Gap in the gear train", needs: "gear-s" }],
    bench: ["gear-l", "gear-s", "spring"],
  },
  {
    id: 2,
    title: "Broken Mechanism",
    goal: "The lantern winder’s gears are mixed up. Put them back from biggest to smallest so the little wheel spins fast.",
    slots: [
      { label: "First axle", needs: "gear-l" },
      { label: "Second axle", needs: "gear-m" },
      { label: "Third axle", needs: "gear-s" },
    ],
    bench: ["gear-s", "gear-l", "gear-m"],
  },
  {
    id: 3,
    title: "Star Engine",
    goal: "Build the Star Engine: crank, big gear, belt, spring and the star core at the heart.",
    slots: [
      { label: "Handle", needs: "crank" },
      { label: "Drive wheel", needs: "gear-l" },
      { label: "Connector", needs: "belt" },
      { label: "Push", needs: "spring" },
      { label: "Heart", needs: "star-core" },
    ],
    bench: ["spring", "gear-l", "star-core", "crank", "gear-s", "belt"],
  },
];

export interface WorkshopState {
  level: number; // index into WORKSHOP_LEVELS
  placed: (PartId | null)[];
  selected: PartId | null;
  result: "none" | "wrong" | "solved";
  /** Levels finished so far (1-based ids). */
  solved: number[];
}

export type WorkshopAction =
  | { type: "pick"; part: PartId }
  | { type: "place"; slot: number }
  | { type: "remove"; slot: number }
  | { type: "test" }
  | { type: "retry" }
  | { type: "next" }
  | { type: "restart" };

function emptyFor(level: number): (PartId | null)[] {
  return WORKSHOP_LEVELS[level].slots.map(() => null);
}

export const initialWorkshop: WorkshopState = { level: 0, placed: emptyFor(0), selected: null, result: "none", solved: [] };

export function workshopReducer(state: WorkshopState, action: WorkshopAction): WorkshopState {
  const lvl = WORKSHOP_LEVELS[state.level];
  switch (action.type) {
    case "restart":
      return initialWorkshop;
    case "retry":
      return { ...state, placed: emptyFor(state.level), selected: null, result: "none" };
    case "next":
      if (state.result !== "solved" || state.level >= WORKSHOP_LEVELS.length - 1) return state;
      return { ...state, level: state.level + 1, placed: emptyFor(state.level + 1), selected: null, result: "none" };
    case "pick":
      if (state.result === "solved" || !lvl.bench.includes(action.part) || state.placed.includes(action.part)) return state;
      return { ...state, selected: action.part, result: "none" };
    case "place": {
      if (state.result === "solved" || state.selected === null || action.slot < 0 || action.slot >= lvl.slots.length) return state;
      const placed = state.placed.map((p, i) => (i === action.slot ? state.selected : p));
      return { ...state, placed, selected: null, result: "none" };
    }
    case "remove": {
      if (state.result === "solved" || state.placed[action.slot] == null) return state;
      return { ...state, placed: state.placed.map((p, i) => (i === action.slot ? null : p)), result: "none" };
    }
    case "test": {
      if (state.result === "solved" || state.placed.some((p) => p === null)) return state;
      const ok = state.placed.every((p, i) => p === lvl.slots[i].needs);
      if (!ok) return { ...state, result: "wrong" };
      return { ...state, result: "solved", solved: state.solved.includes(lvl.id) ? state.solved : [...state.solved, lvl.id] };
    }
  }
}

/** How many slots currently hold the right part (for gentle feedback). */
export function correctCount(state: WorkshopState): number {
  const lvl = WORKSHOP_LEVELS[state.level];
  return state.placed.filter((p, i) => p === lvl.slots[i].needs).length;
}

export const allLevelsSolved = (s: WorkshopState) => s.solved.length === WORKSHOP_LEVELS.length;

// ── Dream Lantern Lab ───────────────────────────────────────────────────
export type LanternShape = "star" | "moon" | "crystal";
export type LanternColor = "golden" | "pink" | "lavender" | "blue";

export const LANTERN_SHAPES: { id: LanternShape; label: string }[] = [
  { id: "star", label: "Star Lantern" },
  { id: "moon", label: "Crescent Moon Lantern" },
  { id: "crystal", label: "Crystal Lantern" },
];

export const LANTERN_COLORS: { id: LanternColor; label: string; light: string; deep: string }[] = [
  { id: "golden", label: "Golden", light: "#ffe08a", deep: "#e3a43a" },
  { id: "pink", label: "Pink", light: "#ffc2dc", deep: "#e86a9b" },
  { id: "lavender", label: "Lavender", light: "#dcc8ff", deep: "#9b7be0" },
  { id: "blue", label: "Blue", light: "#bfe6ff", deep: "#4f9ee0" },
];

export const GLOW_MIN = 0;
export const GLOW_MAX = 100;

export interface LanternState {
  shape: LanternShape;
  color: LanternColor;
  glow: number;
  on: boolean;
}

export type LanternAction =
  | { type: "shape"; shape: LanternShape }
  | { type: "color"; color: LanternColor }
  | { type: "glow"; glow: number }
  | { type: "toggle" }
  | { type: "reset" };

export const initialLantern: LanternState = { shape: "star", color: "golden", glow: 60, on: true };

export function lanternReducer(state: LanternState, action: LanternAction): LanternState {
  switch (action.type) {
    case "reset":
      return initialLantern;
    case "shape":
      return LANTERN_SHAPES.some((s) => s.id === action.shape) ? { ...state, shape: action.shape } : state;
    case "color":
      return LANTERN_COLORS.some((c) => c.id === action.color) ? { ...state, color: action.color } : state;
    case "glow":
      if (!Number.isFinite(action.glow)) return state;
      return { ...state, glow: Math.round(Math.min(GLOW_MAX, Math.max(GLOW_MIN, action.glow))) };
    case "toggle":
      return { ...state, on: !state.on };
  }
}

/** Visual glow strength 0–1 (0 when switched off). */
export function glowStrength(s: LanternState): number {
  return s.on ? s.glow / GLOW_MAX : 0;
}

// ── Little Helper Machines ──────────────────────────────────────────────
export type HelperBody = "round" | "square" | "star";
export type HelperMove = "wheels" | "legs" | "propeller";
export type HelperTool = "grabber" | "lantern" | "watering";

export const HELPER_BODIES: { id: HelperBody; label: string }[] = [
  { id: "round", label: "Round clockwork body" },
  { id: "square", label: "Square mechanical body" },
  { id: "star", label: "Star-shaped magical body" },
];

export const HELPER_MOVES: { id: HelperMove; label: string; verb: string }[] = [
  { id: "wheels", label: "Wheels", verb: "rolls" },
  { id: "legs", label: "Little legs", verb: "toddles" },
  { id: "propeller", label: "Hover propeller", verb: "flies" },
];

/** Each tool unlocks exactly one task. */
export const HELPER_TOOLS: { id: HelperTool; label: string; task: string; done: string }[] = [
  { id: "grabber", label: "Tiny grabber", task: "Move the little box", done: "moved the little box onto the shelf!" },
  { id: "lantern", label: "Lantern carrier", task: "Carry the lantern", done: "carried the lantern across the workshop!" },
  { id: "watering", label: "Flower watering attachment", task: "Water the flower", done: "watered the flower, and it bloomed!" },
];

export interface HelperState {
  body: HelperBody;
  move: HelperMove;
  tool: HelperTool;
  /** The configuration that was assembled, if any. */
  built: { body: HelperBody; move: HelperMove; tool: HelperTool } | null;
  /** Counts runs of the task so the animation can replay. */
  runs: number;
  taskDone: boolean;
}

export type HelperAction =
  | { type: "body"; body: HelperBody }
  | { type: "move"; move: HelperMove }
  | { type: "tool"; tool: HelperTool }
  | { type: "assemble" }
  | { type: "task" }
  | { type: "reset" };

export const initialHelper: HelperState = { body: "round", move: "wheels", tool: "grabber", built: null, runs: 0, taskDone: false };

export function helperReducer(state: HelperState, action: HelperAction): HelperState {
  switch (action.type) {
    case "reset":
      return initialHelper;
    case "body":
      return HELPER_BODIES.some((b) => b.id === action.body) ? { ...state, body: action.body } : state;
    case "move":
      return HELPER_MOVES.some((m) => m.id === action.move) ? { ...state, move: action.move } : state;
    case "tool":
      return HELPER_TOOLS.some((t) => t.id === action.tool) ? { ...state, tool: action.tool } : state;
    case "assemble":
      return { ...state, built: { body: state.body, move: state.move, tool: state.tool }, runs: 0, taskDone: false };
    case "task":
      return state.built ? { ...state, runs: state.runs + 1, taskDone: true } : state;
  }
}

/** True when the preview has changed since the helper was assembled. */
export function isModified(s: HelperState): boolean {
  return s.built !== null && (s.built.body !== s.body || s.built.move !== s.move || s.built.tool !== s.tool);
}

/** The one task the assembled helper can do, determined by its tool. */
export function availableTask(s: HelperState) {
  return s.built ? HELPER_TOOLS.find((t) => t.id === s.built!.tool)! : null;
}
