// Real-browser checks for the Star story. Usage: node star-story-check.mjs <port> <origin> <width> <height>
const [port, origin, width = "1366", height = "768"] = process.argv.slice(2);
const W = Number(width), H = Number(height);
const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map(), problems = [], loads = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) return pending.get(m.id)(m), pending.delete(m.id);
  if (m.method === "Page.loadEventFired") loads.splice(0).forEach((r) => r());
  if (m.method === "Runtime.exceptionThrown") problems.push("exception: " + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text));
  if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type))
    problems.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 200)}`);
});
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
async function go(path) { const l = new Promise((r) => loads.push(r)); await send("Page.navigate", { url: origin + path }); await l; await sleep(1200); await ev(`document.documentElement.style.scrollBehavior = "auto"`); }
async function clickEl(js) {
  const box = await ev(`(() => { const el = ${js}; if (!el) return null; el.scrollIntoView({ block: "center", behavior: "instant" }); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  if (!box) throw new Error("missing element: " + js);
  await sleep(150);
  for (const type of ["mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: box.x, y: box.y, button: "left", clickCount: 1 });
  await sleep(350);
}
async function key(k, code, kc) { await send("Input.dispatchKeyEvent", { type: "keyDown", key: k, code, windowsVirtualKeyCode: kc, text: k === "Enter" ? String.fromCharCode(13) : undefined }); await send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: kc }); await sleep(150); }
const status = (sceneId) => ev(`document.querySelector("#scene-${sceneId} [role=status]")?.innerText.replace(/\\s+/g, " ").trim()`);
const btnIn = (sceneId, label) => `[...document.querySelectorAll("#scene-${sceneId} button")].find(b => (b.getAttribute("aria-label") ?? b.textContent).includes(${JSON.stringify(label)}))`;

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

await Promise.all([send("Page.enable"), send("Runtime.enable")]);
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: W < 600 });

// Hero → Enter Star Path
await go("/futures/star");
const enter = await ev(`[...document.querySelectorAll("a")].find(a => a.textContent.includes("Enter Star Path"))?.getAttribute("href")`);
check("Hero: 'Enter Star Path' links to the story", enter === "/futures/star/story", String(enter));
const heroImg = await ev(`decodeURIComponent([...document.images].map(i => i.currentSrc || i.src).find(s => s.includes("characters")) ?? "").match(/characters\\/\\d\\.png/)?.[0]`);
check("Hero: Star page shows Star's design (9.png file), not Luna's", heroImg === "characters/9.png", heroImg);

await go("/futures/star/story");
const intro = await ev(`[document.querySelector("h1")?.textContent, ...[...document.querySelectorAll("p")].map(p => p.textContent).filter(t => t.includes("Dream Mapper") || t.startsWith("One little red panda"))]`);
check("Intro: Star Path, subtitle and blurb", intro[0] === "Star Path" && intro.some((t) => t === "How Maria became the Dream Mapper") && intro.some((t) => t.startsWith("One little red panda")), intro.join(" | "));
await clickEl(`[...document.querySelectorAll("a")].find(a => a.textContent.includes("Start Story"))`);
await sleep(400);
check("Intro: Start Story goes to scene 1", (await ev("location.hash")) === "#scene-1");

// Layout: band never overlaps content; no scene labels; titles intact
const band = `document.querySelector('nav[aria-label="Story progress"]')`;
const jumps = [];
for (const n of [1, 2, 3, 4, 5]) {
  await ev(`location.hash = ""; location.hash = "#scene-${n}"`); await sleep(400);
  jumps.push(await ev(`(() => { const b = ${band}.getBoundingClientRect(); const s = document.getElementById("scene-${n}");
    return { n: ${n}, bandBottom: Math.round(b.bottom), first: Math.round(Math.min(...[...s.querySelectorAll("[class*=frame], [class*=panel], h2")].map(e => e.getBoundingClientRect().top))) }; })()`));
}
check("Layout: after jumping to scenes 1–5, content starts below the progress band", jumps.every((j) => j.first >= j.bandBottom && j.first < H), JSON.stringify(jumps.map((j) => `${j.n}:${j.bandBottom}/${j.first}`)));
const labels = await ev(`[...document.querySelectorAll("[id^=scene-] *")].filter(e => e.children.length === 0 && /^Scene \\d/.test(e.textContent.trim())).length`);
const titles = await ev(`[1,2,3,4,5].map(n => document.getElementById("scene-" + n + "-title")?.textContent)`);
check('No "Scene X" labels inside story cards', labels === 0, String(labels));
check("All five Star titles render", titles.join("|") === "The Night of a Thousand Questions|The Forgotten Observatory|The Stars That Wouldn’t Connect|Connecting the Forgotten Dreams|Becoming the Dream Mapper", titles.join(" | "));

