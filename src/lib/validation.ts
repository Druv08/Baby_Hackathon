import { z } from "zod";

import {
  CHARACTER_IDS,
  CHARACTER_SLUGS,
  NORMAL_MARIA_ID,
  type Character,
} from "@/types/character";
import type { CharacterProfile, FuturePath, StoryIntro } from "@/types/future";
import type { PortfolioProject } from "@/types/project";
import type { StoryScene } from "@/types/story";
import { MIN_PORTFOLIO_PROJECTS, STORY_CONVENTION } from "@/data/site-config";

// Schema validation only checks that asset paths are well-formed. Whether the
// file actually exists is a separate concern — see `@/data/assets`.
const ASSET_PATH = /^\/[a-z0-9][a-z0-9/_-]*\.(png|jpe?g|webp|avif|gif|svg)$/;
const KEBAB_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const assetPathSchema = z
  .string()
  .regex(ASSET_PATH, "Asset path must look like /folder/name.png")
  .transform((p) => p as `/${string}`);

const characterIdSchema = z.union(CHARACTER_IDS.map((id) => z.literal(id)));
const futureIdSchema = z.union(
  CHARACTER_IDS.filter((id) => id !== NORMAL_MARIA_ID).map((id) => z.literal(id)),
);
const futureSlugSchema = z.enum(
  CHARACTER_SLUGS.filter((s): s is Exclude<typeof s, "normal"> => s !== "normal"),
);

export const contentStatusSchema = z.enum(["pending", "draft", "ready"]);

export const characterSchema = z.object({
  id: characterIdSchema,
  slug: z.enum(CHARACTER_SLUGS),
  name: z.string().min(1),
  profession: z.string().min(1),
  tagline: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  characterImage: assetPathSchema,
}) satisfies z.ZodType<Character>;

export const storySceneSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  narration: z.string(),
  image: assetPathSchema.optional(),
  characterId: characterIdSchema,
  layout: z.enum(["text-left", "text-right", "center"]),
  interactionId: z.string().regex(KEBAB_ID).optional(),
}) satisfies z.ZodType<StoryScene>;

export const portfolioProjectSchema = z
  .object({
    id: z.string().regex(KEBAB_ID, "Project id must be kebab-case"),
    title: z.string().min(1),
    description: z.string(),
    image: assetPathSchema.optional(),
    interactionId: z.string().regex(KEBAB_ID).optional(),
    status: contentStatusSchema,
    implementation: z.enum(["proposed", "in-progress", "live"]),
  })
  .superRefine((p, ctx) => {
    if (p.status === "ready" && p.description.trim() === "") {
      ctx.addIssue({ code: "custom", path: ["description"], message: "Ready project needs a description" });
    }
    if (p.implementation === "live" && !p.interactionId) {
      ctx.addIssue({ code: "custom", path: ["interactionId"], message: "Live project needs an interactionId" });
    }
  }) satisfies z.ZodType<PortfolioProject>;

const nonEmpty = z.string().trim().min(1);

export const storyIntroSchema = z.object({
  title: nonEmpty,
  subtitle: nonEmpty,
  blurb: nonEmpty,
}) satisfies z.ZodType<StoryIntro>;

export const characterProfileSchema = z.object({
  species: nonEmpty,
  personality: z.array(nonEmpty).min(1),
  specialTalent: nonEmpty,
  home: nonEmpty,
  theme: nonEmpty,
  about: z.array(nonEmpty).min(1),
  whatIDo: nonEmpty,
  strengths: z.array(nonEmpty).min(1),
  journey: nonEmpty,
  motto: nonEmpty,
}) satisfies z.ZodType<CharacterProfile>;

export const futurePathSchema = z
  .object({
    id: futureIdSchema,
    slug: futureSlugSchema,
    characterId: futureIdSchema,
    heroImage: assetPathSchema.optional(),
    storyCoverImage: assetPathSchema.optional(),
    storyStatus: contentStatusSchema,
    portfolioStatus: contentStatusSchema,
    scenes: z.array(storySceneSchema),
    projects: z.array(portfolioProjectSchema),
    storyIntro: storyIntroSchema.optional(),
    profile: characterProfileSchema.optional(),
  })
  .superRefine((f, ctx) => {
    if (f.id !== f.characterId) {
      ctx.addIssue({ code: "custom", path: ["id"], message: "Future id must equal its characterId" });
    }

    // Scene and project ids must be unique regardless of readiness.
    const sceneIds = f.scenes.map((s) => s.id);
    if (new Set(sceneIds).size !== sceneIds.length) {
      ctx.addIssue({ code: "custom", path: ["scenes"], message: "Duplicate scene ids" });
    }
    const projectIds = f.projects.map((p) => p.id);
    if (new Set(projectIds).size !== projectIds.length) {
      ctx.addIssue({ code: "custom", path: ["projects"], message: "Duplicate project ids" });
    }

    if (f.storyStatus === "ready") {
      for (const issue of readyStoryIssues(f.scenes, f.characterId)) {
        ctx.addIssue({ code: "custom", path: ["scenes", ...issue.path], message: issue.message });
      }
    }

    if (f.portfolioStatus === "ready") {
      if (f.projects.length < MIN_PORTFOLIO_PROJECTS) {
        ctx.addIssue({
          code: "custom",
          path: ["projects"],
          message: `Ready portfolio needs at least ${MIN_PORTFOLIO_PROJECTS} projects`,
        });
      }
      f.projects.forEach((p, i) => {
        if (p.status !== "ready") {
          ctx.addIssue({ code: "custom", path: ["projects", i, "status"], message: "Ready portfolio needs every project ready" });
        }
      });
    }
  }) satisfies z.ZodType<FuturePath>;

