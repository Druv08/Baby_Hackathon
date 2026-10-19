/**
 * Pure logic for Cloud Maria's three creations: Cloud Maker, Sky Route
 * Planner and Cloud Postcards. React components only render this state.
 */

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

// ── Cloud Maker ─────────────────────────────────────────────────────────
export type CloudShape = "fluffy" | "star" | "heart" | "platform";
export type CloudColor = "snow" | "pink" | "sky" | "peach" | "lavender" | "sunny";
export type CloudScale = "small" | "medium" | "large";

export const CLOUD_SHAPES: { id: CloudShape; label: string }[] = [
  { id: "fluffy", label: "Fluffy cloud" },
  { id: "star", label: "Star cloud" },
  { id: "heart", label: "Heart cloud" },
  { id: "platform", label: "Cloud platform" },
];

export const CLOUD_COLORS: { id: CloudColor; label: string; fill: string; edge: string }[] = [
  { id: "snow", label: "Snow white", fill: "#ffffff", edge: "#b9d6f1" },
  { id: "pink", label: "Blossom pink", fill: "#ffd6e5", edge: "#f0a3c0" },
  { id: "sky", label: "Sky blue", fill: "#cfe6fb", edge: "#7fb2e5" },
  { id: "peach", label: "Sunset peach", fill: "#ffe0c7", edge: "#f2b083" },
  { id: "lavender", label: "Lavender", fill: "#e7dcfb", edge: "#b49ce8" },
  { id: "sunny", label: "Sunny gold", fill: "#fff1b8", edge: "#e7c35a" },
];

export const CLOUD_SCALES: { id: CloudScale; label: string; factor: number }[] = [
  { id: "small", label: "Small", factor: 0.7 },
  { id: "medium", label: "Medium", factor: 1 },
  { id: "large", label: "Large", factor: 1.45 },
];

/** Most clouds kept in the sky at once; the oldest drifts away first. */
export const MAX_CLOUDS = 24;

export interface PlacedCloud {
  id: number;
  shape: CloudShape;
  color: CloudColor;
  scale: CloudScale;
  /** Percent of the sky canvas. */
  x: number;
  y: number;
}

export interface CloudMakerState {
  shape: CloudShape;
  color: CloudColor;
  scale: CloudScale;
  /** Keyboard placement cursor, percent of the canvas. */
  cursor: { x: number; y: number };
  clouds: PlacedCloud[];
  nextId: number;
}

export type CloudMakerAction =
  | { type: "shape"; shape: CloudShape }
  | { type: "color"; color: CloudColor }
  | { type: "scale"; scale: CloudScale }
  | { type: "place"; x: number; y: number }
  | { type: "placeAtCursor" }
  | { type: "moveCursor"; dx: number; dy: number }
  | { type: "undo" }
  | { type: "clear" };

export const initialCloudMaker: CloudMakerState = {
  shape: "fluffy",
  color: "snow",
  scale: "medium",
  cursor: { x: 50, y: 45 },
  clouds: [],
  nextId: 1,
};

function placeCloud(state: CloudMakerState, x: number, y: number): CloudMakerState {
  const cloud: PlacedCloud = {
    id: state.nextId,
    shape: state.shape,
    color: state.color,
    scale: state.scale,
    x: clamp(x, 4, 96),
    y: clamp(y, 6, 94),
  };
  return { ...state, clouds: [...state.clouds, cloud].slice(-MAX_CLOUDS), nextId: state.nextId + 1 };
}

export function cloudMakerReducer(state: CloudMakerState, action: CloudMakerAction): CloudMakerState {
  switch (action.type) {
    case "shape":
      return CLOUD_SHAPES.some((s) => s.id === action.shape) ? { ...state, shape: action.shape } : state;
    case "color":
      return CLOUD_COLORS.some((c) => c.id === action.color) ? { ...state, color: action.color } : state;
    case "scale":
      return CLOUD_SCALES.some((s) => s.id === action.scale) ? { ...state, scale: action.scale } : state;
    case "place":
      if (!Number.isFinite(action.x) || !Number.isFinite(action.y)) return state;
      return placeCloud(state, action.x, action.y);
    case "placeAtCursor":
      return placeCloud(state, state.cursor.x, state.cursor.y);
    case "moveCursor":
      return { ...state, cursor: { x: clamp(state.cursor.x + action.dx, 4, 96), y: clamp(state.cursor.y + action.dy, 6, 94) } };
    case "undo":
      return { ...state, clouds: state.clouds.slice(0, -1) };
    case "clear":
      return { ...state, clouds: [] };
  }
}

