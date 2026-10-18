// Plays Star's portfolio in a real browser. Usage: node star-play-check.mjs <port> <origin> <width>
const [port, origin, width = "1366"] = process.argv.slice(2);
const W = Number(width);
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
const ENTER = String.fromCharCode(13);
async function key(k, code, kc) { await send("Input.dispatchKeyEvent", { type: "keyDown", key: k, code, windowsVirtualKeyCode: kc, text: k === "Enter" ? ENTER : undefined }); await send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: kc }); await sleep(180); }
async function clickAt(js) {
  const box = await ev(`(() => { const el = ${js}; if (!el) return null; el.scrollIntoView({ block: "center", behavior: "instant" }); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, r: { x: r.x, y: r.y, w: r.width, h: r.height } }; })()`);
  if (!box) throw new Error("missing element: " + js);
  await sleep(150);
  for (const type of ["mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: box.x, y: box.y, button: "left", clickCount: 1 });
  await sleep(350);
  return box;
}
const inP = (pid, sel) => `document.querySelector("#project-${pid} ${sel}")`;
const btn = (pid, label) => `[...document.querySelectorAll("#project-${pid} button")].find(b => !b.disabled && ((b.getAttribute("aria-label") ?? "") + " " + b.textContent).includes(${JSON.stringify(label)}))`;
const text = (js) => ev(`(${js})?.innerText.replace(/\\s+/g, " ").trim() ?? null`);

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

await Promise.all([send("Page.enable"), send("Runtime.enable")]);
await send("Emulation.setDeviceMetricsOverride", { width: W, height: 900, deviceScaleFactor: 1, mobile: W < 600 });
const l = new Promise((r) => loads.push(r)); await send("Page.navigate", { url: `${origin}/futures/star/story` }); await l; await sleep(1200);
await ev(`document.documentElement.style.scrollBehavior = "auto"`);

// Portfolio sheet
const sheet = await ev(`(() => { const s = document.getElementById("portfolio"); return s ? s.innerText : ""; })()`);
check("Portfolio: Stargazing Journal with the full Dream Mapper sheet",
  ["Star Maria’s Stargazing Journal", "The Forgotten Observatory", "Mapping forgotten wishes into constellations", "Problem-solving", "Every question is the beginning of a new discovery."].every((t) => sheet.includes(t)));
const portrait = await ev(`decodeURIComponent([...document.querySelectorAll("#portfolio img")].map(i => i.currentSrc || i.src)[0] ?? "").match(/characters\\/\\d\\.png/)?.[0]`);
check("Portfolio: uses Star's own character design (9.png file)", portrait === "characters/9.png", portrait);

// Project cards
await ev(`document.getElementById("creations").scrollIntoView({ behavior: "instant" })`); await sleep(1500);
const cards = await ev(`[...document.querySelectorAll("#creations li")].slice(0, 3).map(li => { const img = li.querySelector("img"); return { title: li.querySelector("h3")?.textContent, img: decodeURIComponent(img?.currentSrc || img?.src || "").match(/projects\\/star\\/[\\w-]+\\.png/)?.[0], loaded: !!img && img.complete && img.naturalWidth > 0, play: li.querySelector("a")?.getAttribute("href") }; })`);
check("Cards: three illustrated cards with working Play links", cards.length === 3 && cards.every((c) => c.img && c.loaded && c.play?.startsWith("#project-")), JSON.stringify(cards));

// ── Constellation Builder (mouse) ──
const CB = "constellation-builder";
for (const s of ["Star 1", "Star 3", "Star 6"]) await clickAt(btn(CB, s));
const lines = await ev(`document.querySelectorAll("#project-${CB} svg line").length`);
const cbStatus = await text(inP(CB, "[role=status]"));
check("Builder: chosen stars connect with glowing lines", lines === 2 && /2 lines/.test(cbStatus), `${lines} lines; ${cbStatus}`);
await clickAt(btn(CB, "The Little Paw"));
const nameVal = await ev(`${inP(CB, "input")}.value`);
await clickAt(btn(CB, "Add to my sky"));
const sky = await text(`[...document.querySelectorAll("#project-${CB} p")].find(p => p.textContent.startsWith("My sky"))?.parentElement`);
const linesAfter = await ev(`document.querySelectorAll("#project-${CB} svg line").length`);
check("Builder: name it and add it to my sky; the board resets for a new one", nameVal === "The Little Paw" && /1 named constellation/.test(sky) && /The Little Paw/.test(sky) && linesAfter === 0, `${nameVal}; ${sky}; lines now ${linesAfter}`);
await clickAt(btn(CB, "Star 2")); await clickAt(btn(CB, "Star 4"));
await clickAt(btn(CB, "Clear"));
check("Builder: Clear empties the board", (await ev(`document.querySelectorAll("#project-${CB} svg line").length`)) === 0);

// ── Dream Atlas (mouse + keyboard) ──
const DA = "dream-atlas";
await clickAt(btn(DA, "Dream Atlas"));
const e1 = await text(inP(DA, "h4"));
await clickAt(btn(DA, "Next"));
const e2 = await text(inP(DA, "h4"));
await ev(`${inP(DA, "[role=group]")}.focus()`); await key("ArrowRight", "ArrowRight", 39);
const e3 = await text(inP(DA, "h4"));
const wish3 = await text(inP(DA, "[role=group]"));
check("Atlas: opens, Next and arrow keys move between entries", e1 === "The Homeward Star" && e2 === "The Friendship Lights" && e3 === "The Brave Little Comet", `${e1} → ${e2} → ${e3}`);
check("Atlas: each entry shows its wish, theme and constellation pattern", /I wish I was brave enough to explore/.test(wish3) && /Theme: Courage/.test(wish3) && (await ev(`${inP(DA, "svg")}.querySelectorAll("line").length`)) === 3);

// ── Telescope (keyboard, then tap) ──
const ST = "stargazers-telescope";
await ev(`${inP(ST, "[role=application]")}.scrollIntoView({ block: "center", behavior: "instant" })`);
await ev(`${inP(ST, "[role=application]")}.focus()`);
for (let i = 0; i < 5; i++) await key("ArrowDown", "ArrowDown", 40);
const t1 = await text(inP(ST, "[role=status]"));
check("Telescope: arrow keys move the lens and discover the Dream Nebula", /You discovered The Dream Nebula/.test(t1), t1);
const sky2 = await ev(`(() => { const r = ${inP(ST, "[role=application]")}.getBoundingClientRect(); return { x: r.x + r.width * 0.8, y: r.y + r.height * 0.24 }; })()`);
for (const type of ["mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: sky2.x, y: sky2.y, button: "left", clickCount: 1 });
await sleep(400);
const t2 = await text(inP(ST, "[role=status]"));
const count = await text(`[...document.querySelectorAll("#project-${ST} strong")].find(s => s.textContent.startsWith("Discoveries"))`);
check("Telescope: tapping the sky aims there and finds the Golden Moon", /Golden Moon/.test(t2) && count === "Discoveries: 2 / 3", `${t2.slice(0, 50)}; ${count}`);
await clickAt(btn(ST, "Reset sky"));
check("Telescope: reset clears discoveries", (await text(`[...document.querySelectorAll("#project-${ST} strong")].find(s => s.textContent.startsWith("Discoveries"))`)) === "Discoveries: 0 / 3");

const overflow = await ev(`document.documentElement.scrollWidth - innerWidth`);
check("No horizontal overflow", overflow <= 0, `${overflow}px`);
check("No console errors or warnings", problems.length === 0, problems.join("\n      "));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail && !r.ok ? `\n      ${r.detail}` : ""}`);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed (width ${W})`);
ws.close();

process.exitCode = results.every((result) => result.ok) ? 0 : 1;
