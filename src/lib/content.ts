import { isAssetVerified } from "@/data/assets";
import { CHARACTERS } from "@/data/characters";
import { FUTURES } from "@/data/futures";
import type { Character, CharacterId } from "@/types/character";
import type { FuturePath, FutureReadiness } from "@/types/future";
import type { PortfolioProject } from "@/types/project";
import type { StoryScene } from "@/types/story";

/**
 * Stable read-only API over the content catalog for the frontend.
 * Unknown slugs/ids return `undefined` instead of throwing.
 */

export function getAllCharacters(): readonly Character[] {
  return CHARACTERS;
}

export function getCharacterById(id: number): Character | undefined {
  return CHARACTERS.find((c) => c.id === id);
}

export function getAllFutures(): readonly FuturePath[] {
  return FUTURES;
}

export function getFutureBySlug(slug: string): FuturePath | undefined {
  return FUTURES.find((f) => f.slug === slug);
}

export function getFutureCharacter(slug: string): Character | undefined {
  const future = getFutureBySlug(slug);
  return future && getCharacterById(future.characterId as CharacterId);
}

export function getStoryScenes(slug: string): readonly StoryScene[] | undefined {
  return getFutureBySlug(slug)?.scenes;
}

export function getPortfolioProjects(slug: string): readonly PortfolioProject[] | undefined {
  return getFutureBySlug(slug)?.projects;
}

export function isFutureStoryReady(slug: string): boolean {
  return getFutureBySlug(slug)?.storyStatus === "ready";
}

/** Hero path only if the file has actually been supplied. */
export function getHeroImage(slug: string): string | undefined {
  const hero = getFutureBySlug(slug)?.heroImage;
  return isAssetVerified(hero) ? hero : undefined;
}

export function getFutureReadiness(slug: string): FutureReadiness | undefined {
  const future = getFutureBySlug(slug);
  if (!future) return undefined;
  const storyReady = future.storyStatus === "ready";
  const portfolioReady = future.portfolioStatus === "ready";
  return {
    heroAvailable: isAssetVerified(future.heroImage),
    storyReady,
    portfolioReady,
    complete: storyReady && portfolioReady,
  };
}

/** Whether a project's interactive feature can be offered as an active button. */
export function isProjectPlayable(project: PortfolioProject): boolean {
  return project.implementation === "live" && project.interactionId !== undefined;
}
