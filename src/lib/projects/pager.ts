/**
 * Shared "open a book and turn its pages" state, used by Blossom's
 * Bloom Book and Star's Dream Atlas.
 */

export interface PagerState {
  open: boolean;
  page: number;
}

export type PagerAction = { type: "open" } | { type: "close" } | { type: "next" } | { type: "prev" } | { type: "goto"; page: number };

export const initialPagerState: PagerState = { open: false, page: 0 };

export function pagerReducer(state: PagerState, action: PagerAction, pageCount: number): PagerState {
  const last = pageCount - 1;
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
