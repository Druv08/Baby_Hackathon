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

The site builds and runs without a database; the Memory Book and visit
counter APIs then answer `503 unavailable`. See [Backend setup](#backend-setup).

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

## Backend setup

Supabase PostgreSQL, accessed only from Next.js API routes.

1. Create a Supabase project.
2. Run `supabase/migrations/*.sql` in order (SQL Editor, or `supabase db push`).
3. Copy `.env.example` to `.env.local` (and set the same variables in Vercel):

| Variable | Required | Notes |
|---|---|---|
| `SUPABASE_URL` | yes | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | **Server-only.** Never prefix with `NEXT_PUBLIC_`. |
| `RATE_LIMIT_SECRET` | no | HMAC secret for rate-limit keys; defaults to the service key |
| `SUPABASE_INTEGRATION_TESTS` | no | `1` runs live DB tests (use a non-production project) |

### Database

| Table | Purpose | Public access (RLS) |
|---|---|---|
| `memories` | Guestbook submissions (`pending` / `approved` / `rejected`) | `select` approved rows only; no writes |
| `site_counters` | `site_visits` counter | none |
| `visit_tokens` | One row per recorded browser session (idempotency, expires after 1 day) | none |
| `rate_limits` | Shared fixed-window rate limiter keyed by HMAC'd IP | none |

`record_visit(token)` and `consume_rate_limit(...)` are atomic SQL functions,
executable only by the service role.

### Moderating the Memory Book

New memories are stored as `pending` and never shown until approved. There
is deliberately **no** API for approving or rejecting. Moderate in the
Supabase dashboard (Table Editor → `memories`, edit `status`), or in the
SQL Editor:

```sql
-- Review the queue
select id, visitor_name, message, form_slug, created_at
from memories where status = 'pending' order by created_at;

update memories set status = 'approved' where id = '<id>';
update memories set status = 'rejected' where id = '<id>';
```

### Abuse protection

- Validation: names 1–40 characters (letters, numbers, spaces, `.'-_`),
  messages 1–280 characters, no links, control characters stripped,
  `formSlug` limited to the eight futures, 2 KB body cap (enforced while
  streaming).
- Rate limits, shared across serverless instances via Postgres:
  memories 3 per 10 min and 10 per day per client, plus 300 per hour site-wide;
  visits 30 per hour per client. A per-instance in-memory limiter sits in
  front as a cheap first filter. If the shared limiter is down, writes are
  refused (fail closed).
- A hidden `website` honeypot field: if filled, the API answers success and
  stores nothing.
- Client IPs come from `x-forwarded-for` (set by Vercel) and are stored only
  as truncated HMACs.
- Error responses use fixed messages; database errors are never echoed.
- Memories are plain text. Render them as React text, never with
  `dangerouslySetInnerHTML`.

## API reference

All endpoints return JSON. Errors always look like:

```json
{ "error": { "code": "validation_failed", "message": "Some fields need another look.",
             "fields": { "message": "Memories can be up to 280 characters." } } }
```

| Code | Status | When |
|---|---|---|
| `validation_failed` | 400 | Bad fields or query (`fields` lists them) |
| `invalid_json` | 400 | Malformed JSON |
| `payload_too_large` | 413 | Body over the cap |
| `unsupported_media_type` | 415 | Not `application/json` |
| `rate_limited` | 429 | Too many requests (`Retry-After` header) |
| `unavailable` | 503 | Database not configured or temporarily failing |

### `GET /api/memories?limit=20&before=<ISO timestamp>`

Approved memories, newest first. `limit` is 1–50 (default 20).

```json
{
  "memories": [
    { "id": "6f1c…", "visitorName": "Mia", "message": "I want to become an astronaut!",
      "formSlug": "star", "createdAt": "2026-10-18T12:00:00.000Z" }
  ],
  "nextCursor": "2026-10-18T12:00:00.000Z"
}
```

Pass `nextCursor` as `before` to load the next page; `null` means no more.

### `POST /api/memories`

```json
{ "visitorName": "Mia", "message": "I want to become an astronaut!", "formSlug": "star" }
```

`formSlug` is optional. Responds `202` — received for review, **not** published:

```json
{ "status": "received", "message": "Thank you! Maria will read your memory soon. It will appear once it has been reviewed." }
```

Show this confirmation; don't add the memory to the public list.

### `GET /api/visits`

```json
{ "count": 142 }
```

`count` is **recorded visits** — one per browser session. It is not a count
of unique people.

### `POST /api/visits`

```json
{ "visitId": "3b241101-e2bb-4255-8caf-4136c566a962" }
```

Returns `{ "count": 143 }`. Repeating the same `visitId` returns the current
count without incrementing, so retries are safe.

### Frontend helpers

```tsx
import { fetchMemories, submitMemory } from "@/lib/api-client";
import { useVisitCounter } from "@/hooks/useVisitCounter";

const result = await submitMemory({ visitorName, message, formSlug: "star" });
if (result.ok) showThanks(result.data.message);
else showErrors(result.error.fields ?? {}, result.error.message);

// One visit per browser session; rerenders, Strict Mode and reloads don't recount.
const count = useVisitCounter(); // null while loading or unavailable → hide the counter
```

## Tests

`npm test` runs:

- Unit and API tests with in-memory fakes (no network).
- `src/lib/server/database.test.ts`: the real migration SQL on PGlite
  (PostgreSQL in WASM), including RLS, grants, constraints and the
  counter/rate-limit functions. PGlite has a single connection, so this
  doesn't exercise true parallel contention.
- `src/lib/server/supabase.integration.test.ts`: live Supabase tests,
  including a truly concurrent counter test. **Skipped** unless
  `SUPABASE_INTEGRATION_TESTS=1` and credentials are set.

## Story pages (Blossom is the reference)

A future gets a story page at `/futures/<slug>/story` as soon as its
`storyStatus` is `ready`; until then its hero shows "Story Coming Soon".
Blossom is the complete example — copy its shape for the next future:

| Piece | Where |
|---|---|
| Intro, five scenes, profile, three projects | `src/data/stories/blossom.ts` |
| Wiring into the future | `src/data/futures.ts` (Blossom entry) |
| Scene and project artwork | `public/stories/blossom/`, `public/projects/blossom/` (listed in `src/data/assets.ts`) |
| Per-scene interactions (by `interactionId`) | `src/components/story/SceneInteraction.tsx` |
| Playable creations (by `interactionId`) | `src/components/projects/ProjectPlayground.tsx`, rules in `src/lib/projects/` |
| Where the hidden secret sits | `SECRET_SPOTS` in `src/app/futures/[slug]/story/page.tsx` |

Progress uses the shared journey store: opening the hero discovers the
future, reaching scene 5 completes its story, and the hidden collectible is
saved with `collectSecret`. Nothing new is stored in the database.
