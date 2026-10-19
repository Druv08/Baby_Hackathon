import { describe, expect, it } from "vitest";
import { CHARACTERS } from "./characters";
import { APPROVED_EXPRESSIONS, expressionFor } from "./expressions";

describe("approved expression registry", () => {
  it.each(CHARACTERS.filter(character => character.id !== 1))("keeps $name canonical until reviewed artwork exists", character => {
    expect(expressionFor(character.id, "night").src).toBe(character.characterImage);
    expect(expressionFor(character.id, "night").hasVariant).toBe(false);
  });
  it("uses an approved variant without changing the canonical registry", () => {
    expect(APPROVED_EXPRESSIONS[1]?.night?.approval).toBe("approved");
    expect(expressionFor(1, "night")).toMatchObject({ src: "/expressions/normal-dreamy.png", hasVariant: true });
    expect(expressionFor(1, "day").src).toBe("/characters/1.png");
  });
});
