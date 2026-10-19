// Plays Blossom's creations in a real browser via CDP. Usage: node play-check.mjs <port> <origin> [width]
const [port, origin, width = "1366"] = process.argv.slice(2);
const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
const problems = [];
const loads = [];
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) return pending.get(m.id)(m), pending.delete(m.id);
  if (m.method === "Page.loadEventFired") loads.splice(0).forEach((r) => r());
  if (m.method === "Runtime.exceptionThrown") problems.push("exception: " + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text));
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

// Real mouse click on the first visible button/link whose text includes `text` within `scope`.
async function click(text, scope = "body") {
  const box = await ev(`(() => {
    const root = document.querySelector(${JSON.stringify(scope)});
    const el = [...root.querySelectorAll("button, a")].find(e => (e.textContent + " " + (e.getAttribute("aria-label") ?? "")).includes(${JSON.stringify(text)}) && !e.disabled);
    if (!el) return null;
    el.scrollIntoView({ block: "center", behavior: "instant" });
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`);
  if (!box) throw new Error(`No enabled control "${text}" in ${scope}`);
  await sleep(150);
  for (const type of ["mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: box.x, y: box.y, button: "left", clickCount: 1 });
  await sleep(350);
}
async function key(k, code, kc) {
  for (const type of ["keyDown", "keyUp"]) await send("Input.dispatchKeyEvent", { type, key: k, code, windowsVirtualKeyCode: kc });
  await sleep(200);
}
const text = (sel) => ev(`document.querySelector(${JSON.stringify(sel)})?.innerText.replace(/\\s+/g, " ").trim() ?? null`);

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

await Promise.all([send("Page.enable"), send("Runtime.enable")]);
await send("Emulation.setDeviceMetricsOverride", { width: Number(width), height: 900, deviceScaleFactor: 1, mobile: Number(width) < 600 });
const loaded = new Promise((r) => loads.push(r));
await send("Page.navigate", { url: `${origin}/futures/blossom/story` });
await loaded;
await sleep(1200);

// ── Dream Garden ───────────────────────────────────────────────────────
const G = "#project-dream-garden";
const gStatus = () => text(`${G} [role=status]`);
const seen = [await gStatus()];
await click("Moonbell", G); seen.push(await gStatus());
await click("Plant the seed", G); seen.push(await gStatus());
await click("Water it", G); seen.push(await gStatus());
await sleep(1800); seen.push(await gStatus()); // grows on its own
await click("Give it sunshine", G); seen.push(await gStatus());
const flowerDrawn = await ev(`!!document.querySelector("${G} svg ellipse")`);
await click("Celebrate", G); seen.push(await gStatus());
check("Dream Garden: every action changes what the visitor sees", new Set(seen).size === seen.length, seen.join(" | "));
check("Dream Garden: a flower is drawn after blooming", flowerDrawn);
const grown = await ev(`[...document.querySelectorAll("${G} p")].map(p => p.innerText.replace(/\s+/g, " ").trim()).find(t => t.startsWith("Grown today")) ?? null`);
await click("Plant another", G);
check("Dream Garden: restart returns to seed choice and keeps the grown flower", (await gStatus()).startsWith("Pick a seed") && /Grown today/.test(grown ?? ""), grown);

// ── Bloom Book ─────────────────────────────────────────────────────────
const B = "#project-bloom-book";
await click("Bloom Book", B);
const page1 = await text(`${B} h4`);
await click("Next", B);
const page2 = await text(`${B} h4`);
await ev(`document.querySelector("${B} [role=group]").focus()`);
await key("ArrowRight", "ArrowRight", 39);
const page3 = await text(`${B} h4`);
await key("ArrowLeft", "ArrowLeft", 37);
const back = await text(`${B} h4`);
const prevDisabledAtStart = await (async () => {
  await click("Go to Sunblush", B);
  return ev(`[...document.querySelectorAll("${B} button")].find(b => b.textContent.includes("Previous")).disabled`);
})();
check("Bloom Book: opens and Next turns the page", page1 === "Sunblush Daisy" && page2 === "Moonbell", `${page1} → ${page2}`);
check("Bloom Book: arrow keys turn pages", page3 === "Whisper Lily" && back === "Moonbell", `→ ${page3}, ← ${back}`);
check("Bloom Book: Previous is disabled on the first page", prevDisabledAtStart);

// ── Butterfly Corner ───────────────────────────────────────────────────
const C = "#project-butterfly-corner";
await click("Golden Sunbell", C);
const s1 = await text(`${C} [role=status]`);
await click("Sky Blossom", C);
const s2 = await text(`${C} [role=status]`);
const count = await ev(`[...document.querySelectorAll("${C} strong")].map(s => s.textContent).find(t => t.startsWith("Butterflies discovered"))`);
check("Butterfly Corner: each flower brings its own butterfly", /Golden Flutter arrived/.test(s1) && /Skywing arrived/.test(s2), `${s1.slice(0, 40)} | ${s2.slice(0, 40)}`);
check("Butterfly Corner: collection counts discoveries", count === "Butterflies discovered: 2 / 3", count);

// ── Navigation ─────────────────────────────────────────────────────────
const explore = await ev(`[...document.querySelectorAll("a")].find(a => a.textContent.includes("Explore My Creations"))?.getAttribute("href")`);
check('Reveal: "Explore My Creations" leads to the portfolio', explore === "#portfolio", explore);
const brokenImgs = await ev(`[...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src)`);
check("All images on the story page loaded", brokenImgs.length === 0, brokenImgs.join(", "));

check("No console errors or warnings", problems.length === 0, problems.join("\n      "));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `\n      ${r.detail}` : ""}`);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed (width ${width})`);
ws.close();

process.exitCode = results.every((result) => result.ok) ? 0 : 1;
