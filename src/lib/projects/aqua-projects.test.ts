import { describe, expect, it } from "vitest";

import { getFutureBySlug } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";
import { futurePathSchema } from "@/lib/validation";
import {
  DEBRIS,
  FRAGMENTS,
  OCEAN_CREATURES,
  PASSAGE_ROUTES,
  PASSAGE_SPOTS,
  allDiscovered,
  coralGardenReducer,
  discoveryReducer,
  gardenStage,
  initialCoralGarden,
  initialDiscovery,
  initialPassage,
  passageReducer,
  safestRoute,
  turtleArrived,
  type CoralGardenAction,
  type DiscoveryAction,
  type SpotId,
} from "./aqua-projects";

describe("Ocean Discovery", () => {
  const run = (actions: DiscoveryAction[]) => actions.reduce(discoveryReducer, initialDiscovery);

  it("has the turtle, jellyfish, seahorse and manta ray", () => {
    expect(OCEAN_CREATURES.map((c) => c.name)).toEqual(["Baby Sea Turtle", "Glowing Jellyfish", "Seahorse", "Manta Ray"]);
  });

  it("collects selected creatures once each, in order, up to 4/4", () => {
    const s = run([
      { type: "select", id: "manta" },
      { type: "collect" },
      { type: "select", id: "turtle" },
      { type: "collect" },
      { type: "collect" },
    ]);
    expect(s.collected).toEqual(["turtle", "manta"]);
    const all = run(OCEAN_CREATURES.flatMap((c) => [{ type: "select", id: c.id }, { type: "collect" }] as DiscoveryAction[]));
    expect(allDiscovered(all)).toBe(true);
  });

  it("needs a selection to collect, and resets", () => {
    expect(run([{ type: "collect" }])).toBe(initialDiscovery);
    expect(run([{ type: "select", id: "seahorse" }, { type: "collect" }, { type: "reset" }])).toEqual(initialDiscovery);
  });
});

describe("Coral Care Garden", () => {
  const run = (actions: CoralGardenAction[], from = initialCoralGarden) => actions.reduce(coralGardenReducer, from);
  const clean: CoralGardenAction[] = DEBRIS.map((d) => ({ type: "remove", id: d.id }));

  it("starts in the clean stage and asks to clean before planting", () => {
    expect(gardenStage(initialCoralGarden)).toBe("clean");
    expect(run([{ type: "pick", id: "fan" }]).feedback).toBe("clean-first");
    expect(run([{ type: "plant", support: "gentle-arch" }]).feedback).toBe("clean-first");
  });

  it("moves to restore once all three pieces of litter are removed", () => {
    const s = run(clean);
    expect(s.removed).toHaveLength(3);
    expect(gardenStage(s)).toBe("restore");
  });

  it("only plants a fragment where it is suitable", () => {
    const s = run([...clean, { type: "pick", id: "branching" }, { type: "plant", support: "sandy-floor" }]);
    expect(s.feedback).toBe("not-suitable");
    expect(s.planted).toEqual({});
    const ok = run([{ type: "plant", support: "sunny-ledge" }], s);
    expect(ok.planted).toEqual({ "sunny-ledge": "branching" });
    expect(run([{ type: "plant", support: "gentle-arch" }], ok).feedback).toBe("pick-first");
  });

  it("celebrates when all three fragments are planted, and resets", () => {
    const s = run([...clean, ...FRAGMENTS.flatMap((f) => [{ type: "pick", id: f.id }, { type: "plant", support: f.likes }] as CoralGardenAction[])]);
    expect(gardenStage(s)).toBe("celebrate");
    expect(s.feedback).toBe("restored");
    expect(run([{ type: "reset" }], s)).toEqual(initialCoralGarden);
  });
});

describe("Turtle's Safe Passage", () => {
  const swim = (...to: SpotId[]) => to.reduce((s, id) => passageReducer(s, { type: "swim", to: id }), initialPassage);

  it("has at least five stops and unsafe routes", () => {
    expect(PASSAGE_SPOTS.length).toBeGreaterThanOrEqual(5);
    expect(new Set(PASSAGE_ROUTES.map((r) => r.kind))).toEqual(new Set(["safe", "current", "net"]));
  });

  it("follows the safe route from the nest to the sanctuary", () => {
    expect(safestRoute()).toEqual(["nest", "coral-passage", "seashell-crossing", "safe-lagoon", "sanctuary"]);
    const s = swim("coral-passage", "seashell-crossing", "safe-lagoon", "sanctuary");
    expect(turtleArrived(s)).toBe(true);
    expect(s.feedback).toBe("arrived");
  });

  it("gives gentle feedback on currents, nets and unconnected stops, and lets you try again", () => {
    expect(swim("deep-current")).toMatchObject({ feedback: "current", path: ["nest"] });
    expect(swim("coral-passage", "kelp-forest", "shipwreck")).toMatchObject({ feedback: "net", path: ["nest", "coral-passage", "kelp-forest"] });
    expect(swim("sanctuary")).toMatchObject({ feedback: "not-connected", path: ["nest"] });
    expect(swim("deep-current", "coral-passage").path).toEqual(["nest", "coral-passage"]);
  });

  it("swims back, and resets", () => {
    const s = swim("coral-passage", "seashell-crossing");
    expect(passageReducer(s, { type: "back" }).path).toEqual(["nest", "coral-passage"]);
    expect(passageReducer(s, { type: "reset" })).toEqual(initialPassage);
  });
});

describe("Aqua portfolio readiness", () => {
  it("marks all three projects live and playable, and the portfolio ready", () => {
    const aqua = getFutureBySlug("aqua")!;
    expect(aqua.portfolioStatus).toBe("ready");
    expect(aqua.projects.every((p) => p.status === "ready" && p.implementation === "live" && p.interactionId === p.id)).toBe(true);
    const view = loadFutureView("aqua")!;
    expect(view.readiness.complete).toBe(true);
    expect(view.portfolio.projects.map((p) => [p.id, p.playable, p.verifiedImage])).toEqual([
      ["ocean-discovery", true, "/projects/aqua/ocean-discovery.png"],
      ["coral-care-garden", true, "/projects/aqua/coral-care-garden.png"],
      ["turtles-safe-passage", true, "/projects/aqua/turtles-safe-passage.png"],
    ]);
    expect(futurePathSchema.safeParse(aqua).success).toBe(true);
  });
});
