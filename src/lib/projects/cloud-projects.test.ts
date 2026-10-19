import { describe, expect, it } from "vitest";

import {
  CLOUD_COLORS,
  CLOUD_SCALES,
  CLOUD_SHAPES,
  ISLANDS,
  MAX_CLOUDS,
  MESSAGE_LIMIT,
  POSTCARD_DESIGNS,
  POSTCARD_STICKERS,
  SKY_ROUTES,
  cleanPostcardMessage,
  cloudMakerReducer,
  initialCloudMaker,
  initialPostcard,
  initialRoutePlanner,
  isArrived,
  postcardCrop,
  postcardReducer,
  routeBetween,
  routePlannerReducer,
  routesFrom,
  shortestSafeRoute,
  wrapLines,
  type CloudMakerAction,
  type IslandId,
  type RoutePlannerAction,
} from "./cloud-projects";

describe("Cloud Maker", () => {
  const run = (actions: CloudMakerAction[]) => actions.reduce(cloudMakerReducer, initialCloudMaker);

  it("offers at least three shapes (fluffy, star, platform), colours and three sizes", () => {
    expect(CLOUD_SHAPES.map((s) => s.id)).toEqual(expect.arrayContaining(["fluffy", "star", "platform"]));
    expect(CLOUD_COLORS.length).toBeGreaterThanOrEqual(3);
    expect(CLOUD_SCALES.map((s) => s.id)).toEqual(["small", "medium", "large"]);
  });

  it("places clouds with the chosen shape, colour and size", () => {
    const s = run([
      { type: "shape", shape: "star" },
      { type: "color", color: "pink" },
      { type: "scale", scale: "large" },
      { type: "place", x: 30, y: 40 },
      { type: "shape", shape: "platform" },
      { type: "place", x: 70, y: 60 },
    ]);
    expect(s.clouds).toEqual([
      { id: 1, shape: "star", color: "pink", scale: "large", x: 30, y: 40 },
      { id: 2, shape: "platform", color: "pink", scale: "large", x: 70, y: 60 },
    ]);
  });

  it("keeps clouds inside the sky and ignores bad input", () => {
    const s = run([{ type: "place", x: -50, y: 500 }]);
    expect(s.clouds[0]).toMatchObject({ x: 4, y: 94 });
    expect(cloudMakerReducer(s, { type: "place", x: Number.NaN, y: 10 })).toBe(s);
    // @ts-expect-error — not a real shape
    expect(cloudMakerReducer(s, { type: "shape", shape: "square" })).toBe(s);
  });

  it("supports keyboard placement with a movable marker", () => {
    const s = run([
      { type: "moveCursor", dx: 10, dy: -5 },
      { type: "placeAtCursor" },
      { type: "moveCursor", dx: 500, dy: 500 },
    ]);
    expect(s.clouds[0]).toMatchObject({ x: 60, y: 40 });
    expect(s.cursor).toEqual({ x: 96, y: 94 });
  });

  it("undoes the last cloud and clears the whole sky", () => {
    const s = run([
      { type: "place", x: 10, y: 10 },
      { type: "place", x: 20, y: 20 },
      { type: "undo" },
    ]);
    expect(s.clouds.map((c) => c.id)).toEqual([1]);
    expect(cloudMakerReducer(s, { type: "clear" }).clouds).toEqual([]);
  });

  it("lets the oldest cloud drift away past the limit", () => {
    const s = run(Array.from({ length: MAX_CLOUDS + 3 }, (_, i) => ({ type: "place", x: i, y: 50 }) as const));
    expect(s.clouds).toHaveLength(MAX_CLOUDS);
    expect(s.clouds[0].id).toBe(4);
  });
});

