# Maria: complete three-tier audit

Audited and implemented on `integration/final-main`, starting from teammate commit `0733fa1`. Moderation checkpoint `0b6d882`; feature checkpoint `fb54c61`; targeted scene-bundle checkpoint `33469be`. The final verification commit follows these checkpoints. No merge into main, force push, or production deployment was performed.

## Tier 1

| Requirement | Status | Verified behavior |
| --- | --- | --- |
| Cursor-reactive characters | Complete | All nine rigid original portraits respond to mouse position. Touch and keyboard greeting work; reduced motion suppresses tilt. No facial pixels are deformed. |
| Scroll-driven stories | Complete | All eight stories retain Normal Maria introductions, five ordered scenes, visible-scene progress, forward/backward tracking and smooth scene navigation. |
| Palette and facial expression | Partial across all nine; complete for Normal | Persistent day/night palette changes chrome and world veils. Normal crossfades to the explicitly approved dreamy illustration after it loads. Each of the other eight retains its own canonical portrait through the safe fallback registry. Their expression variants still need artwork and approval. |
| Responsive layouts | Complete in tested scope | 22 routes at 1920×1080, 1366×768, 1024×768, 768×1024, 390×844 and 360×800; all eight phone portfolios retain three projects. Separate core checks also cover 320px. |
| Easter eggs | Complete | All eight real secrets collected and persisted through keyboard interaction; duplicates cannot increase the count. The existing eight-secret ending data now has a visible journey ending and toast link. Reload and phone layout verified. |

## Tier 2

| Requirement | Status | Verified behavior |
| --- | --- | --- |
| Real Lullaby Lab audio | Complete | Eight real Web Audio oscillators with distinct musical frequencies. Global mute cancels every scheduled source immediately; teammate audio controls remain the owner. |
| Nightlight cursor | Complete | Optional, locally scoped Star/Luna illustration with a radial moonbeam, three discoverable stars, pointer, touch and keyboard controls. Narration and navigation remain visible. |
| Dream Delivery Map | Complete | SVG route ink and a path-length-weighted traveler follow actual scrolling in both directions. Existing creature restrictions, unsuitable paths, backtracking and destination controls remain functional. |
| Page-turn storybook | Complete | Memory Book uses the same approved filtered feed; two-page desktop/one-page mobile spreads, animated leaf, buttons, arrow keys, swipe, rapid-input lock, Escape and reduced motion. No duplicate storage or backend. |
| Functional mini-game | Complete | Browser completes the Rabbit delivery via Riverside Trail and Golden Bridge to Oak Cottage, after testing forbidden/unsuitable routes. Existing project logic is preserved. |

## Tier 3

| Requirement | Status | Verified behavior |
| --- | --- | --- |
| Actual interactive 3D | Complete; visually approved | `/meet-maria` loads real Three.js geometry only after opening. Actual camera rotation, tilt, zoom, reset, waving paw, head look and body bounce verified. Mobile controls, context-loss fallback and GPU buffer disposal tested. The user explicitly approved this rendered interpretation; canonical PNGs remain unchanged. |
| Live moderated guestbook | Complete implementation; production writes deliberately excluded from this audit | Live Supabase approved-feed/count GETs succeed. Public insert explicitly uses `pending`; API, store and moderation/security tests pass. Browser fixtures verify pending feedback, approved display, literal text, filtering, polling, errors and page turns. No public write fixture reaches the real database and no entry was auto-approved. |
| Returning-visitor memory | Complete | Existing LocalStorage store retains discovery, completion, secrets and an optional name. Revisited forms show context from actual saved progress, distinguishing opened from completed stories. No invented progress. |
| Character-specific conversations | Complete | All nine have distinct authored voices, relevant story/project links and rule-based responses. Empty/unknown input, literal text, focus return, mobile layout and per-character sessions verified. No AI API, credentials or new persistence. |
| Lighthouse 90+ | Partial | All desktop routes and four of six mobile routes meet 90+ in all four categories. Forest story mobile Performance is 88 and Lullaby Lab is 85; all Accessibility, Best Practices and SEO scores are 100. |

## Actual Lighthouse scores

