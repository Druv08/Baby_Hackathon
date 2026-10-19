# Melody Maria implementation report

Project-picture update: The user selected the supplied songbook image for Rhythm Garden and the guitar performance image for Moonlight Music Box. These now replace the two SVG card previews. Only the story scene artwork corrections remain pending; the original implementation report below records the earlier review state.

Melody's story, portfolio and three musical activities are implemented on `feature/forest-story`. The experience remains an explicitly labeled artwork preview because the supplied files do not fully match the brief. The normal `/futures/melody/story` route stays unavailable until those gaps are resolved; other futures retain their readiness rules.

Open `/futures/melody`, then **Preview Melody Path (artwork in progress)**, or open `/futures/melody/preview` directly. Preview metadata disables indexing. To publish the final story, supply the missing illustrations and pass the existing readiness validation before marking the content ready.

## Artwork

See [melody-artwork.md](melody-artwork.md) for all nine original filenames, destination paths and inspection results. Source files were copied without alteration. All nine canonical character files and existing hero artwork remain unchanged, verified by the existing asset-integrity tests.

Scenes 1–4 show scarf-only Normal Maria; Scene 5 shows Melody Maria's lavender musical outfit. Scene 1 keeps its actual 4:3 aspect ratio. Scene 2 needs the guitar discovery illustration; Scene 3 needs the listening scene with the bunny. Rhythm Garden and Moonlight Music Box need their actual illustrations. Supplied project 3, which explicitly says “Lullaby Lab,” is correctly assigned to that project. Unrelated performance and Dream Songbook art is preserved under descriptive filenames and never presented as the missing project artwork. Generated SVG previews represent the actual implemented garden and music box while their supplied illustrations are missing.

## Story and portfolio

The five scenes contain the full approved narration, alternate image and narration layouts and use character IDs `[1, 1, 1, 1, 8]`. The shared story renderer provides the introduction, fixed moonlit village background, navigation, large reveal, journal portfolio and return links. Scene activities include a wind chime, five playable guitar notes, three musical moods, a four-note melody builder and a reveal celebration. Decorative notes and stars respect reduced motion. Long narration and activities remain on parchment panels.

The musician's journal includes the character profile, About Me, What I Do, strengths, journey, motto and three project entries:

- **Lullaby Lab:** eight individually editable steps; five pitches; soft piano, music box and bell timbres; selected-note playback, visible playhead, stop and reset.
- **Rhythm Garden:** four distinct flowers, visual/audio sequences, three difficulty settings, increasing round length, success and wrong-choice feedback, replay and reset. Repeated flowers pulse separately.
- **Moonlight Music Box:** three shapes, three different melodies, four light colors, a live preview, open/close controls, dream-village reveal, play/stop and reset. Opening never starts audio automatically.

All three implementations are live and playable in the preview. Story and portfolio metadata remain draft pending correct artwork. Lullaby Lab's own artwork metadata is ready; the other two project artwork records remain draft.

## Sound and progress

Web Audio synthesis is local and requires no new libraries, remote music services or audio files. Sound starts off and shares one session preference across Melody activities. Muting cancels playback; notes replace prior voices; starting another sound activity cancels the previous player. Reset, stop, closing the box, leaving the project viewport, hiding the document and unmounting cancel playback. Components disconnect nodes, close their contexts and cancel timers. Unsupported audio produces a text status and leaves visual playback usable.

The Golden Musical Note uses the existing `secret-note` ID and preserves the canonical display name **Secret Note** in the journey registry. Discovery shows the golden-note message and collects through `useJourneyProgress`; repeated taps do not add progress. The shared store saves Future 8 discovery and Scene 5 completion across reloads without completing other futures or adding a second storage structure. Preview completion uses that same store.

No Supabase tables, migrations, API handlers, environment files, Memory Book, visitor-counter or rate-limit code were changed. No secret keys were committed. Luna content and readiness are untouched. Existing Cloudflare setup edits remain outside these implementation commits.

## Verification

- `npm.cmd run typecheck`: passed.
- `npm.cmd run lint`: passed with no warnings.
- `npm.cmd test -- --run`: 432 passed, 3 skipped; 38 passing test files and one skipped integration file. The skipped Supabase integration tests require their external test environment.
- `npm.cmd run build`: passed, including static generation of the preview. The initial sandbox build could not fetch the existing Google Fonts; the authorized network-enabled build succeeded.
- Real Edge/Chromium production-browser checks at **1920×1080**, **1366×768**, and **390×844** cover hero entry, draft disclosure, five scene loads, fixed background, sticky-navigation spacing, overflow, silent defaults, actual oscillator pitch, instrument octave, keyboard play, stop/mute/reset, viewport cleanup, game matching and wrong answers, replay, music-box customization, secret deduplication, saved completion and reload, and reduced motion. See the `melody-browser-*.json` evidence files for results. Browser console problems: none.
- `scripts/verification/melody-check.mjs` preserves the checks and can run against a disposable Edge debugger profile. It resets only the supplied local origin's visitor progress. Usage: `node scripts/verification/melody-check.mjs 9333 http://localhost:3137 390 844`.
- Manual screenshot review checked desktop sequencer and mobile music-box controls, plus the introduction on both sizes. No image stretching or horizontal overflow was found.
- DESIGN.md validator: zero errors. It reports one advisory warning about no primary color, because the existing per-character theme remains the canonical accent owner.
- Strict UI audit: two pre-existing findings in `ConstellationBuilder.tsx` (form validation ownership) and `CloudPostcards.tsx` (textarea resize evidence). No Melody findings remain. See [melody-ui-audit.json](melody-ui-audit.json). Other characters were intentionally left unchanged.

## Git

Work stayed on `feature/forest-story`. No branch was created, merged, deleted or force-pushed. Git author configuration was preserved and no AI co-author metadata was added.

The first four verified milestones were pushed as `e4c9ce9` (artwork), `615574b` (story data), `be0bad3` (interactive story preview), and `aff09be` (portfolio and playable projects). A fifth milestone contains the secret, audio cleanup, regression evidence and this handoff. Use `git log -5 --oneline` for its final SHA.

Remaining acceptance gap: corrected artwork is needed before the standard Enter Melody Path journey can be marked ready. No replacement images were generated automatically.
