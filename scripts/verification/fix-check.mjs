// Verifies the four Blossom visual fixes in a real browser. Usage: node fix-check.mjs <port> <origin> <width> <height>
const [port, origin, width = "1366", height = "768"] = process.argv.slice(2);
const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
const problems = [];
const loads = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) return pending.get(m.id)(m), pending.delete(m.id);
  if (m.method === "Page.loadEventFired") loads.splice(0).forEach((r) => r());
  if (m.method === "Runtime.exceptionThrown") problems.push("exception: " + m.params.exceptionDetails.text);
  if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type))
    problems.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 200)}`);
});
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const i = ++id;
    pending.set(i, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)));
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

await Promise.all([send("Page.enable"), send("Runtime.enable")]);
await send("Emulation.setDeviceMetricsOverride", { width: Number(width), height: Number(height), deviceScaleFactor: 1, mobile: Number(width) < 600 });
const loaded = new Promise((r) => loads.push(r));
await send("Page.navigate", { url: `${origin}/futures/blossom/story` });
await loaded;
await sleep(1500);
await ev(`document.documentElement.style.scrollBehavior = "auto"`);

const band = `document.querySelector('nav[aria-label="Story progress"]')`;

// FIX 1a — in the natural layout, the band has its own space above scene 1.
const natural = await ev(`(() => {
  const b = ${band}.getBoundingClientRect(), s = document.getElementById("scene-1");
  const first = s.querySelector("[class*=frame], [class*=panel]").getBoundingClientRect();
  return { bandBottom: Math.round(b.bottom + scrollY), cardTop: Math.round(Math.min(...[...s.querySelectorAll("[class*=frame], [class*=panel]")].map(e => e.getBoundingClientRect().top)) + scrollY) };
})()`);
check("Fix 1: progress band has its own space above the first story card", natural.cardTop - natural.bandBottom >= 16, JSON.stringify(natural));

// FIX 1b — jumping to every scene leaves its card fully below the band.
const jumps = [];
const innerHeightVal = Number(height);
for (const n of [1, 2, 3, 4, 5]) {
  await ev(`location.hash = ""; location.hash = "#scene-${n}"`);
  await sleep(500);
  jumps.push(await ev(`(() => {
    const b = ${band}.getBoundingClientRect(), header = document.querySelector("header").getBoundingClientRect();
    const s = document.getElementById("scene-${n}");
    const tops = [...s.querySelectorAll("[class*=frame], [class*=panel], h2")].map(e => e.getBoundingClientRect().top);
    return { n: ${n}, bandTop: Math.round(b.top), headerBottom: Math.round(header.bottom), bandBottom: Math.round(b.bottom), firstContent: Math.round(Math.min(...tops)) };
  })()`));
}
check("Fix 1: band is never covered by the header, and pins right under it", jumps.every((j) => j.bandTop >= j.headerBottom - 2) && jumps.slice(1).every((j) => Math.abs(j.bandTop - j.headerBottom) <= 2), JSON.stringify(jumps.map((j) => [j.headerBottom, j.bandTop])));
check("Fix 1: after jumping to scenes 1–5, no card or title starts under the band", jumps.every((j) => j.firstContent >= j.bandBottom && j.firstContent < innerHeightVal), JSON.stringify(jumps.map((j) => `${j.n}: band ${j.bandBottom} / content ${j.firstContent}`)));

// FIX 2 — no "Scene X" labels inside story cards, progress nav still 1–5.
const labels = await ev(`[...document.querySelectorAll("[id^=scene-] *")].filter(e => e.children.length === 0 && /^Scene \\d/.test(e.textContent.trim())).map(e => e.textContent.trim())`);
const titles = await ev(`[1,2,3,4,5].map(n => document.getElementById("scene-" + n + "-title")?.textContent)`);
const dots = await ev(`[...${band}.querySelectorAll("a")].map(a => a.getAttribute("href"))`);
check('Fix 2: no "Scene X" labels remain in story cards', labels.length === 0, labels.join(", "));
check("Fix 2: all five story titles remain", titles.join("|") === "The Forgotten Garden|One Little Seed|Learning to Wait|The Garden Wakes Up|Becoming Blossom Maria", titles.join(" | "));
check("Fix 2: 1–5 progress navigation still present", dots.join(",") === "#scene-1,#scene-2,#scene-3,#scene-4,#scene-5", dots.join(","));

// FIX 3 — landscape loaded, fixed, cover-cropped and visible behind every scene.
const backdrop = await ev(`(() => {
  const img = [...document.images].find(i => i.src.includes("background.png"));
  if (!img) return null;
  const layer = img.parentElement, cs = getComputedStyle(layer), r = layer.getBoundingClientRect();
  return { loaded: img.complete && img.naturalWidth > 0, natural: img.naturalWidth + "x" + img.naturalHeight, position: cs.position, fit: getComputedStyle(img).objectFit, covers: r.top <= 0 && r.bottom >= innerHeight && r.width >= document.documentElement.clientWidth };
})()`);
check("Fix 3: Blossom landscape loads as a fixed, cover-cropped layer", backdrop?.loaded && backdrop.position === "fixed" && backdrop.fit === "cover" && backdrop.covers, JSON.stringify(backdrop));
const visibleAt = [];
for (const n of [1, 2, 3, 4, 5]) {
  await ev(`document.getElementById("scene-${n}").scrollIntoView({ block: "center", behavior: "instant" })`);
  await sleep(300);
  // Sample the page at the far edges, beside the story cards: the landscape must be what's painted there.
  visibleAt.push(await ev(`(() => {
    const pts = [[4, innerHeight * 0.5], [document.documentElement.clientWidth - 5, innerHeight * 0.6]];
    return pts.map(([x, y]) => { const el = document.elementFromPoint(x, y); return el && (el.closest("[aria-hidden=true]") || el.tagName === "SECTION" || el.tagName === "DIV") ? "ok" : el?.tagName; });
  })()`));
}
const covered = await ev(`(() => { const r = [...document.images].find(i => i.src.includes("background.png")).getBoundingClientRect(); return r.top <= 0 && r.bottom >= innerHeight; })()`);
check("Fix 3: landscape still covers the viewport after scrolling to scene 5", covered && visibleAt.flat().every((v) => v === "ok"), JSON.stringify(visibleAt));

// FIX 4 — Bloom Book card shows the new artwork.
await ev(`[...document.querySelectorAll("#creations li")].find(li => li.querySelector("h3")?.textContent === "Bloom Book").scrollIntoView({ block: "center" })`);
await sleep(1500);
const book = await ev(`(() => {
  const card = [...document.querySelectorAll("#creations li")].find(li => li.querySelector("h3")?.textContent === "Bloom Book");
  const img = card?.querySelector("img");
  return img ? { src: decodeURIComponent(img.currentSrc || img.src).match(/projects\\/blossom\\/[\\w-]+\\.png/)?.[0], loaded: img.complete && img.naturalWidth > 0, emoji: card.textContent.includes("📖"), button: !!card.querySelector('a[href="#project-bloom-book"]') } : null;
})()`);
check("Fix 4: Bloom Book card renders bloom-book.png with its Play button", book?.src === "projects/blossom/bloom-book.png" && book.loaded && !book.emoji && book.button, JSON.stringify(book));

const overflow = await ev(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
check("No horizontal overflow", overflow <= 0, `${overflow}px`);
check("No console errors or warnings", problems.length === 0, problems.join("\n      "));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `\n      ${r.detail}` : ""}`);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed (${width}x${height})`);
ws.close();

process.exitCode = results.every((result) => result.ok) ? 0 : 1;
