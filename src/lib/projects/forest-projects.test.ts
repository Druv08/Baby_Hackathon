import { describe, expect, it } from "vitest";

import { getFutureBySlug } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";
import { futurePathSchema } from "@/lib/validation";
import {
  FIELD_GUIDE,
  PLACES,
  bestRoute,
  canUse,
  deliveryReducer,
  describeSign,
  fieldGuideReducer,
  initialDelivery,
  initialFieldGuide,
  initialSign,
  isDelivered,
  pathBetween,
  reachableDestinations,
  signReducer,
  type DeliveryAction,
  type FieldGuideAction,
  type PlaceId,
} from "./forest-projects";

describe("Dream Delivery Map", () => {
  const run = (actions: DeliveryAction[]) => actions.reduce(deliveryReducer, initialDelivery);
  const go = (...to: PlaceId[]) => to.map((id) => ({ type: "go", to: id }) as const);

  it("has the six required landmarks", () => {
    expect(PLACES.map((p) => p.name)).toEqual(
      expect.arrayContaining(["Forest Entrance", "Riverside Trail", "Oak Cottage", "Mushroom Clearing", "Treetop Village", "Golden Bridge"]),
    );
  });

  it("gives each creature different valid routes", () => {
    expect(bestRoute("rabbit", "oak-cottage")).toEqual(["entrance", "riverside", "golden-bridge", "oak-cottage"]);
    expect(bestRoute("squirrel", "oak-cottage")).toEqual(["entrance", "mushroom", "oak-cottage"]);
    expect(bestRoute("songbird", "oak-cottage")).toEqual(["entrance", "treetop-village", "oak-cottage"]);
    // The rabbit can't reach the Treetop Village at all.
    expect(reachableDestinations("rabbit")).not.toContain("treetop-village");
    expect(reachableDestinations("songbird")).toContain("treetop-village");
  });

  it("refuses the shorter fallen-log route for the rabbit, with the reason", () => {
    expect(pathBetween("mushroom", "oak-cottage")?.kind).toBe("log");
    expect(canUse("rabbit", "log")).toBe(false);
    const s = run([{ type: "traveler", traveler: "rabbit" }, { type: "destination", place: "oak-cottage" }, ...go("mushroom", "oak-cottage")]);
    expect(s.feedback).toBe("unsuitable");
    expect(s.tried).toEqual({ to: "oak-cottage", kind: "log" });
    expect(s.route).toEqual(["entrance", "mushroom"]);
  });

  it("delivers along a suitable route, and resets", () => {
    const s = run([{ type: "traveler", traveler: "rabbit" }, { type: "destination", place: "oak-cottage" }, ...go("riverside", "golden-bridge", "oak-cottage")]);
    expect(isDelivered(s)).toBe(true);
    expect(s.feedback).toBe("delivered");
    expect(deliveryReducer(s, { type: "go", to: "riverside" })).toBe(s);
    expect(deliveryReducer(s, { type: "reset" })).toEqual(initialDelivery);
  });

  it("won't pick an unreachable destination, and steps back", () => {
    const r = run([{ type: "traveler", traveler: "rabbit" }]);
    expect(deliveryReducer(r, { type: "destination", place: "treetop-village" })).toBe(r);
    const s = run([{ type: "traveler", traveler: "songbird" }, { type: "destination", place: "golden-bridge" }, ...go("treetop-village")]);
    expect(deliveryReducer(s, { type: "back" }).route).toEqual(["entrance"]);
  });
});

describe("Forest Friends Field Guide", () => {
  const run = (actions: FieldGuideAction[]) => actions.reduce(fieldGuideReducer, initialFieldGuide);

  it("has the rabbit, squirrel, hedgehog and songbird entries", () => {
    expect(FIELD_GUIDE.map((f) => f.name)).toEqual(["Little Rabbit", "Curious Squirrel", "Sleepy Hedgehog", "Singing Songbird"]);
  });

  it("opens, turns pages within bounds", () => {
    expect(run([{ type: "next" }]).book.page).toBe(0); // closed books don't turn
    const s = run([{ type: "open" }, { type: "next" }, { type: "next" }, { type: "next" }, { type: "next" }]);
    expect(s.book).toEqual({ open: true, page: 3 });
    expect(fieldGuideReducer(s, { type: "goto", page: 1 }).book.page).toBe(1);
  });

  it("collects an entry only after revealing its habitat, once each", () => {
    let s = run([{ type: "open" }, { type: "collect" }]);
    expect(s.collected).toEqual([]);
    s = run([{ type: "open" }, { type: "reveal" }, { type: "collect" }, { type: "collect" }]);
    expect(s.collected).toEqual(["rabbit"]);
  });

  it("tracks all four discoveries and resets", () => {
    const all = run([{ type: "open" }, ...FIELD_GUIDE.flatMap((_, i) => [{ type: "goto", page: i }, { type: "reveal" }, { type: "collect" }] as FieldGuideAction[])]);
    expect(all.collected).toEqual(["rabbit", "squirrel", "hedgehog", "songbird"]);
    expect(fieldGuideReducer(all, { type: "reset" })).toEqual(initialFieldGuide);
  });
});

describe("Whispering Signpost Workshop", () => {
  it("changes shape, destination, decoration and direction, and describes the sign", () => {
    let s = signReducer(initialSign, { type: "shape", value: "leaf" });
    s = signReducer(s, { type: "destination", value: "golden-bridge" });
    s = signReducer(s, { type: "decoration", value: "mushrooms" });
    s = signReducer(s, { type: "direction", value: "left" });
    expect(s).toEqual({ shape: "leaf", destination: "golden-bridge", decoration: "mushrooms", direction: "left" });
    expect(describeSign(s)).toBe("A leaf-shaped sign with tiny mushrooms, pointing to the left to Golden Bridge.");
    expect(describeSign({ ...s, direction: "straight" })).toMatch(/pointing straight ahead/);
  });

  it("ignores unknown options and resets", () => {
    // @ts-expect-error — not a real shape
    expect(signReducer(initialSign, { type: "shape", value: "square" })).toBe(initialSign);
    expect(signReducer({ ...initialSign, shape: "rounded" }, { type: "reset" })).toEqual(initialSign);
  });
});

describe("Forest portfolio readiness", () => {
  it("marks all three projects live and playable, and the portfolio ready", () => {
    const forest = getFutureBySlug("forest")!;
    expect(forest.portfolioStatus).toBe("ready");
    expect(forest.projects.every((p) => p.status === "ready" && p.implementation === "live" && p.interactionId === p.id)).toBe(true);
    const view = loadFutureView("forest")!;
    expect(view.readiness.complete).toBe(true);
    expect(view.portfolio.projects.map((p) => [p.id, p.playable, p.verifiedImage])).toEqual([
      ["dream-delivery-map", true, "/projects/forest/dream-delivery-map.png"],
      ["forest-friends-field-guide", true, "/projects/forest/forest-friends-field-guide.png"],
      ["whispering-signpost-workshop", true, undefined],
    ]);
    expect(futurePathSchema.safeParse(forest).success).toBe(true);
  });
});
