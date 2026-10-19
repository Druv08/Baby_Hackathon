# Maria hackathon tier audit

Implementation: `f02487d8835c35c43e9d97a70ebe3976f94d39b1`, on `integration/final-main`.
Audited the existing application first. Reused its story, project, sound, cursor, progress and moderated Supabase implementations. No dependencies or canonical artwork were added or replaced.

| Requirement | Result | Evidence / limitation |
| --- | --- | --- |
| Tier 1: pointer reaction + touch | Complete | Original portraits tilt rigidly by at most 2.5 degrees. Mouse exit resets; tap and keyboard greet; reduced motion disables rotation. |
| Tier 1: scroll-driven story | Complete | Five-scene progress follows the visible scene; scene links animate native smooth scrolling. |
| Tier 1: palette + expression | Partial | Persistent day/night palette changes site chrome and home veil. No approved expression variants exist in the repository; faces were preserved. |
| Tier 1: responsive layouts | Complete in tested scope | Home/header fit 320, 390, 768, 1000, 1024, 1366 and 1920px. Forest/Melody stories and Memory Book fit desktop, tablet and phone. |
| Tier 1: discoverable Easter egg | Complete | Melody's golden note records its canonical secret in saved progress. |
| Tier 2: Lullaby Lab | Complete | Existing Web Audio produces eight scheduled notes at distinct musical frequencies; global mute cancels every source immediately. |
| Tier 2: Forest map | Complete | SVG route ink follows viewport entry. Existing creature restrictions, invalid-route feedback, backtracking and delivery win remain playable. |
| Tier 2: playable game | Complete | Browser completed Rabbit → Oak Cottage through Riverside Trail and Golden Bridge, after testing an unsuitable log route. |
| Tier 2: optional page-turn / flashlight | Deferred | Optional scope; core work took priority. |
| Tier 3: live Memory Book | Complete | Live global and Luna submissions returned 202, remained pending and hidden. Shared manual refresh works. Approved display, literal text, accessible dialog and 45-second polling verified with isolated browser fixtures. |
| Tier 3: returning visitor | Complete | Reload preserves discovered futures and displays the saved exploration count in the welcome greeting. |
| Tier 3: Lighthouse 90+ | Partial | Desktop meets all four targets; mobile Performance is 88. Other mobile categories are 100. |
| +13: Live Guestbook | Complete | Shared moderated Memory Book; no duplicate backend. |
| +13: Sparkle Cursor Trail | Complete | All nine themed routes; bounded particles expire; touch and reduced motion suppress trail. |
| +13: Hit Counter Odometer | Complete | Real database count, one POST per session, no route-change increments, honest outage state. |
| +13: Click Sounds + Mute | Complete | Character click and background audio preserved; shared mute persists and stops Melody; remembered sound waits for a gesture. |
| +13: Responsive Chaos Mode | Complete | Opt-in ribbon and bounded motion fit desktop/tablet/phone; reduced motion respected. |

## Actual Lighthouse results

Optimized local production build at `http://localhost:3000`, Microsoft Edge headless, standard mobile and desktop presets. These are homepage lab scores, not measurements of the public Vercel deployment or every story route.

| Preset | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 88 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

AVIF/WebP delivery, a 512px image candidate, accurate home portrait sizes, image priorities, matching accessible names, robots.txt and sitemap.xml were added. Source images remain unchanged. Remaining mobile opportunities include render-blocking styles, font delivery and JavaScript work. Exact versions, timestamps and metrics: [tier-lighthouse.json](tier-lighthouse.json).

## Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test -- --run`: 493 passed, 3 skipped; 46 files passed, 1 skipped. The explicitly gated live Supabase integration suite remains skipped; production was not used for its concurrency test.
- `npm run build`: passed, including all eight generated future stories.
- Tier browser checks: 35 passed, no runtime exceptions; [tier-browser.json](tier-browser.json).
- Existing bonus browser checks: 57 passed, no unexpected errors; [side-quests-browser.json](side-quests-browser.json).
- Two live test messages were verified pending and deleted by their exact owned IDs. No test memory was approved; no visitor data or moderation rules were changed.
- Canonical asset integrity tests passed. All nine character files, eight stories and portfolios remain intact; teammate cursor/audio contributions remain wired.

## Remaining work, in priority order

1. Supply approved expression artwork for the palette toggle, then wire and verify that transition. This is the only unmet Tier 1 behavior.
2. Raise mobile homepage Performance from 88 to 90+; extend Lighthouse coverage to individual stories and Memory Book.
3. Merge/deploy the tested integration branch through the existing production workflow, then repeat deployment-level checks. This audit pushes the authorized branch; it does not update `main` or claim production deployment.
4. Optional accessible page-turn/nightlight polish. No WebGL or chat was introduced.
