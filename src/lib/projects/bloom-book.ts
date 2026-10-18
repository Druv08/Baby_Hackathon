/**
 * Bloom Book — Blossom Maria's flower journal. These are fictional
 * flowers from Maria's world.
 */

export interface BloomEntry {
  id: string;
  name: string;
  meaning: string;
  description: string;
  lesson: string;
  petal: string;
  center: string;
}

export const BLOOM_ENTRIES: readonly BloomEntry[] = [
  {
    id: "sunblush-daisy",
    name: "Sunblush Daisy",
    meaning: "Happiness",
    description:
      "Its petals turn a little pinker every time someone nearby laughs. I found the first one growing beside the garden gate.",
    lesson: "Happiness grows when you share it.",
    petal: "#ffd27a",
    center: "#f28c3b",
  },
  {
    id: "moonbell",
    name: "Moonbell",
    meaning: "Calm",
    description:
      "Moonbells only open at night and ring very softly when the wind blows. Sitting beside them makes worries feel smaller.",
    lesson: "It’s okay to slow down and rest.",
    petal: "#c9b3f5",
    center: "#fff3c4",
  },
  {
    id: "whisper-lily",
    name: "Whisper Lily",
    meaning: "Patience",
    description:
      "A Whisper Lily takes a whole season to bloom. Mine looked like nothing at all for weeks — then one morning, it opened.",
    lesson: "Beautiful things take time.",
    petal: "#f4f1ff",
    center: "#b9e3c6",
  },
  {
    id: "heartseed-bloom",
    name: "Heartseed Bloom",
    meaning: "Kindness",
    description:
      "Heartseeds only sprout when they are planted for someone else. Every one in my garden was planted for a friend.",
    lesson: "Small kindnesses can change a whole garden.",
    petal: "#ff8fb8",
    center: "#ffe7a3",
  },
];

export interface BookState {
  open: boolean;
  page: number;
}

export type BookAction = { type: "open" } | { type: "close" } | { type: "next" } | { type: "prev" } | { type: "goto"; page: number };

export const initialBookState: BookState = { open: false, page: 0 };

export function bookReducer(state: BookState, action: BookAction): BookState {
  const last = BLOOM_ENTRIES.length - 1;
  switch (action.type) {
    case "open":
      return { ...state, open: true };
    case "close":
      return { open: false, page: 0 };
    case "next":
      return state.open ? { ...state, page: Math.min(state.page + 1, last) } : state;
    case "prev":
      return state.open ? { ...state, page: Math.max(state.page - 1, 0) } : state;
    case "goto":
      return state.open && Number.isInteger(action.page) && action.page >= 0 && action.page <= last
        ? { ...state, page: action.page }
        : state;
  }
}
