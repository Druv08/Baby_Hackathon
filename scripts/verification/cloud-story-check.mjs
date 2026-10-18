// Real-browser checks for the Cloud story. Usage: node cloud-story-check.mjs <port> <origin> <width> <height>
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

// Hero → Enter Cloud Path
await go("/futures/cloud");
const enter = await ev(`[...document.querySelectorAll("a")].find(a => a.textContent.includes("Enter Cloud Path"))?.getAttribute("href")`);
check("Hero: 'Enter Cloud Path' links to the story", enter === "/futures/cloud/story", String(enter));

await go("/futures/cloud/story");
const intro = await ev(`[document.querySelector("h1")?.textContent, ...[...document.querySelectorAll("p")].map(p => p.textContent).filter(t => t.includes("Sky Explorer") || t.startsWith("One little red panda"))]`);
check("Intro: Cloud Path, subtitle and blurb", intro[0] === "Cloud Path" && intro.some((t) => t === "How Maria became the Sky Explorer") && intro.some((t) => t.startsWith("One little red panda. A lost little cloud.")), intro.join(" | "));
const introMaria = await ev(`decodeURIComponent([...document.querySelectorAll("section")][0].querySelector("img")?.currentSrc ?? "").match(/characters\\/\\d\\.png/)?.[0]`);
check("Intro shows Normal Maria (1.png)", introMaria === "characters/1.png", introMaria);
await clickEl(`[...document.querySelectorAll("a")].find(a => a.textContent.includes("Start Story"))`);
await sleep(400);
check("Intro: Start Story goes to scene 1", (await ev("location.hash")) === "#scene-1");

// Layout
const band = `document.querySelector('nav[aria-label="Story progress"]')`;
const jumps = [];
for (const n of [1, 2, 3, 4, 5]) {
  await ev(`location.hash = ""; location.hash = "#scene-${n}"`); await sleep(400);
  jumps.push(await ev(`(() => { const b = ${band}.getBoundingClientRect(); const s = document.getElementById("scene-${n}");
    return { n: ${n}, bandBottom: Math.round(b.bottom), first: Math.round(Math.min(...[...s.querySelectorAll("[class*=frame], [class*=panel], h2")].map(e => e.getBoundingClientRect().top))) }; })()`));
}
check("Layout: after jumping to scenes 1–5, content starts below the progress band", jumps.every((j) => j.first >= j.bandBottom && j.first < H), JSON.stringify(jumps.map((j) => `${j.n}:${j.bandBottom}/${j.first}`)));
const header = await ev(`(() => { const h = document.querySelector("header"); const b = ${band}.getBoundingClientRect(); return { headerBottom: Math.round(h.getBoundingClientRect().bottom), bandTop: Math.round(b.top) }; })()`);
check("Layout: progress band sits under the site header, not over it", header.bandTop >= header.headerBottom - 1, JSON.stringify(header));
const labels = await ev(`[...document.querySelectorAll("[id^=scene-] *")].filter(e => e.children.length === 0 && /^Scene \\d/.test(e.textContent.trim())).length`);
const titles = await ev(`[1,2,3,4,5].map(n => document.getElementById("scene-" + n + "-title")?.textContent)`);
check('No "Scene X" labels inside story cards', labels === 0, String(labels));
check("All five Cloud titles render", titles.join("|") === "The Cloud That Fell From the Sky|One Little Step Above the Clouds|Lost in the Endless Sky|The Bridge That Reached the Sky|Becoming the Sky Explorer", titles.join(" | "));
const order = await ev(`[1,2,3,4].map(n => { const s = document.getElementById("scene-" + n); const f = s.querySelector("[class*=sceneInner] > [class*=frame]").getBoundingClientRect(); const p = s.querySelector("[class*=sceneInner] > [class*=panel]").getBoundingClientRect(); return Math.abs(f.left - p.left) < 4 ? (f.top < p.top ? "img-first" : "text-first") : (f.left < p.left ? "img-left" : "text-left"); })`);
const stacked = order.every((o) => o.endsWith("first"));
const wantOrder = stacked ? ["img-first", "img-first", "img-first", "img-first"] : ["img-left", "text-left", "img-left", "text-left"];
check("Layout alternates image/text (stacked image-first on narrow screens)", order.join() === wantOrder.join(), order.join());

