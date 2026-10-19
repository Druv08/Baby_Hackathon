export const NOTES = ["C", "D", "E", "G", "A"] as const;
export type Note = (typeof NOTES)[number];
export type Instrument = "Recorded guitar" | "Soft piano" | "Music box" | "Gentle bell";
export const INSTRUMENTS: Instrument[] = ["Recorded guitar", "Soft piano", "Music box", "Gentle bell"];
/** Real guitar notes recorded by the team (one pluck per file, after a short silence). */
export const RECORDED_NOTE_FILES: Record<Note, string> = {
  C: "/Melody%20music/C.mp4",
  D: "/Melody%20music/D.mp4",
  E: "/Melody%20music/E.mp4",
  G: "/Melody%20music/G.mp4",
  A: "/Melody%20music/A.mp4",
};
export type Mood = "Cheerful" | "Energetic" | "Gentle";
/** Full songs for Scene 3's moods; the scene plays a short preview of each. */
export const MOOD_TRACKS: Record<Mood, string> = {
  Cheerful: "/Melody/Cheerful.mp3",
  Energetic: "/Melody/Energetic.mp3",
  Gentle: "/Melody/Gentle.mp4",
};
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
