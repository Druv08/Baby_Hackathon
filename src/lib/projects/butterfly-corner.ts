/**
 * Butterfly Corner — plant a flower and see which magical butterfly visits.
 * The butterflies are fantasy creatures from Maria's world, not real species.
 */

export interface SanctuaryButterfly {
  id: string;
  name: string;
  fact: string;
  wing: string;
  accent: string;
}

export interface SanctuaryFlower {
  id: string;
  name: string;
  petal: string;
  attracts: string;
}

export const BUTTERFLIES: readonly SanctuaryButterfly[] = [
  {
    id: "golden-flutter",
    name: "Golden Flutter",
    fact: "Golden Flutters glow softly at sunset, so lost travelers can follow them home.",
    wing: "#ffd27a",
    accent: "#f2a33b",
  },
  {
    id: "pink-petalwing",
    name: "Pink Petalwing",
    fact: "A Pink Petalwing’s wings look exactly like blossom petals — it hides in plain sight among the flowers.",
    wing: "#ff9fc3",
    accent: "#d94f86",
  },
  {
    id: "skywing",
    name: "Skywing",
    fact: "Skywings fly higher than the clouds and bring a drop of morning dew back to every flower they visit.",
    wing: "#9fd4ff",
    accent: "#4b8fd1",
  },
];

export const SANCTUARY_FLOWERS: readonly SanctuaryFlower[] = [
  { id: "sunbell", name: "Golden Sunbell", petal: "#ffd27a", attracts: "golden-flutter" },
  { id: "rosy-heartseed", name: "Rosy Heartseed", petal: "#ff8fb8", attracts: "pink-petalwing" },
  { id: "sky-blossom", name: "Sky Blossom", petal: "#a9d8ff", attracts: "skywing" },
];

export interface SanctuaryState {
  /** Flower currently planted, if any. */
  flowerId: string | null;
  /** Butterfly currently visiting. */
  visitorId: string | null;
  /** Every butterfly discovered this visit, in discovery order. */
  collection: string[];
}

export type SanctuaryAction = { type: "plant"; flowerId: string } | { type: "clear" } | { type: "reset" };

export const initialSanctuaryState: SanctuaryState = { flowerId: null, visitorId: null, collection: [] };

export function sanctuaryReducer(state: SanctuaryState, action: SanctuaryAction): SanctuaryState {
  switch (action.type) {
    case "plant": {
      const flower = SANCTUARY_FLOWERS.find((f) => f.id === action.flowerId);
      if (!flower) return state;
      const collection = state.collection.includes(flower.attracts)
        ? state.collection
        : [...state.collection, flower.attracts];
      return { flowerId: flower.id, visitorId: flower.attracts, collection };
    }
    case "clear":
      return { ...state, flowerId: null, visitorId: null };
    case "reset":
      return initialSanctuaryState;
  }
}

export const butterflyById = (id: string | null) => BUTTERFLIES.find((b) => b.id === id);
