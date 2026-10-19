import { describe, expect, it } from "vitest";
import { CHARACTERS } from "@/data/characters";
import { FUTURES } from "@/data/futures";
import { detectIntent, replyTo } from "./dialogue";

describe("authored Maria conversations", () => {
  it.each([
    ["Hello", "greeting"], ["Who are you?", "identity"], ["Tell me your story", "story"],
    ["What do you like doing?", "interests"], ["Tell me about your creations", "projects"],
    ["Can you teach me?", "help"], ["What did you learn?", "lesson"], ["Tell me a secret", "secret"],
    ["Goodbye", "farewell"], ["xyzzy", "fallback"],
  ])("understands %s", (question, intent) => expect(detectIntent(question)).toBe(intent));
  it("every character has a distinct relevant voice", () => {
    const answers = CHARACTERS.map(character => replyTo(character.slug, "What do you love doing?").text);
    expect(new Set(answers).size).toBe(9);
    expect(answers[5]).toContain("building"); expect(answers[7]).toContain("lullabies");
    expect(answers[2]).toContain("constellations"); expect(answers[8]).toContain("memories");
  });
  it.each(FUTURES)("links $slug to its real playable project", future => {
    const result = replyTo(future.slug, "Can you help me?");
    expect(future.projects.some(project => result.href === `/futures/${future.slug}/story#project-${project.id}`)).toBe(true);
  });
  it("unknown input stays authored, does not echo HTML or invent an answer", () => {
    const result = replyTo("normal", "<script>alert(1)</script>");
    expect(result.intent).toBe("fallback"); expect(result.text).not.toContain("<script>");
    expect(replyTo("normal", "???", 1).text).not.toBe(result.text);
  });
});
