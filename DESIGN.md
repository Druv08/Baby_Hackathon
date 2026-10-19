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
Portfolio owns journals and projects; SceneInteraction owns optional story activities; the journey store owns discovery, completion and secrets. A shared Melody audio hook owns optional sound and cancellable playback. All activities work silently and by keyboard. Stop audio on mute, reset, navigation, document hiding and leaving a project viewport.

## Do's and Don'ts
Keep canonical designs unchanged. Only scene 5 reveals Melody's outfit. Report mismatched artwork and keep incomplete content draft. Respect reduced motion; never duplicate progress storage.
