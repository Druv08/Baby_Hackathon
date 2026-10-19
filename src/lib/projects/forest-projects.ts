/**
 * Pure logic for Forest Maria's three creations: Dream Delivery Map, Forest
 * Friends Field Guide and Whispering Signpost Workshop.
 */
import { initialPagerState, pagerReducer, type PagerAction, type PagerState } from "./pager";

// ── Dream Delivery Map ──────────────────────────────────────────────────
export type Traveler = "rabbit" | "squirrel" | "songbird";
export type PathKind = "ground" | "log" | "branch" | "air";
export type PlaceId = "entrance" | "riverside" | "mushroom" | "golden-bridge" | "oak-cottage" | "treetop-village";

export const TRAVELERS: { id: Traveler; name: string; likes: string; uses: PathKind[] }[] = [
  { id: "rabbit", name: "Rabbit", likes: "quiet trails, gentle bridges and ground-level paths", uses: ["ground"] },
  { id: "squirrel", name: "Squirrel", likes: "tree branches, ground paths and even wobbly logs", uses: ["ground", "branch", "log"] },
  { id: "songbird", name: "Songbird", likes: "flying between safe treetop landmarks", uses: ["air", "branch"] },
];

export const PLACES: { id: PlaceId; name: string; x: number; y: number }[] = [
  { id: "entrance", name: "Forest Entrance", x: 10, y: 78 },
  { id: "riverside", name: "Riverside Trail", x: 34, y: 86 },
  { id: "mushroom", name: "Mushroom Clearing", x: 36, y: 46 },
  { id: "golden-bridge", name: "Golden Bridge", x: 62, y: 76 },
  { id: "oak-cottage", name: "Oak Cottage", x: 88, y: 60 },
  { id: "treetop-village", name: "Treetop Village", x: 66, y: 16 },
];

export const DELIVERY_PATHS: { a: PlaceId; b: PlaceId; kind: PathKind }[] = [
  { a: "entrance", b: "riverside", kind: "ground" },
  { a: "entrance", b: "mushroom", kind: "ground" },
  { a: "riverside", b: "golden-bridge", kind: "ground" },
  { a: "golden-bridge", b: "oak-cottage", kind: "ground" },
  // The shortest way to the cottage is a wobbly fallen log over the stream.
  { a: "mushroom", b: "oak-cottage", kind: "log" },
  { a: "mushroom", b: "treetop-village", kind: "branch" },
  { a: "treetop-village", b: "oak-cottage", kind: "branch" },
  { a: "entrance", b: "treetop-village", kind: "air" },
  { a: "golden-bridge", b: "treetop-village", kind: "air" },
];

export const KIND_LABEL: Record<PathKind, string> = {
  ground: "ground path",
  log: "fallen log",
  branch: "tree branches",
  air: "treetop flight",
};

export const DELIVERY_START: PlaceId = "entrance";

export function pathBetween(a: PlaceId, b: PlaceId) {
  return DELIVERY_PATHS.find((p) => (p.a === a && p.b === b) || (p.a === b && p.b === a));
}

export function pathsFrom(id: PlaceId) {
  return DELIVERY_PATHS.flatMap((p) => (p.a === id ? [{ to: p.b, kind: p.kind }] : p.b === id ? [{ to: p.a, kind: p.kind }] : []));
}

export function canUse(traveler: Traveler, kind: PathKind): boolean {
  return TRAVELERS.find((t) => t.id === traveler)!.uses.includes(kind);
}

/** Fewest suitable hops from the entrance to a place for this traveler, or null. */
export function bestRoute(traveler: Traveler, goal: PlaceId): PlaceId[] | null {
  const previous = new Map<PlaceId, PlaceId | null>([[DELIVERY_START, null]]);
  const queue: PlaceId[] = [DELIVERY_START];
  while (queue.length) {
    const here = queue.shift()!;
    if (here === goal) {
      const route: PlaceId[] = [];
      for (let at: PlaceId | null = goal; at !== null; at = previous.get(at) ?? null) route.unshift(at);
      return route;
    }
    for (const { to, kind } of pathsFrom(here)) {
      if (canUse(traveler, kind) && !previous.has(to)) {
        previous.set(to, here);
        queue.push(to);
      }
    }
  }
  return null;
}

