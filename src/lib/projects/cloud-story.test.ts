import { describe, expect, it } from "vitest";

import {
  BRIDGE_GAPS,
  CHIMES,
  CORRECT_CHIME,
  WORRIED_CLOUD_MESSAGES,
  bridgeReducer,
  chimesReducer,
  initialBridge,
  initialChimes,
  initialSteps,
  isBridgeComplete,
  stepsReducer,
  worriedCloudLevel,
  type BridgeAction,
  type StepsAction,
} from "./cloud-story";

describe("Scene 1: worried cloud", () => {
  it("cheers up one message per tap and stops at the last one", () => {
    expect(worriedCloudLevel(0)).toBe(0);
    expect(worriedCloudLevel(2)).toBe(2);
    expect(worriedCloudLevel(99)).toBe(WORRIED_CLOUD_MESSAGES.length - 1);
    // The scene never makes Maria brave yet.
    expect(WORRIED_CLOUD_MESSAGES.at(-1)).toMatch(/never been so high/);
  });
});

describe("Scene 2: cloud steps", () => {
  const run = (actions: StepsAction[]) => actions.reduce(stepsReducer, initialSteps);

  it("climbs three steps in order", () => {
    const s = run([0, 1, 2].map((index) => ({ type: "step", index })));
    expect(s).toEqual({ climbed: 3, wobble: null });
  });

  it("wobbles (without climbing) when a step is skipped", () => {
    const s = run([{ type: "step", index: 0 }, { type: "step", index: 2 }]);
    expect(s).toEqual({ climbed: 1, wobble: 2 });
    expect(stepsReducer(s, { type: "step", index: 1 })).toEqual({ climbed: 2, wobble: null });
  });

  it("stays finished after the top and resets on request", () => {
    const top = run([0, 1, 2].map((index) => ({ type: "step", index })));
    expect(stepsReducer(top, { type: "step", index: 0 })).toBe(top);
    expect(stepsReducer(top, { type: "reset" })).toEqual(initialSteps);
  });
});

describe("Scene 3: wind chimes", () => {
  it("has three chimes and only the right one reveals the way", () => {
    expect(CHIMES).toHaveLength(3);
    expect(CORRECT_CHIME).toBe("right");
    const wrong = chimesReducer(initialChimes, { type: "ring", id: "left" });
    expect(wrong).toMatchObject({ rung: "left", found: false, rings: 1 });
    const right = chimesReducer(wrong, { type: "ring", id: "right" });
    expect(right).toMatchObject({ rung: "right", found: true, rings: 2 });
  });

  it("remembers the way once found, and ignores unknown chimes", () => {
    const found = chimesReducer(initialChimes, { type: "ring", id: "right" });
    expect(chimesReducer(found, { type: "ring", id: "middle" }).found).toBe(true);
    // @ts-expect-error — unknown chime id
    expect(chimesReducer(found, { type: "ring", id: "nope" })).toBe(found);
    expect(chimesReducer(found, { type: "reset" })).toEqual(initialChimes);
  });
});

describe("Scene 4: cloud bridge", () => {
  const run = (actions: BridgeAction[]) => actions.reduce(bridgeReducer, initialBridge);
  const solve: BridgeAction[] = BRIDGE_GAPS.flatMap((size, gap) => [
    { type: "select", size },
    { type: "place", gap },
  ]);

  it("completes when every gap holds the matching cloud", () => {
    const s = run(solve);
    expect(isBridgeComplete(s)).toBe(true);
    expect(s.placed).toEqual(BRIDGE_GAPS);
  });

  it("rejects a cloud in the wrong-sized gap", () => {
    const s = run([{ type: "select", size: "small" }, { type: "place", gap: 0 }]);
    expect(s.last).toBe("wrong-fit");
    expect(s.placed).toEqual([null, null, null]);
    expect(s.selected).toBe("small");
  });

  it("asks for a cloud first, and won't reuse a placed cloud or refill a gap", () => {
    expect(run([{ type: "place", gap: 1 }]).last).toBe("pick-first");
    const one = run([{ type: "select", size: "large" }, { type: "place", gap: 0 }]);
    expect(bridgeReducer(one, { type: "select", size: "large" })).toBe(one);
    const sel = bridgeReducer(one, { type: "select", size: "small" });
    expect(bridgeReducer(sel, { type: "place", gap: 0 })).toBe(sel);
    expect(isBridgeComplete(one)).toBe(false);
  });

  it("resets to an empty bridge", () => {
    expect(bridgeReducer(run(solve), { type: "reset" })).toEqual(initialBridge);
  });
});
