import type { AssetPath, FutureCharacterId, FutureSlug } from "./character";
import type { PortfolioProject } from "./project";
import type { ContentStatus, StoryScene } from "./story";

/**
 * One of Maria's eight independent futures. Futures never depend on each
 * other; each starts from Normal Maria and can be explored in any order.
 */
export interface FuturePath {
  /** Stable ID, equal to `characterId`. */
  id: FutureCharacterId;
  slug: FutureSlug;
  characterId: FutureCharacterId;

  /** Landing/hero screen design. Omit until the file is supplied. */
  heroImage?: AssetPath;
  /** Optional "Start Story" cover screen featuring Normal Maria. */
  storyCoverImage?: AssetPath;

  storyStatus: ContentStatus;
  portfolioStatus: ContentStatus;

  scenes: StoryScene[];
  projects: PortfolioProject[];
}

/** What the frontend can safely show for a future right now. */
export interface FutureReadiness {
  heroAvailable: boolean;
  storyReady: boolean;
  portfolioReady: boolean;
  /** Story and portfolio are both ready. */
  complete: boolean;
}