/** Destinations this traveler can actually reach. */
export function reachableDestinations(traveler: Traveler): PlaceId[] {
  return PLACES.map((p) => p.id).filter((id) => id !== DELIVERY_START && bestRoute(traveler, id) !== null);
}

export type DeliveryFeedback = "pick-traveler" | "pick-destination" | "plan" | "moved" | "unsuitable" | "not-connected" | "visited" | "delivered";

export interface DeliveryState {
  traveler: Traveler | null;
  destination: PlaceId | null;
  route: PlaceId[];
  feedback: DeliveryFeedback;
  tried: { to: PlaceId; kind?: PathKind } | null;
}

export type DeliveryAction =
  | { type: "traveler"; traveler: Traveler }
  | { type: "destination"; place: PlaceId }
  | { type: "go"; to: PlaceId }
  | { type: "back" }
  | { type: "reset" };

export const initialDelivery: DeliveryState = { traveler: null, destination: null, route: [], feedback: "pick-traveler", tried: null };

export const isDelivered = (s: DeliveryState) => s.destination !== null && s.route.at(-1) === s.destination;

export function deliveryReducer(state: DeliveryState, action: DeliveryAction): DeliveryState {
  switch (action.type) {
    case "reset":
      return initialDelivery;
    case "traveler":
      if (!TRAVELERS.some((t) => t.id === action.traveler)) return state;
      return { traveler: action.traveler, destination: null, route: [], feedback: "pick-destination", tried: null };
    case "destination":
      if (state.traveler === null || !reachableDestinations(state.traveler).includes(action.place)) return state;
      return { ...state, destination: action.place, route: [DELIVERY_START], feedback: "plan", tried: null };
    case "back":
      if (state.route.length < 2 || isDelivered(state)) return state;
      return { ...state, route: state.route.slice(0, -1), feedback: "moved", tried: null };
    case "go": {
      if (state.traveler === null || state.destination === null || isDelivered(state)) return state;
      const here = state.route.at(-1)!;
      const path = pathBetween(here, action.to);
      if (!path) return { ...state, feedback: "not-connected", tried: { to: action.to } };
      if (!canUse(state.traveler, path.kind)) return { ...state, feedback: "unsuitable", tried: { to: action.to, kind: path.kind } };
      if (state.route.includes(action.to)) return { ...state, feedback: "visited", tried: { to: action.to } };
      const route = [...state.route, action.to];
      return { ...state, route, feedback: action.to === state.destination ? "delivered" : "moved", tried: null };
    }
  }
}

// ── Forest Friends Field Guide ──────────────────────────────────────────
export type FriendId = "rabbit" | "squirrel" | "hedgehog" | "songbird";

export const FIELD_GUIDE: { id: FriendId; name: string; habitat: string; story: string; route: string; icon: string }[] = [
  {
    id: "rabbit",
    name: "Little Rabbit",
    habitat: "Quiet woodland trails near oak trees.",
    story: "A shy rabbit who learns that every journey becomes easier with a kind friend.",
    route: "Gentle ground-level paths.",
    icon: "🐇",
  },
  {
    id: "squirrel",
    name: "Curious Squirrel",
    habitat: "Tall trees and connected branches.",
    story: "An energetic little explorer who loves discovering hidden treetop shortcuts.",
    route: "Woodland branches and tree bridges.",
    icon: "🐿️",
  },
  {
    id: "hedgehog",
    name: "Sleepy Hedgehog",
    habitat: "Mossy woodland floors and quiet bushes.",
    story: "A gentle forest friend who prefers peaceful places and unhurried journeys.",
    route: "Calm, sheltered paths.",
    icon: "🦔",
  },
  {
    id: "songbird",
    name: "Singing Songbird",
    habitat: "Flowering trees and high branches.",
    story: "A cheerful little bird who helps forest travelers by singing near important landmarks.",
    route: "Safe treetop stops.",
    icon: "🐦",
  },
];

export interface FieldGuideState {
  book: PagerState;
  /** Entries whose habitat and route have been revealed. */
  revealed: FriendId[];
  /** Entries added to the discovery collection. */
  collected: FriendId[];
}