// Background
const bg = await ev(`(() => { const img = [...document.images].find(i => /stories(%2F|\\/)cloud(%2F|\\/)background/.test(i.src)); if (!img) return null; const l = img.parentElement.getBoundingClientRect();
  return { loaded: img.complete && img.naturalWidth > 0, fixed: getComputedStyle(img.parentElement).position, fit: getComputedStyle(img).objectFit, covers: l.top <= 0 && l.bottom >= innerHeight }; })()`);
check("Background: sky-island artwork loads as a fixed, cover-cropped layer", bg?.loaded && bg.fixed === "fixed" && bg.fit === "cover" && bg.covers, JSON.stringify(bg));
const noStar = await ev(`[...document.images].every(i => !/stories(%2F|\\/)star/.test(i.src))`);
check("No Star artwork on the Cloud page", noStar);
const imgs = await ev(`(async () => { for (const n of [1,2,3,4,5]) { const img = document.querySelector("#scene-" + n + " img"); img.scrollIntoView({ block: "center", behavior: "instant" }); await img.decode(); await new Promise(r => setTimeout(r, 200)); }
  return [1,2,3,4,5].map(n => { const i = [...document.querySelectorAll("#scene-" + n + " img")].find(x => /stories(%2F|\\/)cloud(%2F|\\/)scene-/.test(x.src)); if (!i) return { n, ok: false }; const r = i.getBoundingClientRect(); return { n, ok: i.complete && i.naturalWidth > 0, fit: getComputedStyle(i).objectFit, ratio: +(r.width / r.height).toFixed(2) }; }); })()`);
check("All five scene illustrations load uncropped at their own aspect ratio", imgs.every((i) => i.ok && i.fit !== "cover" && Math.abs(i.ratio - 1672 / 941) < 0.03), JSON.stringify(imgs));
const bgVisible = await ev(`(async () => { const out = []; for (const y of [0.25, 0.5, 0.75]) { window.scrollTo(0, (document.body.scrollHeight - innerHeight) * y); await new Promise(r => setTimeout(r, 200)); const b = [...document.images].find(i => /cloud(%2F|\\/)background/.test(i.src)).getBoundingClientRect(); out.push(b.top <= 0 && b.bottom >= innerHeight); } return out; })()`);
check("Background stays in view while scrolling through the story", bgVisible.every(Boolean), JSON.stringify(bgVisible));

// Scene 1: worried cloud
const s1a = await status(1);
await clickEl(btnIn(1, "worried little cloud"));
const lvl1 = await ev(`document.querySelector("#scene-1 [data-level]").dataset.level`);
await clickEl(btnIn(1, "worried little cloud")); await clickEl(btnIn(1, "worried little cloud"));
const s1b = await status(1);
check("Scene 1: tapping the worried cloud bounces/brightens it, without solving anything", s1a !== s1b && lvl1 === "1" && /never been so high/.test(s1b), `${s1a} → ${s1b}`);

// Scene 2: steps in order (skipping wobbles)
await clickEl(btnIn(2, "Cloud step 3"));
const wob = await ev(`document.querySelector('#scene-2 [data-wobble=true]')?.getAttribute("aria-label")`);
const s2w = await status(2);
for (const n of [1, 2, 3]) await clickEl(btnIn(2, `Cloud step ${n}`));
const s2 = await status(2);
check("Scene 2: a skipped step wobbles; three steps in order climb above the waterfall", /wobbles/.test(s2w) && /Cloud step 3/.test(wob ?? "") && /Being brave/.test(s2), `${s2w} → ${s2}`);