// Background
const bg = await ev(`(() => { const img = [...document.images].find(i => i.src.includes("stories%2Fstar%2Fbackground") || i.src.includes("stories/star/background")); if (!img) return null; const l = img.parentElement.getBoundingClientRect();
  return { loaded: img.complete && img.naturalWidth > 0, fixed: getComputedStyle(img.parentElement).position, fit: getComputedStyle(img).objectFit, covers: l.top <= 0 && l.bottom >= innerHeight }; })()`);
check("Background: observatory artwork loads as a fixed, cover-cropped layer", bg?.loaded && bg.fixed === "fixed" && bg.fit === "cover" && bg.covers, JSON.stringify(bg));
const imgs = await ev(`(async () => { for (const n of [1,2,3,4,5]) { document.getElementById("scene-" + n).scrollIntoView({ block: "center", behavior: "instant" }); await new Promise(r => setTimeout(r, 500)); }
  return [1,2,3,4,5].map(n => { const i = [...document.querySelectorAll("#scene-" + n + " img")].find(x => /stories(%2F|\\/)star(%2F|\\/)scene-/.test(x.src)); return i ? { n, ok: i.complete && i.naturalWidth > 0, fit: getComputedStyle(i).objectFit } : { n, ok: false }; }); })()`);
check("All five scene illustrations load uncropped (no cover crop)", imgs.every((i) => i.ok && i.fit !== "cover"), JSON.stringify(imgs));

// Scene 1: lonely star twinkles, never connects
const s1a = await status(1);
await clickEl(btnIn(1, "lonely star")); await clickEl(btnIn(1, "lonely star"));
const s1b = await status(1);
check("Scene 1: tapping the lonely star makes it twinkle brighter", s1a !== s1b && /alone/.test(s1b), `${s1a} → ${s1b}`);

// Scene 2: telescope reveals the map
const coverW = () => ev(`Number(document.querySelector("#scene-2 svg rect:last-of-type").getAttribute("width"))`);
const w0 = await coverW();
await clickEl(btnIn(2, "Look through the telescope"));
const w1 = await coverW(); const s2 = await status(2);
check("Scene 2: telescope reveals part of the star map", w1 < w0 && /corner of the map/.test(s2), `${w0} → ${w1}; ${s2}`);

// Scene 3: wrong line fades, right lines glow
await clickEl(btnIn(3, "Star near the window")); await clickEl(btnIn(3, "Faraway star"));
const s3a = await status(3);
const rejectedVisible = await ev(`document.querySelectorAll("#scene-3 svg line").length`);
await clickEl(btnIn(3, "Bright star above")); await clickEl(btnIn(3, "Star over the bridge"));
const s3b = await status(3);
check("Scene 3: a wrong connection softly fades (no harsh failure)", /fades away/.test(s3a) && rejectedVisible === 1, s3a);
check("Scene 3: the right stars connect and glow", /Maria understands/.test(s3b), s3b);

// Scene 4: keyboard-only completion
for (const label of ["Friendship star", "Adventure star", "Remember-me star", "Hope star", "Homeward star"]) {
  await ev(`(${btnIn(4, label)}).focus()`);
  await key("Enter", "Enter", 13);
}
const s4 = await status(4);
const lines4 = await ev(`document.querySelectorAll("#scene-4 svg line").length`);
check("Scene 4: keyboard alone connects the dreams and completes the Dream Map", /Dream Map is complete/.test(s4) && lines4 === 4, `${lines4} lines; ${s4}`);

// Reveal
const reveal = await ev(`(() => { const s = document.getElementById("scene-5"); const card = [...s.querySelectorAll("img")].map(i => decodeURIComponent(i.currentSrc || i.src)).find(x => x.includes("characters"));
  return { card: card?.match(/characters\\/\\d\\.png/)?.[0], name: s.innerText.includes("Star Maria — The Dream Mapper"), tagline: s.innerText.includes("I can turn questions into discoveries."), explore: [...s.querySelectorAll("a")].some(a => a.textContent.includes("Explore My Creations")) }; })()`);
check("Reveal: Star Maria's own design, name, tagline and Explore button", reveal.card === "characters/9.png" && reveal.name && reveal.tagline && reveal.explore, JSON.stringify(reveal));

const overflow = await ev(`document.documentElement.scrollWidth - innerWidth`);
check("No horizontal overflow", overflow <= 0, `${overflow}px`);
check("No console errors or warnings", problems.length === 0, problems.join("\n      "));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail && !r.ok ? `\n      ${r.detail}` : ""}`);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed (${W}x${H})`);
ws.close();

process.exitCode = results.every((result) => result.ok) ? 0 : 1;
