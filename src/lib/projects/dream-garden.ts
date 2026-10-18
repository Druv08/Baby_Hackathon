/**
 * Dream Garden — plant a seed and grow it into a flower, one step at a time:
 * choose → plant → water → (grows into a sprout) → sunshine → bloom → celebrate.
 * Pure reducer: actions that don't fit the current stage are ignored.
 */

export interface GardenSeed {
  id: string;
  name: string;
  petal: string;
  center: string;
}

export const GARDEN_SEEDS: readonly GardenSeed[] = [
  { id: "sunblush-daisy", name: "Sunblush Daisy", petal: "#ffd27a", center: "#f28c3b" },
  { id: "moonbell", name: "Moonbell", petal: "#c9b3f5", center: "#fff3c4" },
  { id: "heartseed-bloom", name: "Heartseed Bloom", petal: "#ff8fb8", center: "#ffe7a3" },
];

export type GardenStage = "choose" | "chosen" | "planted" | "watered" | "sprout" | "bloom" | "celebrate";

export interface GardenState {
  stage: GardenStage;
  seedId: string | null;
  /** Flowers grown so far this visit (kept across restarts). */
  grown: string[];
}

export type GardenAction =
  | { type: "choose"; seedId: string }
  | { type: "plant" }
  | { type: "water" }
  | { type: "grow" }
  | { type: "sunshine" }
  | { type: "celebrate" }
  | { type: "restart" };

export const initialGardenState: GardenState = { stage: "choose", seedId: null, grown: [] };

export function gardenReducer(state: GardenState, action: GardenAction): GardenState {
  switch (action.type) {
    case "choose":
      if ((state.stage !== "choose" && state.stage !== "chosen") || !GARDEN_SEEDS.some((s) => s.id === action.seedId)) {
        return state;
      }
      return { ...state, stage: "chosen", seedId: action.seedId };
    case "plant":
      return state.stage === "chosen" ? { ...state, stage: "planted" } : state;
    case "water":
      return state.stage === "planted" ? { ...state, stage: "watered" } : state;
    case "grow":
      return state.stage === "watered" ? { ...state, stage: "sprout" } : state;
    case "sunshine":
      return state.stage === "sprout" ? { ...state, stage: "bloom" } : state;
    case "celebrate":
      return state.stage === "bloom" && state.seedId
        ? { ...state, stage: "celebrate", grown: [...state.grown, state.seedId] }
        : state;
    case "restart":
      return { ...initialGardenState, grown: state.grown };
  }
}

/** The step number (1–6) shown to the visitor. */
export function gardenStep(stage: GardenStage): number {
  return { choose: 1, chosen: 2, planted: 3, watered: 4, sprout: 5, bloom: 6, celebrate: 6 }[stage];
}

export const GARDEN_STEP_LABELS = ["Choose a seed", "Plant it", "Water it", "Watch it grow", "Help it bloom", "Celebrate!"];
