import type { Edge, SkyStar } from "./constellation";
import { pagerReducer, type PagerAction, type PagerState } from "./pager";

/* ── Constellation Builder ─────────────────────────────────────────── */

/** A fixed, stable star field for the builder board. */
export const BUILDER_STARS: readonly SkyStar[] = [
  { id: "s1", x: 8, y: 30, label: "Star 1, far left" },
  { id: "s2", x: 18, y: 66, label: "Star 2, low left" },
  { id: "s3", x: 27, y: 20, label: "Star 3, high left" },
  { id: "s4", x: 36, y: 48, label: "Star 4, middle left" },
  { id: "s5", x: 46, y: 78, label: "Star 5, bottom" },
  { id: "s6", x: 52, y: 32, label: "Star 6, centre" },
  { id: "s7", x: 62, y: 58, label: "Star 7, middle right" },
  { id: "s8", x: 70, y: 16, label: "Star 8, high right" },
  { id: "s9", x: 80, y: 44, label: "Star 9, right" },
  { id: "s10", x: 91, y: 72, label: "Star 10, low right" },
];

export const SUGGESTED_NAMES = ["The Little Paw", "The Sleepy Lantern", "The Wishing Kite", "The Brave Comet"];

export interface SavedConstellation {
  name: string;
  edges: Edge[];
}

/** Trims a constellation name; returns null if nothing usable is left. */
export function cleanConstellationName(name: string): string | null {
  const clean = name.replace(/\s+/g, " ").trim().slice(0, 30);
  return clean === "" ? null : clean;
}

/* ── The Dream Atlas ───────────────────────────────────────────────── */

export interface AtlasEntry {
  id: string;
  name: string;
  wish: string;
  theme: string;
  story: string;
  stars: { x: number; y: number }[];
  /** Pairs of indexes into `stars`. */
  lines: [number, number][];
}

/** Fictional constellations from Maria's sky. */
export const ATLAS_ENTRIES: readonly AtlasEntry[] = [
  {
    id: "homeward-star",
    name: "The Homeward Star",
    wish: "I wish I could find my way home.",
    theme: "Belonging",
    story: "Three stars that always point toward home. Travelers who feel lost look for them and remember where they belong.",
    stars: [{ x: 20, y: 70 }, { x: 45, y: 30 }, { x: 72, y: 62 }],
    lines: [[0, 1], [1, 2]],
  },
  {
    id: "friendship-lights",
    name: "The Friendship Lights",
    wish: "I wish I could make a new friend.",
    theme: "Friendship",
    story: "Two pairs of stars that drifted close together one night and never wanted to drift apart again.",
    stars: [{ x: 18, y: 40 }, { x: 38, y: 62 }, { x: 62, y: 38 }, { x: 82, y: 60 }],
    lines: [[0, 1], [1, 2], [2, 3]],
  },
  {
    id: "brave-little-comet",
    name: "The Brave Little Comet",
    wish: "I wish I was brave enough to explore.",
    theme: "Courage",
    story: "A tiny comet that flew farther than any star before it — and found that the sky was full of friends.",
    stars: [{ x: 15, y: 75 }, { x: 35, y: 58 }, { x: 55, y: 44 }, { x: 80, y: 22 }],
    lines: [[0, 1], [1, 2], [2, 3]],
  },
  {
    id: "dreaming-moon",
    name: "The Dreaming Moon",
    wish: "I hope someone remembers my dream.",
    theme: "Hope",
    story: "A circle of quiet stars around the moon. Whenever someone remembers a forgotten dream, one of them glows a little brighter.",
    stars: [{ x: 50, y: 18 }, { x: 74, y: 40 }, { x: 66, y: 72 }, { x: 34, y: 72 }, { x: 26, y: 40 }],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
  },
];

export const atlasReducer = (state: PagerState, action: PagerAction) => pagerReducer(state, action, ATLAS_ENTRIES.length);

/* ── Stargazer's Telescope ─────────────────────────────────────────── */

export interface SkyWonder {
  id: string;
  name: string;
  description: string;
  /** Position in the sky, percent. */
  x: number;
  y: number;
}

export const SKY_WONDERS: readonly SkyWonder[] = [
  {
    id: "golden-moon",
    name: "The Golden Moon",
    description: "A peaceful moon that lights the observatory, so no little explorer ever stargazes in the dark.",
    x: 80,
    y: 24,
  },
  {
    id: "wandering-star",
    name: "The Wandering Star",
    description: "A tiny star that travels between distant constellations, carrying news from one to the next.",
    x: 22,
    y: 30,
  },
  {
    id: "dream-nebula",
    name: "The Dream Nebula",
    description: "A glowing cloud where forgotten dreams gather until someone comes along to remember them.",
    x: 50,
    y: 70,
  },
];

/** How close (in percent) the lens centre must be to discover a wonder. */
export const LENS_RADIUS = 12;

export interface TelescopeState {
  lens: { x: number; y: number };
  discovered: string[];
  /** The wonder currently in view, if any. */
  inView: string | null;
}

export type TelescopeAction =
  | { type: "move"; dx: number; dy: number }
  | { type: "aim"; x: number; y: number }
  | { type: "reset" };

export const initialTelescope: TelescopeState = { lens: { x: 50, y: 40 }, discovered: [], inView: null };

const clamp = (v: number) => Math.min(95, Math.max(5, v));

function look(state: TelescopeState, x: number, y: number): TelescopeState {
  const lens = { x: clamp(x), y: clamp(y) };
  const found = SKY_WONDERS.find((w) => Math.hypot(w.x - lens.x, w.y - lens.y) <= LENS_RADIUS);
  const discovered = found && !state.discovered.includes(found.id) ? [...state.discovered, found.id] : state.discovered;
  return { lens, discovered, inView: found?.id ?? null };
}

export function telescopeReducer(state: TelescopeState, action: TelescopeAction): TelescopeState {
  switch (action.type) {
    case "move":
      return look(state, state.lens.x + action.dx, state.lens.y + action.dy);
    case "aim":
      return look(state, action.x, action.y);
    case "reset":
      return initialTelescope;
  }
}