type SceneIssue = { path: (string | number)[]; message: string };

/** Strict origin/reveal checks applied only once a story is marked `ready`. */
function readyStoryIssues(scenes: StoryScene[], futureCharacterId: number): SceneIssue[] {
  const issues: SceneIssue[] = [];
  const { sceneCount, originSceneCount } = STORY_CONVENTION;

  if (scenes.length !== sceneCount) {
    issues.push({ path: [], message: `Ready story needs exactly ${sceneCount} scenes` });
  }

  scenes.forEach((scene, i) => {
    const position = i + 1;
    if (scene.id !== position) {
      issues.push({ path: [i, "id"], message: `Scene at position ${position} must have id ${position}` });
    }
    const expected = position <= originSceneCount ? NORMAL_MARIA_ID : futureCharacterId;
    if (scene.characterId !== expected) {
      issues.push({ path: [i, "characterId"], message: `Scene ${position} must use character ${expected}` });
    }
    if (scene.title.trim() === "") {
      issues.push({ path: [i, "title"], message: "Ready scene needs a title" });
    }
    if (scene.narration.trim() === "") {
      issues.push({ path: [i, "narration"], message: "Ready scene needs narration" });
    }
    if (!scene.image) {
      issues.push({ path: [i, "image"], message: "Ready scene needs an image" });
    }
  });

  return issues;
}

export interface CatalogValidationResult {
  success: boolean;
  issues: string[];
}

/**
 * Validates the whole content catalog: each entry's schema plus the
 * relationships between characters and futures.
 */
export function validateCatalog(characters: unknown[], futures: unknown[]): CatalogValidationResult {
  const issues: string[] = [];
  const parsedCharacters: Character[] = [];
  const parsedFutures: FuturePath[] = [];

  characters.forEach((c, i) => {
    const r = characterSchema.safeParse(c);
    if (r.success) parsedCharacters.push(r.data);
    else issues.push(...r.error.issues.map((e) => `characters[${i}].${e.path.join(".")}: ${e.message}`));
  });
  futures.forEach((f, i) => {
    const r = futurePathSchema.safeParse(f);
    if (r.success) parsedFutures.push(r.data);
    else issues.push(...r.error.issues.map((e) => `futures[${i}].${e.path.join(".")}: ${e.message}`));
  });

  const dupes = <T>(xs: T[]) => xs.filter((x, i) => xs.indexOf(x) !== i);

  for (const id of dupes(parsedCharacters.map((c) => c.id))) issues.push(`Duplicate character id ${id}`);
  for (const slug of dupes(parsedCharacters.map((c) => c.slug))) issues.push(`Duplicate character slug "${slug}"`);
  for (const id of dupes(parsedFutures.map((f) => f.id))) issues.push(`Duplicate future id ${id}`);
  for (const slug of dupes(parsedFutures.map((f) => f.slug))) issues.push(`Duplicate future slug "${slug}"`);

  for (const c of parsedCharacters) {
    if (CHARACTER_SLUGS[c.id - 1] !== c.slug) {
      issues.push(`Character ${c.id} must have slug "${CHARACTER_SLUGS[c.id - 1]}", got "${c.slug}"`);
    }
  }

  const charactersById = new Map(parsedCharacters.map((c) => [c.id, c]));
  for (const f of parsedFutures) {
    const character = charactersById.get(f.characterId);
    if (!character) {
      issues.push(`Future "${f.slug}" references missing character ${f.characterId}`);
    } else if (character.slug !== f.slug) {
      issues.push(`Future "${f.slug}" must share its slug with character ${f.characterId} ("${character.slug}")`);
    }
  }

  return { success: issues.length === 0, issues };
}
