/**
 * Pure logic for Luna Maria's creations. The Moonlit Memory Book has no
 * logic of its own here: it reuses the shared Memory Book API client and
 * validation (`src/lib/api-client.ts`, `src/lib/memories/validation.ts`).
 */
import { MEMORIES, matchReducerFor, type KeepsakeId, type MemoryId } from "./luna-story";

// ── Memory Lantern Studio ───────────────────────────────────────────────
export type LanternShape = "classic" | "star" | "crescent";
export type LanternLight = "golden" | "pink" | "lavender" | "blue";
export type LanternSymbol = "heart" | "flower" | "star" | "moon";

export const LANTERN_SHAPES: { id: LanternShape; label: string }[] = [
  { id: "classic", label: "Classic Lantern" },
  { id: "star", label: "Star Lantern" },
  { id: "crescent", label: "Crescent Lantern" },
];
export const LANTERN_LIGHTS: { id: LanternLight; label: string; glow: string; deep: string }[] = [
  { id: "golden", label: "Golden", glow: "#ffe08a", deep: "#d9a441" },
  { id: "pink", label: "Soft Pink", glow: "#ffc8de", deep: "#e07aa6" },
  { id: "lavender", label: "Lavender", glow: "#dccbff", deep: "#9b7be0" },
  { id: "blue", label: "Moonlight Blue", glow: "#c8e4ff", deep: "#5f95d6" },
];
export const LANTERN_SYMBOLS: { id: LanternSymbol; label: string }[] = [
  { id: "heart", label: "Heart" },
  { id: "flower", label: "Flower" },
  { id: "star", label: "Star" },
  { id: "moon", label: "Moon" },
];

export const LANTERN_TEXT_MAX = 60;

export interface LanternDesign {
  shape: LanternShape;
  light: LanternLight;
  symbol: LanternSymbol;
  text: string;
}

export const defaultLantern: LanternDesign = { shape: "classic", light: "golden", symbol: "heart", text: "" };

/** Plain, short text: control characters removed, whitespace collapsed. */
export function cleanLanternText(raw: string): string {
  // Whitespace (tabs, newlines) becomes one space first; other control
  // characters are then dropped.
  return raw
    .replace(/\s+/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .slice(0, LANTERN_TEXT_MAX);
}

export type LanternAction =
  | { type: "shape"; value: LanternShape }
  | { type: "light"; value: LanternLight }
  | { type: "symbol"; value: LanternSymbol }
  | { type: "text"; value: string }
  | { type: "load"; design: LanternDesign }
  | { type: "reset" };

export function lanternReducer(state: LanternDesign, action: LanternAction): LanternDesign {
  switch (action.type) {
    case "reset":
      return defaultLantern;
    case "shape":
      return LANTERN_SHAPES.some((s) => s.id === action.value) ? { ...state, shape: action.value } : state;
    case "light":
      return LANTERN_LIGHTS.some((s) => s.id === action.value) ? { ...state, light: action.value } : state;
    case "symbol":
      return LANTERN_SYMBOLS.some((s) => s.id === action.value) ? { ...state, symbol: action.value } : state;
    case "text":
      return { ...state, text: cleanLanternText(action.value) };
    case "load":
      return parseLantern(action.design) ?? state;
  }
}

/** Accepts only a well-formed design (e.g. from local storage); anything else is null. */
export function parseLantern(value: unknown): LanternDesign | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (!LANTERN_SHAPES.some((s) => s.id === v.shape)) return null;
  if (!LANTERN_LIGHTS.some((s) => s.id === v.light)) return null;
  if (!LANTERN_SYMBOLS.some((s) => s.id === v.symbol)) return null;
  if (typeof v.text !== "string") return null;
  return { shape: v.shape as LanternShape, light: v.light as LanternLight, symbol: v.symbol as LanternSymbol, text: cleanLanternText(v.text) };
}

/**
 * The lantern draft is personal and stays in this browser only; it is never
 * sent to the Memory Book. One small key, read and written defensively.
 */
export const LANTERN_STORAGE_KEY = "maria:luna-lantern";

export interface DraftStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function saveLanternDraft(storage: DraftStorage | null, design: LanternDesign): boolean {
  if (!storage) return false;
  try {
    storage.setItem(LANTERN_STORAGE_KEY, JSON.stringify(design));
    return true;
  } catch {
    return false;
  }
}

export function loadLanternDraft(storage: DraftStorage | null): LanternDesign | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(LANTERN_STORAGE_KEY);
    return raw ? parseLantern(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function clearLanternDraft(storage: DraftStorage | null): void {
  try {
    storage?.removeItem(LANTERN_STORAGE_KEY);
  } catch {
    // Storage unavailable: nothing to clear.
  }
}

// ── The Keepsake Cabinet: four keepsakes, four memories ────────────────
export const CABINET_PAIRS: { keepsake: KeepsakeId; memory: MemoryId }[] = MEMORIES.map((m) => ({ keepsake: m.keepsake, memory: m.id }));

export const cabinetMatchReducer = matchReducerFor(CABINET_PAIRS);

export interface CabinetState {
  /** Compartments opened so far. */
  opened: KeepsakeId[];
}

export const initialCabinet: CabinetState = { opened: [] };

export function cabinetReducer(state: CabinetState, action: { type: "open"; id: KeepsakeId } | { type: "reset" }): CabinetState {
  if (action.type === "reset") return initialCabinet;
  if (!CABINET_PAIRS.some((p) => p.keepsake === action.id) || state.opened.includes(action.id)) return state;
  return { opened: [...state.opened, action.id] };
}
