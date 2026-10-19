export const NOTES = ["C", "D", "E", "G", "A"] as const;
export type Note = (typeof NOTES)[number];
export type Instrument = "Soft piano" | "Music box" | "Gentle bell";
export const FREQUENCIES: Record<Note, number> = { C: 261.63, D: 293.66, E: 329.63, G: 392, A: 440 };
export const DEFAULT_SCORE: Note[] = ["C", "E", "G", "E", "D", "C", "A", "G"];
export const MELODIES: Record<string, readonly Note[]> = {
  "Gentle Moonlight": ["C", "E", "G", "E", "D", "C"],
  "Dreaming Stars": ["G", "A", "E", "G", "C", "A"],
  "Little Lullaby": ["E", "D", "C", "D", "E", "C"],
};
export function makeFlowerSequence(length: number, random = Math.random): number[] {
  return Array.from({ length }, () => Math.min(3, Math.floor(Math.max(0, random()) * 4)));
}
export function checkFlower(sequence: readonly number[], answer: readonly number[]): "wrong" | "complete" | "continue" {
  if (answer.some((n, i) => n !== sequence[i]) || answer.length > sequence.length) return "wrong";
  return answer.length === sequence.length ? "complete" : "continue";
}
