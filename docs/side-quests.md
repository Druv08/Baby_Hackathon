# Hackathon side quests

All five side quests are implemented using the existing APIs and teammate assets.

| Quest | Implementation | Verification |
|---|---|---|
| Live guestbook | `useMemoryBook.ts`, `MemoryRefresh.tsx`; shared global/Luna feed, manual refresh and visible-page polling every 45 seconds; existing moderation and rate limits unchanged | Real browser submissions stored as pending in Supabase, excluded from the public feed; approved display and the real polling interval tested with browser-only fixtures. All five temporary pending test records were deleted by their exact IDs; no approved test entries were created. |
| Cursor trail | `CursorTrail.tsx`, `side-quests.ts`; nine themes, maximum 24 particles, 650ms lifetime, listeners and animation frames cleaned up | All nine character routes, bounded particles, expiry, touch and reduced-motion checks passed. Original paw cursor files are unchanged. |
| Visit odometer | `VisitOdometer.tsx`; animated digit reels use the existing session-aware `useVisitCounter` | Real Supabase count displayed; one visit POST across route changes/reloads; unavailable API shows text instead of an invented count. |
| Click sounds and mute | `CharacterAmbience.tsx`, `sound-settings.ts`, `SiteControls.tsx`, Melody audio hook | Original character assets play and switch correctly; old track pauses; header mute persists, stops Melody, and remembered sound waits for a new gesture. |
| Responsive Chaos Mode | `ChaosMode.tsx/css`, header toggle, `FutureGrid.tsx` | Opt-in sticker ribbon reserves space, responsive arrangements and glowing/moving cards; 1920, 1366, 768 and 390px checks; no overflow, accessible controls, reduced-motion support. |

`docs/side-quests-browser.json` records **57 passing browser checks**. The approved-memory examples exist only in the browser test's intercepted responses; the application contains no fake memories or fake counter values. Verification is restricted to a local origin. Live write tests use a reserved test-client address without modifying rate-limit configuration.

Validation: typecheck and lint pass; **493 tests pass, 3 live-integration tests skip**; production build passes. Strict UI audit reports four existing form/textarea detection findings in Star, Cloud, Luna and Memory Book; no side-quest control findings. The two shared guestbook textareas explicitly disable resizing at runtime. Existing Supabase handler tests cover validation, moderation, idempotency and rate limits.

No database tables, migrations, locked artwork, original cursor/audio files, or story content were changed. Claude's Memory Book layout is preserved; only its shared refresh control and hook were extended. Work stays on `integration/final-main` with scoped implementation commits and no branch merges by this task.
