export const SITE_CONFIG = {
  name: "Maria",
  title: "Maria — Eight Dreams, One Heart",
  description:
    "Maria is a baby red panda who doesn't know what she wants to become. Explore eight possible futures.",
} as const;

/**
 * Current origin-story convention, enforced once a story is `ready`:
 * scenes 1–4 feature Normal Maria, scene 5 reveals the future's character.
 */
export const STORY_CONVENTION = {
  sceneCount: 5,
  originSceneCount: 4,
} as const;

/** A ready portfolio showcases at least this many works. */
export const MIN_PORTFOLIO_PROJECTS = 3;
