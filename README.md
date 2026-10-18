# Maria — Eight Dreams, One Heart

haX.baby "Baby's First Website" · Track 2 — Original Character.

Maria is a baby red panda who doesn't know what she wants to become. The site
presents eight independent futures, each starting from Normal Maria.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest
npm run typecheck
npm run build
```

No environment variables are needed yet.

## Content model

| Path | Purpose |
|---|---|
| `src/types/` | `Character`, `FuturePath`, `StoryScene`, `PortfolioProject` |
| `src/data/characters.ts` | The nine locked characters (IDs 1–9) |
| `src/data/futures.ts` | The eight futures (IDs/character IDs 2–9) |
| `src/data/assets.ts` | Asset files that have actually been supplied |
| `src/lib/validation.ts` | Zod schemas + catalog validation |
| `src/lib/content.ts` | Typed helpers for the frontend (`getFutureBySlug`, …) |

### Locked character art

`public/characters/1.png`–`9.png` are the canonical Maria designs. Never
regenerate, recolor, rename or replace them.

### Adding content for one future

Edit only that future's entry in `src/data/futures.ts`:

1. Add image files under `public/` and list them in `src/data/assets.ts`.
2. Add scenes. While `storyStatus` is `pending`/`draft`, anything goes.
3. Set `storyStatus: "ready"` once there are exactly 5 scenes (ids 1–5),
   scenes 1–4 use character 1, scene 5 uses the future's character, and every
   scene has a title, narration and image.
4. Set `portfolioStatus: "ready"` once there are ≥3 projects, all `ready`.
5. A project's button should only be active when `isProjectPlayable(project)`
   (i.e. `implementation: "live"` with an `interactionId`).

`npm test` enforces all of the above.

## Frontend integration

### Loading a future page

```tsx
import { loadFutureView } from "@/lib/future-view";

const view = loadFutureView(slug); // undefined for unknown slugs → notFound()
view.heroImage;            // verified hero path
view.story.canEnter;       // false while pending/draft → disable "Enter Story"
view.story.origin;         // scenes 1–4 (Normal Maria), ordered
view.story.reveal;         // scene 5 (future Maria)
view.portfolio.projects;   // check `project.playable` before showing a button
view.sections;             // { hero, "enter-story", origin, reveal, ... }: boolean
```

See `src/app/futures/[slug]/page.tsx` for a minimal, unstyled example.

### Visitor progress and secrets (client components)

```tsx
"use client";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";

const {
  hydrated, welcomeMessage, completedCount, isStoryComplete,
  discoverFuture, completeStory, setVisitorName, resetProgress,
  collectSecret, secretCount, secretEndingUnlocked, secretEnding,
} = useJourneyProgress();

completeStory(view.id);                        // call at the end of scene 5
const result = collectSecret("golden-seed");   // "collected" | "already-collected" | "unknown"
```

Progress lives in `localStorage` under `maria:journey-progress`. It renders
as empty progress on the server and during hydration; wait for `hydrated`
before showing returning-visitor UI.
