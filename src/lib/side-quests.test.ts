import { describe, expect, it } from "vitest";
import { CHARACTER_SLUGS } from "@/types/character";
import { counterDigits, TRAILS, TRAIL_LIFETIME_MS, TRAIL_PARTICLE_LIMIT } from "./side-quests";
import { createBooleanPreference } from "./site-preferences";
import { createSoundSettings } from "./sound-settings";

function storage() {
  const values = new Map<string, string>();
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}

describe("side quest models", () => {
  it("covers every character and caps transient cursor effects", () => {
    expect(Object.keys(TRAILS).sort()).toEqual([...CHARACTER_SLUGS].sort());
    expect(new Set(Object.values(TRAILS).map(t => t.glyph)).size).toBe(9);
    expect(TRAIL_PARTICLE_LIMIT).toBeLessThanOrEqual(24);
    expect(TRAIL_LIFETIME_MS).toBeLessThan(1000);
  });
  it("keeps the real count intact even beyond six digits", () => {
    expect(counterDigits(0).join("")).toBe("000000");
    expect(counterDigits(129).join("")).toBe("000129");
    expect(counterDigits(1234567).join("")).toBe("1234567");
  });
  it("persists preferences, notifies subscribers and works with blocked storage", () => {
    const saved = storage();
    const pref = createBooleanPreference("chaos", () => saved);
    let calls = 0;
    const unsubscribe = pref.subscribe(() => calls++);
    pref.set(true); expect(pref.getSnapshot()).toBe(true); expect(calls).toBe(1);
    expect(createBooleanPreference("chaos", () => saved).getSnapshot()).toBe(true);
    unsubscribe(); pref.set(false); expect(calls).toBe(1);
    const blocked = createBooleanPreference("chaos", () => { throw Error("blocked"); });
    expect(blocked.getSnapshot()).toBe(false); blocked.set(true); expect(blocked.getSnapshot()).toBe(true);
  });
  it("requires a fresh gesture after reload, even when sound is remembered on", () => {
    const saved = storage(); saved.setItem("maria:sound", "on");
    const sound = createSoundSettings(() => saved);
    expect(sound.getPreference()).toBe(true); expect(sound.getEnabled()).toBe(false);
    sound.activate(); expect(sound.getEnabled()).toBe(true);
    sound.setEnabled(false); expect(sound.getEnabled()).toBe(false);
    expect(saved.getItem("maria:sound")).toBe("off");
    sound.setEnabled(true);
    const reloaded = createSoundSettings(() => saved);
    expect(reloaded.getPreference()).toBe(true); expect(reloaded.getEnabled()).toBe(false);
  });
  it("shares mute immediately and unsubscribes cleanly", () => {
    const sound = createSoundSettings(() => null);
    const seen: boolean[] = [];
    const unsubscribe = sound.subscribe(() => seen.push(sound.getEnabled()));
    sound.setEnabled(true); sound.setEnabled(false);
    expect(seen).toContain(true); expect(seen.at(-1)).toBe(false);
    const before = seen.length; unsubscribe(); sound.setEnabled(true); expect(seen).toHaveLength(before);
  });
});