describe("Sky Route Planner", () => {
  const run = (actions: RoutePlannerAction[], from = initialRoutePlanner) => actions.reduce(routePlannerReducer, from);
  const hop = (...ids: IslandId[]) => ids.map((id) => ({ type: "island", id }) as const);

  it("has at least five islands, with safe, broken and windy routes", () => {
    expect(ISLANDS.length).toBeGreaterThanOrEqual(5);
    expect(new Set(SKY_ROUTES.map((r) => r.kind))).toEqual(new Set(["safe", "broken", "windy"]));
    for (const r of SKY_ROUTES) expect(routeBetween(r.to, r.from)).toBe(r);
  });

  it("can reach every island from every other one over safe bridges", () => {
    for (const a of ISLANDS) for (const b of ISLANDS) expect(shortestSafeRoute(a.id, b.id)).not.toBeNull();
    expect(shortestSafeRoute("waterfall", "castle")).toEqual(["waterfall", "windmill", "lantern", "castle"]);
  });

  it("picks a start, then a different destination", () => {
    const s = run(hop("waterfall", "waterfall"));
    expect(s).toMatchObject({ start: "waterfall", destination: null, feedback: "same-island" });
    expect(run(hop("castle"), s)).toMatchObject({ destination: "castle", feedback: "plan" });
  });

  it("refuses broken bridges, headwinds and islands with no bridge", () => {
    const s = run(hop("waterfall", "castle", "windmill"));
    expect(run(hop("castle"), s)).toMatchObject({ feedback: "windy", path: ["waterfall", "windmill"] });
    const b = run(hop("blossom", "lantern"));
    expect(run(hop("lantern"), b)).toMatchObject({ feedback: "broken", path: ["blossom"] });
    expect(run(hop("castle"), b).feedback).toBe("no-route");
  });

  it("reaches the destination along safe bridges", () => {
    const s = run(hop("waterfall", "castle", "windmill", "lantern", "castle"));
    expect(isArrived(s)).toBe(true);
    expect(s.feedback).toBe("arrived");
    expect(s.path).toEqual(shortestSafeRoute("waterfall", "castle"));
    // Once arrived, more clicks do nothing until a reset.
    expect(run(hop("rainbow"), s)).toBe(s);
    expect(run([{ type: "reset" }], s)).toEqual(initialRoutePlanner);
  });

  it("won't revisit an island, and undo steps back", () => {
    const s = run(hop("waterfall", "castle", "blossom", "rainbow"));
    expect(run(hop("blossom"), s).feedback).toBe("already-visited");
    expect(run([{ type: "undo" }], s).path).toEqual(["waterfall", "blossom"]);
    expect(routesFrom("rainbow").map((r) => r.to).sort()).toEqual(["blossom", "castle", "lantern"]);
  });
});

describe("Cloud Postcards", () => {
  it("has three designs and several cloud stickers", () => {
    expect(POSTCARD_DESIGNS).toHaveLength(3);
    expect(POSTCARD_STICKERS.length).toBeGreaterThanOrEqual(3);
  });

  it("updates the design, message and sticker, and resets", () => {
    let s = postcardReducer(initialPostcard, { type: "design", design: "sunset-islands" });
    s = postcardReducer(s, { type: "message", message: "Hello from the sky!" });
    s = postcardReducer(s, { type: "sticker", sticker: "rainbow" });
    expect(s).toEqual({ design: "sunset-islands", message: "Hello from the sky!", sticker: "rainbow" });
    expect(postcardReducer(s, { type: "reset" })).toEqual(initialPostcard);
  });

  it("keeps messages as short plain text", () => {
    expect(cleanPostcardMessage("x".repeat(500))).toHaveLength(MESSAGE_LIMIT);
    expect(cleanPostcardMessage("hi\u0007 \t there\nfriend")).toBe("hi there\nfriend");
    // Markup is just text: it is never parsed as HTML.
    expect(cleanPostcardMessage("<img src=x onerror=alert(1)>")).toBe("<img src=x onerror=alert(1)>");
  });

  it("wraps message lines to fit the card, with an ellipsis when too long", () => {
    const measure = (s: string) => s.length;
    expect(wrapLines("one two three four", 9, measure)).toEqual(["one two", "three", "four"]);
    const long = wrapLines("aa bb cc dd ee ff gg hh", 5, measure, 2);
    expect(long).toHaveLength(2);
    expect(long[1].endsWith("…")).toBe(true);
  });
});

describe("postcard crop", () => {
  it("matches object-fit: cover at zoom 1 and zooms around the focus point", () => {
    // 1600×900 image in a 300×200 box: cover keeps full height (900) and 1350 of the width.
    const c1 = postcardCrop(1600, 900, 300, 200, { x: 50, y: 50 }, 1);
    expect(c1.sw).toBeCloseTo(1350);
    expect(c1.sh).toBeCloseTo(900);
    expect(c1.sx).toBeCloseTo(125);
    expect(c1.sy).toBeCloseTo(0);
    const c2 = postcardCrop(1600, 900, 300, 200, { x: 50, y: 50 }, 2);
    expect(c2.sw).toBeCloseTo(675);
    // Still centred on the same point of the image.
    expect(c2.sx + c2.sw / 2).toBeCloseTo(c1.sx + c1.sw / 2);
    expect(c2.sy + c2.sh / 2).toBeCloseTo(450);
  });

  it("keeps every design's crop inside the artwork", () => {
    for (const d of POSTCARD_DESIGNS) {
      const c = postcardCrop(1672, 941, 1128, 728, d.focus, d.zoom);
      expect(c.sx).toBeGreaterThanOrEqual(0);
      expect(c.sy).toBeGreaterThanOrEqual(0);
      expect(c.sx + c.sw).toBeLessThanOrEqual(1672 + 1e-6);
      expect(c.sy + c.sh).toBeLessThanOrEqual(941 + 1e-6);
    }
  });
});
