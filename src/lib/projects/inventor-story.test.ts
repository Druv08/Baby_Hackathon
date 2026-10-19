import { describe, expect, it } from "vitest";

import {
  ACTIVATION_PARTS,
  GEAR_SLOTS,
  LANTERN_MESSAGES,
  MACHINE_PARTS,
  activationReducer,
  gearChallengeReducer,
  gearHint,
  initialActivation,
  initialGearChallenge,
  initialParts,
  lanternLevel,
  partsReducer,
  type GearChallengeAction,
} from "./inventor-story";

describe("Scene 1: flickering lantern", () => {
  it("brightens and fades without ever being restored", () => {
    expect(lanternLevel(0)).toBe(0);
    expect(lanternLevel(99)).toBe(LANTERN_MESSAGES.length - 1);
    expect(LANTERN_MESSAGES.join(" ")).not.toMatch(/restored|fixed|stays lit/i);
    expect(LANTERN_MESSAGES.at(-1)).toMatch(/something is wrong/i);
  });
});

describe("Scene 2: machine diagram", () => {
  it("has a gear, a spring and the Star Chamber, counted 0/3 to 3/3 once each", () => {
    expect(MACHINE_PARTS.map((p) => p.name)).toEqual(["Gear", "Spring", "Star Chamber"]);
    let s = initialParts;
    for (const p of MACHINE_PARTS) s = partsReducer(s, { type: "learn", id: p.id });
    s = partsReducer(s, { type: "learn", id: "gear" });
    expect(s.learned).toHaveLength(3);
    expect(s.last).toBe("gear");
  });
});

describe("Scene 3: gear challenge", () => {
  const run = (actions: GearChallengeAction[], from = initialGearChallenge) => actions.reduce(gearChallengeReducer, from);
  const place = (size: "small" | "medium" | "large", slot: number): GearChallengeAction[] => [
    { type: "pick", size },
    { type: "place", slot },
  ];

  it("can't be tested until every slot holds a gear", () => {
    const s = run(place("large", 0));
    expect(run([{ type: "test" }], s)).toBe(s);
  });

  it("gives a gentle, specific hint for a wrong arrangement", () => {
    const s = run([...place("small", 0), ...place("medium", 1), ...place("large", 2), { type: "test" }]);
    expect(s.checked).toBe("wrong");
    expect(gearHint(s)).toBe("The driving wheel is too small. Try a large gear there!");
    expect(s.tries).toBe(1);
  });

  it("moves a gear out of its old slot when placed elsewhere", () => {
    const s = run([...place("large", 0), ...place("large", 1)]);
    expect(s.slots).toEqual([null, "large", null]);
  });

  it("accepts the right arrangement, then locks until cleared", () => {
    const s = run([
      ...GEAR_SLOTS.flatMap((slot, i) => place(slot.need, i)),
      { type: "test" },
    ]);
    expect(s.checked).toBe("right");
    expect(gearHint(s)).toBe("");
    expect(run([{ type: "pick", size: "small" }], s)).toBe(s);
    expect(run([{ type: "clear" }], s)).toMatchObject({ slots: [null, null, null], checked: "none", tries: 1 });
  });
});

describe("Scene 4: machine activation", () => {
  it("only starts once the main gear, spring and wheel are fitted", () => {
    let s = activationReducer(initialActivation, { type: "start" });
    expect(s.running).toBe(false);
    for (const p of ACTIVATION_PARTS) s = activationReducer(s, { type: "fit", part: p.id });
    expect(activationReducer(s, { type: "fit", part: "spring" })).toBe(s);
    s = activationReducer(s, { type: "start" });
    expect(s.running).toBe(true);
    expect(activationReducer(s, { type: "reset" })).toEqual(initialActivation);
  });
});
