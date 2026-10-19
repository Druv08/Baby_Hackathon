/**
 * Pure state for Forest Maria's four story interactions, kept free of React
 * so each rule is unit-tested directly.
 */

// ── Scene 1: the turning signpost (never reveals the final route) ──────
export const SIGNPOST_DIRECTIONS = ["Rabbit Village →", "← Mushroom Hollow", "Rabbit Village ↑", "← Old Oak Path"] as const;

export const SIGNPOST_MESSAGES = [
  "Tap the wooden signpost.",
  "The arrow spins… then points somewhere else. The forest paths keep changing!",
  "It turned again! The sign can’t decide which way is home.",
  "Every path in this forest seems to move. Maria will need more than a signpost.",
] as const;

export function signpostLevel(taps: number): number {
  return Math.max(0, Math.min(taps, SIGNPOST_MESSAGES.length - 1));
}

/** The second direction the arrow briefly shows on a given turn. */
export function signpostFlash(taps: number): string {
  return SIGNPOST_DIRECTIONS[taps % SIGNPOST_DIRECTIONS.length];
}

// ── Scene 2: the wayfinder map comes alive, then shifts ────────────────
export type MapStage = "dormant" | "glowing" | "shifted";

export interface ShiftingMapState {
  stage: MapStage;
  shifts: number;
}

export const initialShiftingMap: ShiftingMapState = { stage: "dormant", shifts: 0 };

export function shiftingMapReducer(state: ShiftingMapState, action: { type: "leaf" } | { type: "watch" } | { type: "reset" }): ShiftingMapState {
  switch (action.type) {
    case "reset":
      return initialShiftingMap;
    case "leaf":
      return state.stage === "dormant" ? { stage: "glowing", shifts: 0 } : state;
    case "watch":
      // Once glowing, the routes rearrange each time you look again.
      return state.stage === "dormant" ? state : { stage: "shifted", shifts: state.shifts + 1 };
  }
}

/** Which of the four map paths are visible at a given shift. */
export function visiblePaths(state: ShiftingMapState): number[] {
  if (state.stage === "dormant") return [];
  if (state.stage === "glowing") return [0, 1, 2];
  // One path disappears and another appears; it keeps changing.
  return state.shifts % 2 === 1 ? [1, 2, 3] : [0, 2, 3];
}

// ── Scene 3: which route suits the rabbit? ─────────────────────────────
export type RouteId = "log-bridge" | "riverside" | "treetops";

export const RABBIT_ROUTES: { id: RouteId; name: string; note: string; suits: boolean; feedback: string }[] = [
  {
    id: "log-bridge",
    name: "Route A — Fallen Log Bridge",
    note: "The shortest way, over a narrow, wobbly log.",
    suits: false,
    feedback: "It’s the shortest path, but the narrow log over rushing water is far too scary for a little rabbit.",
  },
  {
    id: "riverside",
    name: "Route B — Quiet Riverside Trail",
    note: "A longer, peaceful path with a gentle, shallow crossing.",
    suits: true,
    feedback: "Yes! It takes a little longer, but the trail is quiet and close to the ground, and the crossing is gentle. Just right for a rabbit.",
  },
  {
    id: "treetops",
    name: "Route C — Treetop Branches",
    note: "High branches that squirrels and birds love.",
    suits: false,
    feedback: "Squirrels and birds would love it up there, but rabbits can’t climb high branches.",
  },
];

export interface RouteChoiceState {
  chosen: RouteId | null;
  tried: RouteId[];
}

export const initialRouteChoice: RouteChoiceState = { chosen: null, tried: [] };

export function routeChoiceReducer(state: RouteChoiceState, action: { type: "choose"; id: RouteId } | { type: "reset" }): RouteChoiceState {
  if (action.type === "reset") return initialRouteChoice;
  if (!RABBIT_ROUTES.some((r) => r.id === action.id) || isRouteSolved(state)) return state;
  return { chosen: action.id, tried: state.tried.includes(action.id) ? state.tried : [...state.tried, action.id] };
}

export function isRouteSolved(state: RouteChoiceState): boolean {
  return RABBIT_ROUTES.find((r) => r.id === state.chosen)?.suits === true;
}

// ── Scene 4: connect the safe landmarks to the cottage ─────────────────
export type LandmarkId = "entrance" | "riverside" | "log" | "treetop" | "cottage";

export const SAFE_LANDMARKS: { id: LandmarkId; name: string; x: number; y: number; safe: boolean }[] = [
  { id: "entrance", name: "Forest Entrance", x: 12, y: 74, safe: true },
  { id: "log", name: "Fallen Log", x: 40, y: 30, safe: false },
  { id: "riverside", name: "Riverside Trail", x: 46, y: 70, safe: true },
  { id: "treetop", name: "Treetop Branches", x: 66, y: 22, safe: false },
  { id: "cottage", name: "Rabbit’s Cottage", x: 86, y: 58, safe: true },
];

/** The rabbit-safe route, in order. */
export const SAFE_ROUTE: LandmarkId[] = ["entrance", "riverside", "cottage"];

export interface SafeRouteState {
  route: LandmarkId[];
  last: "start" | "added" | "unsafe" | "order" | "done";
  tried: LandmarkId | null;
}

export const initialSafeRoute: SafeRouteState = { route: [], last: "start", tried: null };

export function safeRouteReducer(state: SafeRouteState, action: { type: "tap"; id: LandmarkId } | { type: "reset" }): SafeRouteState {
  if (action.type === "reset") return initialSafeRoute;
  if (state.last === "done") return state;
  const lm = SAFE_LANDMARKS.find((l) => l.id === action.id);
  if (!lm) return state;
  if (!lm.safe) return { ...state, last: "unsafe", tried: action.id };
  const expected = SAFE_ROUTE[state.route.length];
  if (action.id !== expected) return { ...state, last: "order", tried: action.id };
  const route = [...state.route, action.id];
  return { route, last: route.length === SAFE_ROUTE.length ? "done" : "added", tried: null };
}
