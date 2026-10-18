import { isAssetVerified } from "@/data/assets";
import { CHARACTERS } from "@/data/characters";
import { STORY_CONVENTION } from "@/data/site-config";
import { getFutureBySlug, isProjectPlayable } from "@/lib/content";
import { NORMAL_MARIA_ID, type AssetPath, type Character, type FutureSlug } from "@/types/character";
import type { FuturePath, FutureReadiness } from "@/types/future";
import type { PortfolioProject } from "@/types/project";
import type { ContentStatus, StoryScene } from "@/types/story";

/**
 * Page sections of every future, in display order. Each is either available
 * or not — the frontend renders a placeholder / disabled action for the rest.
 */
export const FUTURE_SECTIONS = [
  "hero",
  "enter-story",
  "origin",
  "reveal",
  "portfolio-intro",
  "showcase",
  "interaction",
  "return",
] as const;
export type FutureSection = (typeof FUTURE_SECTIONS)[number];

export interface SceneView extends StoryScene {
  /** 1-based position in the story. */
  position: number;
  /** `origin` for scenes 1–4 (Normal Maria), `reveal` for the final scene. */
  kind: "origin" | "reveal";
  character: Character;
  /** Image only if the file has actually been supplied. */
  verifiedImage?: AssetPath;
}

export interface ProjectView extends PortfolioProject {
  /** Safe to show an active play/explore button. */
  playable: boolean;
  verifiedImage?: AssetPath;
}

export interface FutureView {
  id: FuturePath["id"];
  slug: FutureSlug;
  character: Character;
  normalMaria: Character;
  heroImage?: AssetPath;
  storyCoverImage?: AssetPath;
  readiness: FutureReadiness;

  story: {
    status: ContentStatus;
    /** False while pending/draft: render Enter Story as disabled / "coming soon". */
    canEnter: boolean;
    /** Ordered scenes. Empty unless the story is ready (or drafts are requested). */
    scenes: SceneView[];
    origin: SceneView[];
    reveal?: SceneView;
  };

  portfolio: {
    status: ContentStatus;
    /** Project metadata, including proposed ones; check `playable` before linking. */
    projects: ProjectView[];
  };

  /** Interaction IDs that are actually implemented and safe to mount. */
  interactions: string[];

  /** Availability of each page section, in display order. */
  sections: Record<FutureSection, boolean>;
}

export interface LoadFutureOptions {
  /** Include draft scenes (e.g. for an internal preview). Never for visitors. */
  includeDrafts?: boolean;
}

const CHARACTERS_BY_ID = new Map(CHARACTERS.map((c) => [c.id, c]));

function verified(path: string | undefined): AssetPath | undefined {
  return isAssetVerified(path) ? path : undefined;
}

/** Pure builder, exposed for tests and previews of unsaved content. */
export function buildFutureView(future: FuturePath, options: LoadFutureOptions = {}): FutureView | undefined {
  const character = CHARACTERS_BY_ID.get(future.characterId);
  const normalMaria = CHARACTERS_BY_ID.get(NORMAL_MARIA_ID);
  if (!character || !normalMaria) return undefined;

  const storyReady = future.storyStatus === "ready";
  const portfolioReady = future.portfolioStatus === "ready";
  const showScenes = storyReady || (options.includeDrafts === true && future.storyStatus === "draft");

  // Declared order is preserved; each scene keeps its own characterId.
  const scenes: SceneView[] = showScenes
    ? future.scenes.flatMap((scene, i) => {
        const sceneCharacter = CHARACTERS_BY_ID.get(scene.characterId);
        if (!sceneCharacter) return [];
        const position = i + 1;
        return [
          {
            ...scene,
            position,
            kind: position <= STORY_CONVENTION.originSceneCount ? "origin" : "reveal",
            character: sceneCharacter,
            verifiedImage: verified(scene.image),
          } satisfies SceneView,
        ];
      })
    : [];

  const projects: ProjectView[] = future.projects.map((p) => ({
    ...p,
    playable: isProjectPlayable(p),
    verifiedImage: verified(p.image),
  }));

  const interactions = [
    ...scenes.flatMap((s) => (s.interactionId ? [s.interactionId] : [])),
    ...projects.flatMap((p) => (p.playable && p.interactionId ? [p.interactionId] : [])),
  ];

  const heroImage = verified(future.heroImage);
  const reveal = scenes.find((s) => s.kind === "reveal");

  return {
    id: future.id,
    slug: future.slug,
    character,
    normalMaria,
    heroImage,
    storyCoverImage: verified(future.storyCoverImage),
    readiness: {
      heroAvailable: heroImage !== undefined,
      storyReady,
      portfolioReady,
      complete: storyReady && portfolioReady,
    },
    story: {
      status: future.storyStatus,
      canEnter: storyReady,
      scenes,
      origin: scenes.filter((s) => s.kind === "origin"),
      reveal,
    },
    portfolio: { status: future.portfolioStatus, projects },
    interactions,
    sections: {
      hero: true,
      "enter-story": storyReady,
      origin: storyReady,
      reveal: storyReady && reveal !== undefined,
      "portfolio-intro": portfolioReady,
      showcase: portfolioReady,
      interaction: interactions.length > 0,
      return: true,
    },
  };
}

/** Loads everything a future's page needs. Unknown slugs return `undefined`. */
export function loadFutureView(slug: string, options?: LoadFutureOptions): FutureView | undefined {
  const future = getFutureBySlug(slug);
  return future && buildFutureView(future, options);
}