export type FieldGuideAction = PagerAction | { type: "reveal" } | { type: "collect" } | { type: "reset" };

export const initialFieldGuide: FieldGuideState = { book: initialPagerState, revealed: [], collected: [] };

export function fieldGuideReducer(state: FieldGuideState, action: FieldGuideAction): FieldGuideState {
  const current = FIELD_GUIDE[state.book.page]?.id;
  switch (action.type) {
    case "reset":
      return initialFieldGuide;
    case "reveal":
      if (!state.book.open || state.revealed.includes(current)) return state;
      return { ...state, revealed: [...state.revealed, current] };
    case "collect":
      // An entry can be collected once its habitat has been discovered.
      if (!state.book.open || !state.revealed.includes(current) || state.collected.includes(current)) return state;
      return { ...state, collected: FIELD_GUIDE.map((f) => f.id).filter((id) => id === current || state.collected.includes(id)) };
    default:
      return { ...state, book: pagerReducer(state.book, action, FIELD_GUIDE.length) };
  }
}

// ── Whispering Signpost Workshop ────────────────────────────────────────
export type SignShape = "arrow" | "rounded" | "leaf";
export type SignDestination = "rabbit-cottage" | "mushroom-clearing" | "golden-bridge" | "treetop-village";
export type SignDecoration = "flowers" | "leaves" | "stars" | "mushrooms";
export type SignDirection = "left" | "right" | "straight";

export const SIGN_SHAPES: { id: SignShape; label: string }[] = [
  { id: "arrow", label: "Classic Wooden Arrow" },
  { id: "rounded", label: "Rounded Forest Sign" },
  { id: "leaf", label: "Leaf-Shaped Sign" },
];
export const SIGN_DESTINATIONS: { id: SignDestination; label: string }[] = [
  { id: "rabbit-cottage", label: "Rabbit Cottage" },
  { id: "mushroom-clearing", label: "Mushroom Clearing" },
  { id: "golden-bridge", label: "Golden Bridge" },
  { id: "treetop-village", label: "Treetop Village" },
];
export const SIGN_DECORATIONS: { id: SignDecoration; label: string }[] = [
  { id: "flowers", label: "Pink Flowers" },
  { id: "leaves", label: "Green Leaves" },
  { id: "stars", label: "Golden Stars" },
  { id: "mushrooms", label: "Tiny Mushrooms" },
];
export const SIGN_DIRECTIONS: { id: SignDirection; label: string }[] = [
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
  { id: "straight", label: "Straight Ahead" },
];

export interface SignState {
  shape: SignShape;
  destination: SignDestination;
  decoration: SignDecoration;
  direction: SignDirection;
}

export type SignAction =
  | { type: "shape"; value: SignShape }
  | { type: "destination"; value: SignDestination }
  | { type: "decoration"; value: SignDecoration }
  | { type: "direction"; value: SignDirection }
  | { type: "reset" };

export const initialSign: SignState = { shape: "arrow", destination: "rabbit-cottage", decoration: "flowers", direction: "right" };

export function signReducer(state: SignState, action: SignAction): SignState {
  switch (action.type) {
    case "reset":
      return initialSign;
    case "shape":
      return SIGN_SHAPES.some((s) => s.id === action.value) ? { ...state, shape: action.value } : state;
    case "destination":
      return SIGN_DESTINATIONS.some((s) => s.id === action.value) ? { ...state, destination: action.value } : state;
    case "decoration":
      return SIGN_DECORATIONS.some((s) => s.id === action.value) ? { ...state, decoration: action.value } : state;
    case "direction":
      return SIGN_DIRECTIONS.some((s) => s.id === action.value) ? { ...state, direction: action.value } : state;
  }
}

/** A friendly sentence describing the finished sign. */
export function describeSign(s: SignState): string {
  const label = (list: { id: string; label: string }[], id: string) => list.find((x) => x.id === id)!.label;
  const dir = s.direction === "straight" ? "straight ahead" : `to the ${s.direction}`;
  return `A ${label(SIGN_SHAPES, s.shape).toLowerCase()} with ${label(SIGN_DECORATIONS, s.decoration).toLowerCase()}, pointing ${dir} to ${label(SIGN_DESTINATIONS, s.destination)}.`;
}
