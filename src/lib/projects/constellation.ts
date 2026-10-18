/**
 * Shared constellation logic: pick a star, pick another, and a line joins
 * them. Used by Star's story scenes, the Constellation Builder and the
 * Hidden Constellation secret. Pure reducer, no rendering.
 */

export interface SkyStar {
  id: string;
  /** Position as a percentage of the board, 0–100. */
  x: number;
  y: number;
  /** Accessible name, e.g. "Bright star near the moon". */
  label: string;
}

export type Edge = readonly [string, string];

export interface ConstellationState {
  /** The star a new line will start from. */
  active: string | null;
  edges: Edge[];
  /** An attempted line that isn't part of the target pattern (fades away). */
  rejected: Edge | null;
  name: string;
}

export type ConstellationAction =
  | { type: "select"; starId: string }
  | { type: "undo" }
  | { type: "clear" }
  | { type: "rename"; name: string };

export interface ConstellationOptions {
  stars: readonly SkyStar[];
  /**
   * When set, only these lines can be drawn; any other attempt is rejected
   * (shown briefly, then fades) instead of being kept.
   */
  target?: readonly Edge[];
  maxNameLength?: number;
}

export const initialConstellation: ConstellationState = { active: null, edges: [], rejected: null, name: "" };

export const sameEdge = (a: Edge, b: Edge) => (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
const hasEdge = (edges: readonly Edge[], e: Edge) => edges.some((x) => sameEdge(x, e));

export function constellationReducer(
  state: ConstellationState,
  action: ConstellationAction,
  options: ConstellationOptions,
): ConstellationState {
  switch (action.type) {
    case "select": {
      if (!options.stars.some((s) => s.id === action.starId)) return state;
      if (state.active === null) return { ...state, active: action.starId, rejected: null };
      if (state.active === action.starId) return { ...state, active: null, rejected: null };
      const edge: Edge = [state.active, action.starId];
      if (options.target && !hasEdge(options.target, edge)) {
        // Gentle failure: show the attempt, keep nothing, stay on the same star.
        return { ...state, rejected: edge };
      }
      const edges = hasEdge(state.edges, edge) ? state.edges : [...state.edges, edge];
      return { ...state, edges, active: action.starId, rejected: null };
    }
    case "undo":
      return { ...state, edges: state.edges.slice(0, -1), active: null, rejected: null };
    case "clear":
      return { ...initialConstellation, name: state.name };
    case "rename": {
      const name = action.name.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, options.maxNameLength ?? 30);
      return { ...state, name };
    }
  }
}

/** True once every target line has been drawn. */
export function isPatternComplete(edges: readonly Edge[], target: readonly Edge[]): boolean {
  return target.length > 0 && target.every((t) => hasEdge(edges, t));
}

/** Stars touched by at least one line. */
export function connectedStars(edges: readonly Edge[]): Set<string> {
  return new Set(edges.flat());
}
