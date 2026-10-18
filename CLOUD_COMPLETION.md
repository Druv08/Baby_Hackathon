# Cloud Maria completion

Cloud Maria is Character 4, slug `cloud`. Work is on `feature/cloud-story`,
based on Star's completed branch, which already includes Blossom.

## Artwork

All nine destinations match their original files in
`C:\Users\druvk\Downloads\red pandas\4` by SHA-256. Source files were only read.
The two extra files in that folder were not substituted for approved artwork.
Canonical character checksums for all nine characters pass, including 1 and 4.

| Original filename | Destination under `public/` |
| --- | --- |
| cloud story 1.png | stories/cloud/scene-1.png |
| cloud story 2.png | stories/cloud/scene-2.png |
| cloud story 3.png | stories/cloud/scene-3.png |
| cloud story 4.png | stories/cloud/scene-4.png |
| cloud story 5.png | stories/cloud/scene-5.png |
| cloud background.png | stories/cloud/background.png |
| cloud project 1.png | projects/cloud/cloud-maker.png |
| cloud project 2.png | projects/cloud/sky-route-planner.png |
| cloud project 3.png | projects/cloud/cloud-postcards.png |

## Story and portfolio

Entry: `/futures/cloud` → `/futures/cloud/story` → Start Story.
The five scenes follow the supplied narrative, use Normal Maria in scenes 1–4,
and reveal canonical Cloud Maria in scene 5. The story alternates image/text
placement, stacks on phones, reserves room for sticky progress navigation,
and uses a continuous fixed sky-island background without stretching it.

Interactions include the worried cloud, ordered cloud steps, wind-chime
navigation, and a size-matching cloud bridge. The final reveal shows cloud
particles, the character's tagline, and Explore My Creations.

The Travel Journal portfolio contains the profile, six strengths, journey,
motto, and three live, playable projects:

- **Cloud Maker:** three shapes, color and size choices, multiple placement,
  keyboard placement, undo, and clear.
- **Sky Route Planner:** island selection, deterministic safe routes, blocked
  bridges and headwinds, success feedback, and reset.
- **Cloud Postcards:** three artwork crops, plain-text message, stickers,
  preview, copy, reset, and local PNG export.

## Content and progress

`src/data/stories/cloud.ts` supplies all five scenes through the existing
typed loader. Cloud's story and portfolio are ready; all three projects are
live. No tables or database migrations were added.

Opening Cloud discovers future 4. Reading the final completion marker saves
story 4. The Secret Rainbow Cloud in scene 3 uses the existing `secret-cloud`
identifier, shared toast, global count, and `maria:journey-progress` storage.
Repeated collection does not increase the count. Completion and the secret
survive reload. Reduced motion keeps the landscape while disabling ambient
movement.

## Verification

- Typecheck and ESLint pass.
- Vitest: 285 passed, 3 skipped; the skipped suite is opt-in live Supabase
  integration. Existing API, SQL, content, project, progress, and asset tests pass.
- Production build passes and generates all three ready story routes.
  The build needs network access for the existing Caveat and Nunito fonts.
- Cloud story: 25/25 at 1920×1080, 1366×768, and 390×844.
- Cloud portfolio/projects: 20/20 at widths 1366 and 390, including PNG export.
- Cloud secret/progress: 11/11 at widths 1366 and 390, including touch,
  duplicate collection, reload, completion, global counts, and reduced motion.
- Star regression at widths 1366 and 390: story 17/17, projects 13/13,
  secret/progress 12/12 at each width.
- Blossom regression at widths 1366 and 390: layout 11/11, projects 11/11,
  secret/progress 10/10 at each width.
- Site-wide: 16/16, covering 13 pages at 375px, navigation, keyboard focus,
  pending-story behavior, reduced motion, and console errors. Together these
  completed runs account for 301 passing browser assertions.
- Desktop and phone screenshots were visually inspected. No Cloud overflow
  or relevant console warnings/errors were observed.

Browser scripts and reproduction instructions are in `scripts/verification/`.
Lazy-image checks await decoding after scrolling each illustration into view;
reveal/completion checks scroll the actual target into view. Pending-story
regression uses Aqua, whose content remains unchanged.

## Backend limits

Read-only requests to `/api/memories` and `/api/visits` both returned the
existing safe `503 unavailable` response in this environment. Live Supabase
availability therefore could not be confirmed. No backend routes, environment
files, credentials, or schemas were changed. No Supabase secrets are included
in this changeset. The optional Python design auditor could not run because
Python is unavailable; project-owned checks and real-browser verification ran.

## Git checkpoints

The first four checkpoints were already pushed when this handoff resumed:

| Checkpoint | Commit |
| --- | --- |
| Artwork | `85793ef` |
| Story content | `a74a9ff` |
| Story frontend | `a48b95e` |
| Portfolio and projects | `39dfc12` |

The final checkpoint adds the Rainbow Cloud secret, progress tests, and
reproducible regression checks. Blossom and Star content and artwork remain
unchanged by the final checkpoint; other futures and canonical character
files are untouched. No Aqua or other new future was implemented.
