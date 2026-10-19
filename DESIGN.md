---
version: alpha
colors:
  paper: "#fff8f2"
  ink: "#45263c"
  lavender: "#cdb8f0"
  gold: "#f6c56b"
typography:
  display:
    fontFamily: "Caveat, cursive"
  body:
    fontFamily: "Nunito, sans-serif"
rounded:
  panel: "1.25rem"
---
# Maria storybook

## Overview
A gentle illustrated storybook for visitors exploring independent futures. Preserve the established artwork, parchment panels and continuous landscape. Melody's signature is a playable score in the moonlit village.

## Colors
Runtime tokens remain canonical (model B): src/app/globals.css owns paper, ink, lavender and gold. src/data/future-themes.ts owns character accents. Controls consume the existing CSS variables.

## Typography
Caveat display and Nunito body use the existing font-display and font-body CSS variables. Long narration stays readable.

## Layout
Reuse StoryProgress, StoryText, StoryCompletion and Portfolio. Alternate image and narration, then show a large reveal. Keep activities in document flow with sticky-navigation scroll offsets.

## Shapes
Reuse panel radii and pill buttons.

## Components
Nightlight is a local moonbeam over a separate Star/Luna picture, never over navigation or narration. MemoryStorybook consumes the existing filtered approved feed; its folded-paper spread is the new signature interaction. Authored character conversations reuse native dialog semantics from the Memory Book. The optional 3D studio loads only after interaction. Its geometry-based Normal Maria interpretation was explicitly approved by the user on 2026-10-19; it does not replace any canonical illustration. See UX-CONTRACT.md for ownership.

Portfolio owns journals and projects; SceneInteraction owns optional story activities; the journey store owns discovery, completion and secrets. A shared Melody audio hook owns optional sound and cancellable playback. All activities work silently and by keyboard. Stop audio on mute, reset, navigation, document hiding and leaving a project viewport.

Native HTML select owns the small note, instrument and difficulty lists. Operating-system popup appearance and standard keyboard behavior are intentional. No custom listbox or application-owned menu is needed for these short lists.

The header owns site effects through SiteControls. SoundSettings is the single persistent mute owner for teammate audio and Melody's projects; a remembered sound preference still waits for a new document gesture before audio plays. Chaos Mode is opt-in and keeps its stickers in a reserved ribbon, with bounded card motion. CursorTrail preserves the paw cursors and draws at most 24 brief particles on precise mouse devices, with no trail for touch or reduced motion. VisitOdometer consumes the existing session counter, never invents values, and leaves unavailable counts as text. Guestbook refresh is owned by useMemoryFeed and shared by the global Memory Book and Luna; only approved API responses populate the lanterns.

## Do's and Don'ts
Portraits may tilt their complete original image by at most 2.5 degrees; never animate facial pixels. Tap and keyboard greeting use the same button, with a reduced-motion alternative. The persistent day/night palette changes reading chrome and world veils. Normal Maria crossfades to the user-approved dreamy expression at night; the other eight characters retain their canonical portraits until their own expression variants are approved. Forest route ink and its traveler follow viewport entry without replacing the delivery reducer or landmark controls. Tablets collapse navigation at 1000px to keep all three site controls usable.

Keep canonical designs unchanged. Only scene 5 reveals Melody's outfit. Report mismatched artwork and keep incomplete content draft. Respect reduced motion; never duplicate progress storage.
