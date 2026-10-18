import type { AssetPath, CharacterId } from "./character";

/**
 * - `pending`: nothing written yet.
 * - `draft`:   partially written; not shown as finished, not strictly validated.
 * - `ready`:   complete; strictly validated and safe to present.
 */
export type ContentStatus = "pending" | "draft" | "ready";

export type SceneLayout = "text-left" | "text-right" | "center";

export interface StoryScene {
  /** 1-based position within the future's story. */
  id: number;
  title: string;
  narration: string;
  /** Optional while drafting; required once the story is `ready`. */
  image?: AssetPath;
  /** Scenes 1–4 use Normal Maria (1); the final scene reveals the future's character. */
  characterId: CharacterId;
  layout: SceneLayout;
  interactionId?: string;
}
