import type { AssetPath } from "./character";
import type { ContentStatus } from "./story";

/**
 * How far the interactive feature behind a project has been built.
 * Only `live` projects may expose an active "play"/"explore" button.
 */
export type ImplementationStatus = "proposed" | "in-progress" | "live";

export interface PortfolioProject {
  /** Unique within its future, kebab-case. */
  id: string;
  title: string;
  description: string;
  image?: AssetPath;
  /** Key of the interactive module; required once `implementation` is `live`. */
  interactionId?: string;
  /** Readiness of the showcase metadata (title, description, image). */
  status: ContentStatus;
  implementation: ImplementationStatus;
}