// ── Sky Route Planner ───────────────────────────────────────────────────
export type IslandId = "waterfall" | "windmill" | "blossom" | "lantern" | "rainbow" | "castle";
export type RouteKind = "safe" | "broken" | "windy";

export interface Island {
  id: IslandId;
  name: string;
  /** Map position, percent. */
  x: number;
  y: number;
}

export interface SkyRoute {
  from: IslandId;
  to: IslandId;
  kind: RouteKind;
}

export const ISLANDS: Island[] = [
  { id: "waterfall", name: "Waterfall Cliff", x: 12, y: 66 },
  { id: "windmill", name: "Windmill Isle", x: 32, y: 28 },
  { id: "blossom", name: "Blossom Isle", x: 40, y: 74 },
  { id: "lantern", name: "Lantern Village", x: 60, y: 46 },
  { id: "rainbow", name: "Rainbow Falls", x: 70, y: 82 },
  { id: "castle", name: "Cloud Castle", x: 88, y: 22 },
];

/** Every connection on the map. Routes work both ways. */
export const SKY_ROUTES: SkyRoute[] = [
  { from: "waterfall", to: "windmill", kind: "safe" },
  { from: "waterfall", to: "blossom", kind: "safe" },
  { from: "windmill", to: "lantern", kind: "safe" },
  { from: "windmill", to: "castle", kind: "windy" },
  { from: "blossom", to: "lantern", kind: "broken" },
  { from: "blossom", to: "rainbow", kind: "safe" },
  { from: "lantern", to: "castle", kind: "safe" },
  { from: "lantern", to: "rainbow", kind: "safe" },
  { from: "rainbow", to: "castle", kind: "broken" },
];

export function routeBetween(a: IslandId, b: IslandId): SkyRoute | undefined {
  return SKY_ROUTES.find((r) => (r.from === a && r.to === b) || (r.from === b && r.to === a));
}

export function routesFrom(id: IslandId): { to: IslandId; kind: RouteKind }[] {
  return SKY_ROUTES.flatMap((r) => (r.from === id ? [{ to: r.to, kind: r.kind }] : r.to === id ? [{ to: r.from, kind: r.kind }] : []));
}

/** Fewest safe hops between two islands (breadth-first), or null if unreachable. */
export function shortestSafeRoute(start: IslandId, goal: IslandId): IslandId[] | null {
  const previous = new Map<IslandId, IslandId | null>([[start, null]]);
  const queue: IslandId[] = [start];
  while (queue.length) {
    const here = queue.shift()!;
    if (here === goal) {
      const path: IslandId[] = [];
      for (let at: IslandId | null = goal; at !== null; at = previous.get(at) ?? null) path.unshift(at);
      return path;
    }
    for (const { to, kind } of routesFrom(here)) {
      if (kind === "safe" && !previous.has(to)) {
        previous.set(to, here);
        queue.push(to);
      }
    }
  }
  return null;
}

export type RouteFeedback =
  | "pick-start"
  | "pick-destination"
  | "same-island"
  | "plan"
  | "hopped"
  | "broken"
  | "windy"
  | "no-route"
  | "already-visited"
  | "arrived";

export interface RoutePlannerState {
  start: IslandId | null;
  destination: IslandId | null;
  /** Islands visited so far, beginning with the start. */
  path: IslandId[];
  feedback: RouteFeedback;
  /** The island involved in the last refused move, for the message. */
  tried: IslandId | null;
}

export type RoutePlannerAction = { type: "island"; id: IslandId } | { type: "undo" } | { type: "reset" };

export const initialRoutePlanner: RoutePlannerState = {
  start: null,
  destination: null,
  path: [],
  feedback: "pick-start",
  tried: null,
};

export function isArrived(state: RoutePlannerState): boolean {
  return state.destination !== null && state.path.at(-1) === state.destination;
}

export function routePlannerReducer(state: RoutePlannerState, action: RoutePlannerAction): RoutePlannerState {
  if (action.type === "reset") return initialRoutePlanner;
  if (action.type === "undo") {
    if (state.path.length > 1) return { ...state, path: state.path.slice(0, -1), feedback: "plan", tried: null };
    if (state.destination) return { ...state, destination: null, feedback: "pick-destination", tried: null };
    return initialRoutePlanner;
  }
  const id = action.id;
  if (!ISLANDS.some((i) => i.id === id)) return state;
  if (state.start === null) return { ...state, start: id, path: [id], feedback: "pick-destination", tried: null };
  if (state.destination === null) {
    if (id === state.start) return { ...state, feedback: "same-island", tried: id };
    return { ...state, destination: id, feedback: "plan", tried: null };
  }
  if (isArrived(state)) return state;
  const here = state.path.at(-1)!;
  const route = routeBetween(here, id);
  if (!route) return { ...state, feedback: "no-route", tried: id };
  if (route.kind === "broken") return { ...state, feedback: "broken", tried: id };
  if (route.kind === "windy") return { ...state, feedback: "windy", tried: id };
  if (state.path.includes(id)) return { ...state, feedback: "already-visited", tried: id };
  const path = [...state.path, id];
  return { ...state, path, feedback: id === state.destination ? "arrived" : "hopped", tried: null };
}

