import { CHARACTERS } from "./characters";

export type Mood = "day" | "night";
export interface ApprovedExpression { src: string; alt: string; approval: "approved" }

/** Only reviewed variants belong here. Proposals in docs/art-review are never served. */
export const APPROVED_EXPRESSIONS: Partial<Record<number, Partial<Record<Mood, ApprovedExpression>>>> = {
  1: { night: { src: "/expressions/normal-dreamy.png", alt: "Normal Maria with a gentle dreamy smile, wearing her pink floral scarf", approval: "approved" } },
};

export function expressionFor(characterId: number, mood: Mood) {
  const character = CHARACTERS.find(item => item.id === characterId);
  if (!character) throw new Error(`Unknown Maria character ${characterId}`);
  const variant = APPROVED_EXPRESSIONS[characterId]?.[mood];
  return { src: variant?.src ?? character.characterImage, alt: variant?.alt, hasVariant: !!variant };
}