Lighthouse 13.5.0, local optimized production server, Microsoft Edge headless, standard mobile/desktop presets, sequential runs without competing browser tests. Scores are Performance / Accessibility / Best Practices / SEO. Homepage mobile ran three times: 90, 91, 91; the table reports the median. Other rows use one run per preset. See [timestamps, metrics and remaining audits](legendary-lighthouse.json).

| Tested route | Mobile | Desktop |
| --- | --- | --- |
| `/` | **91 / 100 / 100 / 100** | 99 / 100 / 100 / 100 |
| `/futures/melody` | **91 / 100 / 100 / 100** | 100 / 100 / 100 / 100 |
| `/futures/forest/story` | **88 / 100 / 100 / 100** | 99 / 100 / 100 / 100 |
| `/memory-book` | **90 / 100 / 100 / 100** | 100 / 100 / 100 / 100 |
| `/futures/melody/story#project-lullaby-lab` | **85 / 100 / 100 / 100** | 97 / 100 / 100 / 100 |
| `/meet-maria` | **96 / 100 / 100 / 100** | 100 / 100 / 100 / 100 |

The 3D score measures the entry page before explicit renderer loading; active 3D is functionally tested separately. These are lab scores, not Vercel production measurements. Lighthouse printed an internal `LanternError: NO_LCP` insight warning on the fragment-target Lullaby runs, but exited successfully, returned numeric category scores, and reported no runtime error or run warnings in the result JSON. The two sub-90 mobile results remain recorded. Their main bottleneck is the simulated largest-contentful full-screen background paint, plus font and render-blocking stylesheet delivery; no visual assets were removed to raise a score.

## Existing +13 side quests

All five are preserved and verified: live moderated guestbook, sparkle cursor trail, real hit-counter odometer, click sounds plus global mute, and responsive opt-in Chaos Mode. The isolated bonus browser suite passes 57 checks, including the real polling interval, one visit POST per session, touch/reduced-motion exclusions and honest outage feedback. Teammate paw assets, cursors and audio remain intact.

## Verification

- Typecheck: passed. ESLint: passed with zero warnings.
- Unit/security/content tests: **527 passed, 0 failed, 3 skipped**, across 52 test files. Three skipped tests belong to the explicitly gated live Supabase integration suite; it was not run against production.
- Optimized Next.js production build: passed, all eight static future/story routes generated.
- [Core browser checks](tier-browser.json): 36 passed, including actual musical source cancellation and bidirectional SVG traveler movement.
- [Feature browser checks](legendary-browser.json): 126 passed, including all nine chats, all eight stories, real 3D controls and disposal, expression persistence, page turning and nightlight.
- [Responsive checks](responsive-browser.json): 140 passed.
- [Secrets and ending](secrets-browser.json): 20 passed.
- [Bonus browser checks](side-quests-browser.json): 57 passed. Public POSTs are intercepted in the browser; actual GETs remain live.
- [Strict UI audit](premium-audit.json): zero findings.
- Canonical-art hash tests pass for all nine locked designs. All eight stories, portfolios and 24 project registrations remain intact.

Performance changes preserve the source illustrations and same Caveat/Nunito typography. Local licensed Latin fonts, AVIF/WebP delivery, correct image priorities, disabled unnecessary story prefetch, lazy project/scene bundles and explicit mobile scene-link accessible names reduce delivery cost. First-load story JavaScript falls from the audited 295 kB to 154 kB. Three.js is the only new runtime dependency and is absent until the optional studio opens.

## Remaining work

1. Supply and approve dreamy expression variants for Blossom, Star, Cloud, Aqua, Inventor, Forest, Melody and Luna. The exact asset mapping and existing approvals are recorded in [art review](art-review/README.md). Safe canonical fallbacks remain active for these eight.
2. Raise Forest story mobile Performance from 88 and Lullaby Lab from 85 to 90+, focusing on the measured background LCP, font delivery and render-blocking styles. All other measured category targets pass.
3. Release this integration branch through the team's normal deployment workflow, then repeat checks against the deployed build. This audit does not claim that Vercel production already contains the pushed branch.
