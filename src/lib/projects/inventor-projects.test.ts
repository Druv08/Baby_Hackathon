import { describe, expect, it } from "vitest";

import { getFutureBySlug } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";
import { futurePathSchema } from "@/lib/validation";
import {
  HELPER_TOOLS,
  LANTERN_COLORS,
  LANTERN_SHAPES,
  WORKSHOP_LEVELS,
  allLevelsSolved,
  availableTask,
  correctCount,
  glowStrength,
  helperReducer,
  initialHelper,
  initialLantern,
  initialWorkshop,
  isModified,
  lanternReducer,
  workshopReducer,
  type HelperAction,
  type WorkshopAction,
  type WorkshopState,
} from "./inventor-projects";

describe("Star Workshop", () => {
  const run = (actions: WorkshopAction[], from: WorkshopState = initialWorkshop) => actions.reduce(workshopReducer, from);
  const solveCurrent = (s: WorkshopState): WorkshopAction[] =>
    WORKSHOP_LEVELS[s.level].slots.flatMap((slot, i) => [{ type: "pick", part: slot.needs }, { type: "place", slot: i }] as WorkshopAction[]);

  it("has three levels of growing difficulty", () => {
    expect(WORKSHOP_LEVELS.map((l) => l.title)).toEqual(["Missing Gear", "Broken Mechanism", "Star Engine"]);
    expect(WORKSHOP_LEVELS.map((l) => l.slots.length)).toEqual([1, 3, 5]);
    // Each bench holds every needed part.
    for (const l of WORKSHOP_LEVELS) for (const s of l.slots) expect(l.bench).toContain(s.needs);
  });

  it("refuses a wrong part with a count of what's right", () => {
    const s = run([{ type: "pick", part: "gear-l" }, { type: "place", slot: 0 }, { type: "test" }]);
    expect(s.result).toBe("wrong");
    expect(correctCount(s)).toBe(0);
    expect(s.solved).toEqual([]);
  });

  it("can't test until every slot is filled, or skip a level", () => {
    const s = run([{ type: "next" }, { type: "test" }]);
    expect(s).toBe(initialWorkshop);
  });

  it("solves all three levels in order and unlocks each next one", () => {
    let s = initialWorkshop;
    for (let i = 0; i < WORKSHOP_LEVELS.length; i++) {
      s = run([...solveCurrent(s), { type: "test" }], s);
      expect(s.result).toBe("solved");
      if (i < WORKSHOP_LEVELS.length - 1) s = run([{ type: "next" }], s);
    }
    expect(allLevelsSolved(s)).toBe(true);
    expect(s.solved).toEqual([1, 2, 3]);
  });

  it("removes a part, retries a level and restarts everything", () => {
    const s = run([{ type: "pick", part: "gear-s" }, { type: "place", slot: 0 }, { type: "remove", slot: 0 }]);
    expect(s.placed).toEqual([null]);
    const solved1 = run([...solveCurrent(initialWorkshop), { type: "test" }, { type: "next" }]);
    const partial = run([{ type: "pick", part: "gear-l" }, { type: "place", slot: 0 }, { type: "retry" }], solved1);
    expect(partial.placed).toEqual([null, null, null]);
    expect(partial.level).toBe(1);
    expect(run([{ type: "restart" }], partial)).toEqual(initialWorkshop);
  });
});

describe("Dream Lantern Lab", () => {
  it("offers the three shapes and four colours", () => {
    expect(LANTERN_SHAPES.map((s) => s.label)).toEqual(["Star Lantern", "Crescent Moon Lantern", "Crystal Lantern"]);
    expect(LANTERN_COLORS.map((c) => c.label)).toEqual(["Golden", "Pink", "Lavender", "Blue"]);
  });

  it("updates shape, colour and glow, clamping the glow", () => {
    let s = lanternReducer(initialLantern, { type: "shape", shape: "moon" });
    s = lanternReducer(s, { type: "color", color: "lavender" });
    s = lanternReducer(s, { type: "glow", glow: 140 });
    expect(s).toMatchObject({ shape: "moon", color: "lavender", glow: 100 });
    expect(lanternReducer(s, { type: "glow", glow: -5 }).glow).toBe(0);
    expect(lanternReducer(s, { type: "glow", glow: Number.NaN })).toBe(s);
  });

  it("switches off (no glow) and on again, and resets", () => {
    const off = lanternReducer(initialLantern, { type: "toggle" });
    expect(off.on).toBe(false);
    expect(glowStrength(off)).toBe(0);
    expect(glowStrength(lanternReducer(off, { type: "toggle" }))).toBeCloseTo(0.6);
    expect(lanternReducer(off, { type: "reset" })).toEqual(initialLantern);
  });
});

describe("Little Helper Machines", () => {
  const run = (actions: HelperAction[]) => actions.reduce(helperReducer, initialHelper);

  it("has no task until the helper is assembled", () => {
    expect(availableTask(initialHelper)).toBeNull();
    expect(run([{ type: "task" }]).taskDone).toBe(false);
  });

  it("assembles the chosen parts, and the tool decides the task", () => {
    for (const tool of HELPER_TOOLS) {
      const s = run([{ type: "body", body: "star" }, { type: "move", move: "propeller" }, { type: "tool", tool: tool.id }, { type: "assemble" }]);
      expect(s.built).toEqual({ body: "star", move: "propeller", tool: tool.id });
      expect(availableTask(s)?.task).toBe(tool.task);
    }
    expect(HELPER_TOOLS.map((t) => t.task)).toEqual(["Move the little box", "Carry the lantern", "Water the flower"]);
  });

  it("runs the task, notices changes since assembly, and resets", () => {
    const s = run([{ type: "tool", tool: "watering" }, { type: "assemble" }, { type: "task" }]);
    expect(s).toMatchObject({ taskDone: true, runs: 1 });
    const changed = helperReducer(s, { type: "body", body: "square" });
    expect(isModified(changed)).toBe(true);
    expect(isModified(helperReducer(changed, { type: "assemble" }))).toBe(false);
    expect(helperReducer(s, { type: "reset" })).toEqual(initialHelper);
  });
});

describe("Inventor portfolio readiness", () => {
  it("marks all three projects live and playable, and the portfolio ready", () => {
    const inventor = getFutureBySlug("inventor")!;
    expect(inventor.portfolioStatus).toBe("ready");
    expect(inventor.projects.every((p) => p.status === "ready" && p.implementation === "live" && p.interactionId === p.id)).toBe(true);
    const view = loadFutureView("inventor")!;
    expect(view.readiness.complete).toBe(true);
    expect(view.portfolio.projects.map((p) => [p.id, p.playable, p.verifiedImage])).toEqual([
      ["star-workshop", true, "/projects/inventor/star-workshop.png"],
      ["dream-lantern-lab", true, "/projects/inventor/dream-lantern-lab.png"],
      ["little-helper-machines", true, "/projects/inventor/little-helper-machines.png"],
    ]);
    expect(futurePathSchema.safeParse(inventor).success).toBe(true);
  });
});