// Scene 3: chimes
await clickEl(btnIn(3, "left wind chime"));
const s3a = await status(3); const drift = await ev(`document.querySelector("#scene-3 [data-drift]").dataset.drift`);
await clickEl(btnIn(3, "right wind chime"));
const s3b = await status(3); const found = await ev(`document.querySelector("#scene-3 [data-found]").dataset.found`);
check("Scene 3: a wrong chime moves the clouds the wrong way", /not the way/.test(s3a) && drift === "down", s3a);
check("Scene 3: the right chime reveals the way to the island", /showing the way/.test(s3b) && found === "true", s3b);

// Scene 4: keyboard-only bridge (wrong fit first)
async function press(label) { await ev(`(${btnIn(4, label)}).focus()`); await key("Enter", "Enter", 13); }
await press("Small cloud"); await press("Gap 1");
const s4w = await status(4);
for (const [cloud, gap] of [["Big cloud", "Gap 1"], ["Small cloud", "Gap 2"], ["Medium cloud", "Gap 3"]]) { await press(cloud); await press(gap); }
const s4 = await status(4);
const complete = await ev(`document.querySelector("#scene-4 [data-complete]").dataset.complete`);
check("Scene 4: a wrong-sized cloud is refused", /doesn’t fit/.test(s4w), s4w);
check("Scene 4: keyboard alone builds the glowing bridge", complete === "true" && /We did it/.test(s4), s4);

// Reveal
await ev(`document.querySelector("#scene-5 [data-variant=clouds]").scrollIntoView({ block: "center", behavior: "instant" })`); await sleep(800);
const reveal = await ev(`(() => { const s = document.getElementById("scene-5"); const imgs = [...s.querySelectorAll("img")].map(i => decodeURIComponent(i.currentSrc || i.src)); const card = imgs.find(x => x.includes("characters"));
  return { scene: imgs.some(x => x.includes("cloud/scene-5")), card: card?.match(/characters\\/\\d\\.png/)?.[0], name: s.innerText.includes("Cloud Maria — The Sky Explorer"), tagline: s.innerText.includes("I can go somewhere I've never been before."), explore: [...s.querySelectorAll("a")].some(a => a.textContent.includes("Explore My Creations")), puffs: s.querySelector("[data-variant=clouds]")?.dataset.shown }; })()`);
check("Reveal: scene-5 art, Cloud Maria's 4.png, name, tagline, Explore button and cloud puffs", reveal.scene && reveal.card === "characters/4.png" && reveal.name && reveal.tagline && reveal.explore && reveal.puffs === "true", JSON.stringify(reveal));
await clickEl(`[...document.querySelectorAll("#scene-5 a")].find(a => a.textContent.includes("Explore My Creations"))`); await sleep(400);
check("Explore My Creations goes to the portfolio", (await ev("location.hash")) === "#portfolio");
const ret = await ev(`[...document.querySelectorAll("a")].find(a => a.textContent.includes("Return to Eight Futures"))?.getAttribute("href")`);
check("Return to Eight Futures link present", ret === "/#futures", String(ret));
const ambient = await ev(`[...document.querySelectorAll("[aria-hidden=true]")].some(e => getComputedStyle(e).position === "fixed" && e.querySelectorAll("span").length >= 10 && getComputedStyle(e).display !== "none")`);
check("Sky atmosphere layer (clouds, wind, petals, lanterns) is running", ambient);

const overflow = await ev(`document.documentElement.scrollWidth - innerWidth`);
check("No horizontal overflow", overflow <= 0, `${overflow}px`);
check("No console errors or warnings", problems.length === 0, problems.join("\n      "));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail && !r.ok ? `\n      ${r.detail}` : ""}`);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed (${W}x${H})`);
ws.close();

process.exitCode = results.every((result) => result.ok) ? 0 : 1;
