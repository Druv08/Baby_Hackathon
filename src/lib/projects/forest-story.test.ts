import { describe, expect, it } from "vitest";

import {
  RABBIT_ROUTES,
  SAFE_ROUTE,
  SIGNPOST_MESSAGES,
  initialRouteChoice,
  initialSafeRoute,
  initialShiftingMap,
  isRouteSolved,
  routeChoiceReducer,
  safeRouteReducer,
  shiftingMapReducer,
  signpostFlash,
  signpostLevel,
  visiblePaths,
  type LandmarkId,
} from "./forest-story";

describe("Scene 1: turning signpost", () => {
  it("turns to another direction each tap without revealing the route home", () => {
    expect(signpostLevel(0)).toBe(0);
    expect(signpostLevel(99)).toBe(SIGNPOST_MESSAGES.length - 1);
    expect(signpostFlash(1)).not.toBe(signpostFlash(2));
    expect(SIGNPOST_MESSAGES.join(" ")).toMatch(/keep changing/);
  });
});

describe("Scene 2: shifting map", () => {
  it("stays dark until the leaf piece is placed, then glows and keeps rearranging", () => {
    expect(visiblePaths(initialShiftingMap)).toEqual([]);
    expect(shiftingMapReducer(initialShiftingMap, { type: "watch" })).toBe(initialShiftingMap);
    const glowing = shiftingMapReducer(initialShiftingMap, { type: "leaf" });
    expect(visiblePaths(glowing)).toEqual([0, 1, 2]);
    const shifted = shiftingMapReducer(glowing, { type: "watch" });
    const again = shiftingMapReducer(shifted, { type: "watch" });
    // One path disappears and another appears each time.
    expect(visiblePaths(shifted)).not.toEqual(visiblePaths(glowing));
    expect(visiblePaths(again)).not.toEqual(visiblePaths(shifted));
  });
});

describe("Scene 3: route choice", () => {
  it("has three routes, and only the quiet riverside trail suits the rabbit", () => {
    expect(RABBIT_ROUTES.map((r) => r.id)).toEqual(["log-bridge", "riverside", "treetops"]);
    expect(RABBIT_ROUTES.filter((r) => r.suits).map((r) => r.id)).toEqual(["riverside"]);
  });

  it("gives gentle feedback on unsuitable routes, then completes on the riverside trail", () => {
    let s = routeChoiceReducer(initialRouteChoice, { type: "choose", id: "log-bridge" });
    expect(isRouteSolved(s)).toBe(false);
    s = routeChoiceReducer(s, { type: "choose", id: "treetops" });
    s = routeChoiceReducer(s, { type: "choose", id: "riverside" });
    expect(isRouteSolved(s)).toBe(true);
    expect(s.tried).toEqual(["log-bridge", "treetops", "riverside"]);
    expect(routeChoiceReducer(s, { type: "choose", id: "log-bridge" })).toBe(s);
  });
});

describe("Scene 4: safe route map", () => {
  const tap = (...ids: LandmarkId[]) => ids.reduce((s, id) => safeRouteReducer(s, { type: "tap", id }), initialSafeRoute);

  it("connects the entrance, riverside trail and cottage in order", () => {
    const s = tap(...SAFE_ROUTE);
    expect(s).toMatchObject({ route: ["entrance", "riverside", "cottage"], last: "done" });
  });

  it("refuses unsafe landmarks and out-of-order steps gently", () => {
    expect(tap("log")).toMatchObject({ last: "unsafe", route: [] });
    expect(tap("entrance", "treetop")).toMatchObject({ last: "unsafe", route: ["entrance"] });
    expect(tap("cottage")).toMatchObject({ last: "order", route: [] });
  });

  it("stays complete until reset", () => {
    const s = tap(...SAFE_ROUTE);
    expect(safeRouteReducer(s, { type: "tap", id: "entrance" })).toBe(s);
    expect(safeRouteReducer(s, { type: "reset" })).toEqual(initialSafeRoute);
  });
});