// ── Cloud Postcards ─────────────────────────────────────────────────────
export type PostcardDesign = "waterfall-cliffs" | "windmill-village" | "sunset-islands";
export type PostcardSticker = "smiley" | "rainbow" | "star" | "heart";

export const POSTCARD_DESIGNS: {
  id: PostcardDesign;
  title: string;
  /** Part of the floating-islands artwork to show: a focus point (percent) and zoom. */
  focus: { x: number; y: number };
  zoom: number;
  frame: string;
}[] = [
  { id: "waterfall-cliffs", title: "Waterfall Cliffs", focus: { x: 10, y: 35 }, zoom: 1.7, frame: "#7fb2e5" },
  { id: "windmill-village", title: "Windmill Village", focus: { x: 39, y: 32 }, zoom: 2.1, frame: "#f2b083" },
  { id: "sunset-islands", title: "Sunset Islands", focus: { x: 78, y: 42 }, zoom: 1.6, frame: "#e7c35a" },
];

/**
 * Source rectangle of an image (iw × ih) shown in a box (bw × bh) with
 * object-fit: cover, positioned at the focus point and zoomed around it —
 * the same crop the CSS preview shows, for drawing on a canvas.
 */
export function postcardCrop(
  iw: number,
  ih: number,
  bw: number,
  bh: number,
  focus: { x: number; y: number },
  zoom: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const scale = Math.max(bw / iw, bh / ih);
  const coverW = bw / scale;
  const coverH = bh / scale;
  const fx = focus.x / 100;
  const fy = focus.y / 100;
  const sx0 = (iw - coverW) * fx;
  const sy0 = (ih - coverH) * fy;
  const sw = coverW / zoom;
  const sh = coverH / zoom;
  return { sx: sx0 + fx * coverW - fx * sw, sy: sy0 + fy * coverH - fy * sh, sw, sh };
}

export const POSTCARD_STICKERS: { id: PostcardSticker; label: string }[] = [
  { id: "smiley", label: "Smiling cloud" },
  { id: "rainbow", label: "Rainbow cloud" },
  { id: "star", label: "Star cloud" },
  { id: "heart", label: "Heart cloud" },
];

export const MESSAGE_LIMIT = 120;

/**
 * Visitor text stays plain text: control characters are removed, runs of
 * whitespace collapse, and the length is capped. It is only ever rendered
 * as a React text node or drawn on a canvas — never as HTML.
 */
export function cleanPostcardMessage(raw: string): string {
  return raw
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .slice(0, MESSAGE_LIMIT);
}

export interface PostcardState {
  design: PostcardDesign;
  message: string;
  sticker: PostcardSticker;
}

export type PostcardAction =
  | { type: "design"; design: PostcardDesign }
  | { type: "message"; message: string }
  | { type: "sticker"; sticker: PostcardSticker }
  | { type: "reset" };

export const initialPostcard: PostcardState = {
  design: "waterfall-cliffs",
  message: "",
  sticker: "smiley",
};

export function postcardReducer(state: PostcardState, action: PostcardAction): PostcardState {
  switch (action.type) {
    case "design":
      return POSTCARD_DESIGNS.some((d) => d.id === action.design) ? { ...state, design: action.design } : state;
    case "message":
      return { ...state, message: cleanPostcardMessage(action.message) };
    case "sticker":
      return POSTCARD_STICKERS.some((s) => s.id === action.sticker) ? { ...state, sticker: action.sticker } : state;
    case "reset":
      return initialPostcard;
  }
}

/** Word-wraps text into lines no wider than `maxWidth` (as measured), at most `maxLines`. */
export function wrapLines(text: string, maxWidth: number, measure: (s: string) => number, maxLines = 4): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(" ").filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (measure(next) <= maxWidth || !line) line = next;
      else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  const trimmed = lines.filter((l, i) => l !== "" || i < lines.length - 1);
  if (trimmed.length <= maxLines) return trimmed;
  const kept = trimmed.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s*\S*$/, "")}…`;
  return kept;
}
