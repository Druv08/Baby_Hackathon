# Maria interaction owners

Audience: English-language illustrated storybook, all ages, desktop and touch devices. Preserve the authored art, Nunito/Caveat typography and existing character palettes.

| Capability | Canonical owner | Contract |
| --- | --- | --- |
| Theme | nightPreference + PaletteTheme | One stored preference; trusted pre-paint bootstrap; light reading surfaces retain dark readable text. |
| Expressions | APPROVED_EXPRESSIONS + CharacterExpression | Reviewed variants only. Keep canonical PNGs unchanged. Missing variants fall back to their own character. |
| Form | Existing memory schema/hooks; chat and name forms use native labelled fields | Inline text errors, no native validation popups; names stay local; chat never submits to guestbook. |
| Select/Listbox | Existing native select | OS popup behavior is intentional for short instrument/note lists. |
| Dialog | Native HTML dialog, as in MemoryBook | showModal, accessible title, Escape, inert background and return focus to launcher. Chat uses the same browser-owned behavior. |
| Feedback | Existing inline role=status / role=alert | Text remains in context; no alert/confirm/prompt. |
| Scrollbar | globals.css | Shared visible themed scrollbars; forced-colors uses browser colors. |
| Public CRUD | Existing /api/memories and Supabase stores | Public insert is explicitly pending, reads approved only; validation, honeypot and rate limits preserved. No public moderation. |
| Audio | soundSettings + CharacterAmbience + useMelodyAudio | One persistent mute. Explicit gesture, no audio on chat/3D launch. Stop on mute/navigation/hidden document. |
| Visitor memory | Existing versioned progressStore | Keep name optional and local; greetings describe actual discovered/completed progress. |
| Page turns | MemoryStorybook | Existing filtered feed only; native controls, scoped arrows, swipe, Escape, one transition at a time, reduced-motion immediate page. |
| 3D | MariaStudioLauncher / MariaStudio | User-approved geometry interpretation; explicit lazy load, keyboard alternatives, hidden/offscreen pause and GPU disposal. Canonical illustrations remain unchanged. |

The existing origin stories retain document scrolling. Nightlight capture is limited to its separate illustration area. No essential navigation or narration is masked. Three-dimensional drag capture belongs only to the studio canvas.
