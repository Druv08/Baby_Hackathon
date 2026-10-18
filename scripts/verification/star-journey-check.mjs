// Real-browser check of Star progress + Hidden Constellation. Usage: node star-journey-check.mjs <port> <origin> [width]
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
async function go(path) { const l = new Promise((r) => loads.push(r)); await send("Page.navigate", { url: origin + path }); await l; await sleep(1100); await ev(`document.documentElement.style.scrollBehavior = "auto"`); }
const saved = () => ev(`JSON.parse(localStorage.getItem("maria:journey-progress") ?? "null")`);
async function clickEl(js) {
  const box = await ev(`(() => { const el = ${js}; if (!el) return null; el.scrollIntoView({ block: "center", behavior: "instant" }); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  if (!box) throw new Error("missing " + js);
  await sleep(200);
  for (const type of ["mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: box.x, y: box.y, button: "left", clickCount: 1 });
  await sleep(400);
}
const faint = (label) => `[...document.querySelectorAll("#scene-2 button")].find(b => b.getAttribute("aria-label") === ${JSON.stringify(label)})`;
const toast = () => ev(`document.querySelector('[aria-live="polite"][data-visible="true"]')?.innerText.replace(/\\s+/g, " ").trim() ?? ""`);

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

await Promise.all([send("Page.enable"), send("Runtime.enable")]);
await send("Emulation.setDeviceMetricsOverride", { width: W, height: 900, deviceScaleFactor: 1, mobile: W < 600 });
await send("Storage.clearDataForOrigin", { origin, storageTypes: "local_storage" });

await go("/futures/star");
let p = await saved();
check("Opening Star's hero discovers it without completing the story", p?.discoveredForms?.includes(3) && p.completedStories.length === 0, JSON.stringify(p));

await go("/futures/star/story");
const faintBefore = await ev(`(() => { const s = ${faint("A very faint star")}.querySelector("span"); return Number(getComputedStyle(s).opacity); })()`);
check("Secret stars start faint (easy to miss)", faintBefore > 0 && faintBefore < 0.7, String(faintBefore));
// A wrong order quietly resets; the right path lights the constellation.
await clickEl(faint("A very faint star")); await clickEl(faint("A third faint star"));
p = await saved();
check("A wrong connection doesn't unlock anything", p.easterEggsFound.length === 0 && (await toast()) === "");
await clickEl(faint("A very faint star")); await clickEl(faint("Another faint star")); await clickEl(faint("A third faint star"));
const t1 = await toast(); p = await saved();
check("Joining the faint stars shows 'You found the Hidden Constellation!' and the count", /You found the Hidden Constellation!/.test(t1) && /Secrets found: 1 \/ 8/.test(t1), t1);
check("Saved through the existing secret system as secret 3", JSON.stringify(p.easterEggsFound) === "[3]", JSON.stringify(p.easterEggsFound));
const glowing = await ev(`document.querySelectorAll("#scene-2 [data-glowing=true] line").length`);
check("The secret constellation glows", glowing === 2, String(glowing));
await sleep(4800);
await clickEl(`[...document.querySelectorAll("#scene-2 button")].find(b => b.getAttribute("aria-label") === "Hidden Constellation star")`);
await clickEl(`[...document.querySelectorAll("#scene-2 button")].filter(b => b.getAttribute("aria-label") === "Hidden Constellation star")[1]`);
await clickEl(`[...document.querySelectorAll("#scene-2 button")].filter(b => b.getAttribute("aria-label") === "Hidden Constellation star")[2]`);
const t2 = await toast(); p = await saved();
check("Finding it again doesn't increase progress", /already found/.test(t2) && /Secrets found: 1 \/ 8/.test(t2) && p.easterEggsFound.length === 1, t2);

await ev(`document.getElementById("scene-5").scrollIntoView({ block: "start", behavior: "instant" })`); await sleep(400);
await ev(`window.scrollBy(0, document.getElementById("scene-5").getBoundingClientRect().height - 600)`); await sleep(1000);
p = await saved();
check("Reaching scene 5 completes Star's story (only Star's)", JSON.stringify(p.completedStories) === "[3]", JSON.stringify(p.completedStories));

await go("/futures/star/story");
check("After reload: the constellation is still lit", (await ev(`document.querySelectorAll("#scene-2 [data-glowing=true] line").length`)) === 2);
await go("/journey");
const stats = await ev(`[...document.querySelectorAll("dl div")].map(d => d.innerText.replace(/\\s+/g, " ").trim()).join(" | ")`);
check("My Journey shows 1 explored, 1 finished, 1 secret", stats.includes("explored 1 / 8") && stats.includes("finished 1 / 8") && stats.includes("found 1 / 8"), stats);

await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await go("/futures/star/story");
const rm = await ev(`(() => { const layer = [...document.querySelectorAll("[aria-hidden=true]")].find(e => getComputedStyle(e).position === "fixed" && !e.querySelector("img")); const bg = [...document.images].find(i => /background/.test(i.src));
  return { starfield: layer ? getComputedStyle(layer).display : "none", landscape: !!bg && getComputedStyle(bg.parentElement).display !== "none" }; })()`);
check("Reduced motion: moving starfield hidden, observatory background kept", rm.starfield === "none" && rm.landscape, JSON.stringify(rm));

check("No console errors or warnings", problems.length === 0, problems.join("\n      "));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail && !r.ok ? `\n      ${r.detail}` : ""}`);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed (width ${W})`);
ws.close();

process.exitCode = results.every((result) => result.ok) ? 0 : 1;
