import { CHARACTER_SLUGS, type CharacterSlug } from "@/types/character";

/**
 * Per-character cursor, click sound and background music. The click sounds,
 * music and paw artwork were added in the `backend` branch; the cursor PNGs
 * are small derivatives of that artwork (see scripts/make-cursors.mjs).
 * Normal Maria's set is used everywhere outside a future's pages.
 */
export interface Ambience {
  cursor: string;
  click: string;
  music: string;
}

const file = (dir: string, name: string) => `/${dir}/${encodeURIComponent(name)}`;

export const AMBIENCE: Record<CharacterSlug, Ambience> = {
  normal: { cursor: "/cursors/normal.png", click: file("audio", "maria.wav"), music: file("bg-music", "The base.mp4") },
  blossom: { cursor: "/cursors/blossom.png", click: file("audio", "blossom.wav"), music: file("bg-music", "Blossom.mp4") },
  star: { cursor: "/cursors/star.png", click: file("audio", "star.wav"), music: file("bg-music", "Star.mp4") },
  cloud: { cursor: "/cursors/cloud.png", click: file("audio", "cloud.wav"), music: file("bg-music", "Cloud.mp4") },
  aqua: { cursor: "/cursors/aqua.png", click: file("audio", "bubble-aqua.wav"), music: file("bg-music", "Aqua.mp4") },
  inventor: { cursor: "/cursors/inventor.png", click: file("audio", "gear- inventor.wav"), music: file("bg-music", "Inventor.mp4") },
  forest: { cursor: "/cursors/forest.png", click: file("audio", "dry leaves- forest.wav"), music: file("bg-music", "Forest.mp4") },
  melody: { cursor: "/cursors/melody.png", click: file("audio", "melody.wav"), music: file("bg-music", "Melody.mp4") },
  luna: { cursor: "/cursors/luna.png", click: file("audio", "luna- chimes.wav"), music: file("bg-music", "Luna.mp4") },
};

/** The character whose ambience applies on a route: `/futures/<slug>/…`, else Normal Maria. */
export function ambienceSlug(pathname: string | null): CharacterSlug {
  const match = /^\/futures\/([^/]+)/.exec(pathname ?? "");
  const slug = match?.[1] as CharacterSlug | undefined;
  return slug && slug !== "normal" && CHARACTER_SLUGS.includes(slug) ? slug : "normal";
}

/** Site-wide sound preference: off until the visitor turns it on. */
export const SOUND_STORAGE_KEY = "maria:sound";
