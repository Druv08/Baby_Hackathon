# Browser verification

These dependency-free Node.js scripts preserve the real Edge checks from the
Cloud implementation handoff. Use Node 22+ and a disposable browser profile:
the journey checks reset visitor progress on the supplied local origin.

1. Run `npm run build`, then `npm run start -- -p 3137`.
2. Launch Edge/Chromium with `--headless=new --remote-debugging-port=9333`
   and a dedicated `--user-data-dir` in your temporary directory.
3. Run checks sequentially because journey checks share browser localStorage.

```powershell
node scripts/verification/cloud-story-check.mjs 9333 http://localhost:3137 1920 1080
node scripts/verification/cloud-story-check.mjs 9333 http://localhost:3137 1366 768
node scripts/verification/cloud-story-check.mjs 9333 http://localhost:3137 390 844
node scripts/verification/cloud-play-check.mjs 9333 http://localhost:3137 1366
node scripts/verification/cloud-play-check.mjs 9333 http://localhost:3137 390
node scripts/verification/cloud-journey-check.mjs 9333 http://localhost:3137 1366
node scripts/verification/cloud-journey-check.mjs 9333 http://localhost:3137 390
node scripts/verification/browser-check.mjs 9333 http://localhost:3137
```

Star regression uses `star-story-check`, `star-play-check`, and
`star-journey-check`. Blossom uses `fix-check`, `play-check`, and `journey-check`.
Their argument order matches the corresponding Cloud scripts. All check scripts
exit unsuccessfully if an assertion fails. The site-wide pending-story check
uses Aqua, whose story remains pending.

The Cloud artwork check scrolls each illustration into view and awaits decoding
before checking lazy-loaded images. Reveal and completion checks scroll their
actual targets into view instead of relying on a fixed scene-height offset.

Postcard downloads go to ignored `.next/cloud-verification/downloads`.
`shoot.mjs` accepts a debugger port, URL, output directory, and one or more
`name:WIDTHxHEIGHT[:mobile]` screenshot specifications.
