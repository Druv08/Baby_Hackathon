// Real-browser check of Cloud progress + Secret Rainbow Cloud. Usage: node cloud-journey-check.mjs <port> <origin> [width]
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
const secretBtn = `document.querySelector("#scene-3 button[aria-label*='cloud' i][data-found]")`;
const toast = () => ev(`document.querySelector('[aria-live="polite"][data-visible="true"]')?.innerText.replace(/\\s+/g, " ").trim() ?? ""`);
const H = W < 600 ? 844 : 900;
async function tapAt(js) {
  const box = await ev(`(() => { const el = ${js}; if (!el) return null; el.scrollIntoView({ block: "center", behavior: "instant" }); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  if (!box) throw new Error("missing " + js);
  await sleep(200);
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x, y: box.y }] });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await sleep(400);
}
const mobile = W < 600;
const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

await Promise.all([send("Page.enable"), send("Runtime.enable")]);
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile });
if (mobile) await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
const press = mobile ? tapAt : clickEl;
await send("Storage.clearDataForOrigin", { origin, storageTypes: "local_storage" });

await go("/futures/cloud");
let p = await saved();
check("Opening Cloud's hero discovers it without completing the story", p?.discoveredForms?.includes(4) && p.completedStories.length === 0, JSON.stringify(p));

await go("/futures/cloud/story");
const spot = await ev(`(() => { const b = ${secretBtn}; const img = [...document.querySelectorAll("#scene-3 img")].find(i => /cloud(%2F|\\/)scene-3/.test(i.src)).getBoundingClientRect(); const r = b.getBoundingClientRect();
  return { inside: r.left >= img.left && r.right <= img.right + 1 && r.top >= img.top && r.bottom <= img.bottom + 1, size: Math.round(r.width) + "x" + Math.round(r.height), label: b.getAttribute("aria-label"), rainbow: getComputedStyle(b.querySelector("g")).opacity }; })()`);
check("The tiny cloud sits inside the scene 3 illustration, with a 44px+ target, rainbow hidden", spot.inside && /^4[4-9]x4[4-9]$/.test(spot.size) && spot.label === "A tiny drifting cloud" && spot.rainbow === "0", JSON.stringify(spot));

await press(secretBtn);
const t1 = await toast(); p = await saved();
check("Tapping it shows 'You found the Secret Rainbow Cloud!' and the count", /You found the Secret Rainbow Cloud!/.test(t1) && /Secrets found: 1 \/ 8/.test(t1), t1);
check("Saved through the existing secret system as secret 4", JSON.stringify(p.easterEggsFound) === "[4]", JSON.stringify(p.easterEggsFound));
await sleep(1000);
const lit = await ev(`(() => { const b = ${secretBtn}; return { found: b.dataset.found, rainbow: getComputedStyle(b.querySelector("g")).opacity, glow: getComputedStyle(b.querySelector("svg > path")).filter }; })()`);
check("The cloud glows and a rainbow appears", lit.found === "true" && lit.rainbow === "1" && /drop-shadow/.test(lit.glow), JSON.stringify(lit));
await sleep(4600);
await press(secretBtn);
const t2 = await toast(); p = await saved();
check("Tapping it again doesn't increase the count", /already found the Secret Rainbow Cloud/.test(t2) && /Secrets found: 1 \/ 8/.test(t2) && p.easterEggsFound.length === 1, t2);

await ev(`document.querySelector("#scene-5 [data-done]").scrollIntoView({ block: "center", behavior: "instant" })`); await sleep(400);
await sleep(1000);
p = await saved();
check("Reaching scene 5 completes Cloud's story (only Cloud's)", JSON.stringify(p.completedStories) === "[4]", JSON.stringify(p.completedStories));

await go("/futures/cloud/story");
check("After reload: the rainbow cloud is still lit", (await ev(`${secretBtn}.dataset.found`)) === "true");
await go("/journey");
const stats = await ev(`[...document.querySelectorAll("dl div")].map(d => d.innerText.replace(/\\s+/g, " ").trim()).join(" | ")`);
check("My Journey shows 1 explored, 1 finished, 1 secret", stats.includes("explored 1 / 8") && stats.includes("finished 1 / 8") && stats.includes("found 1 / 8"), stats);

await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await go("/futures/cloud/story");
const rm = await ev(`(() => { const layer = [...document.querySelectorAll("[aria-hidden=true]")].find(e => getComputedStyle(e).position === "fixed" && !e.querySelector("img")); const bg = [...document.images].find(i => /cloud(%2F|\\/)background/.test(i.src));
  const anims = [...document.querySelectorAll("#scene-1 button, #scene-3 [data-found], #scene-2 [data-next]")].map(e => getComputedStyle(e).animationName);
  return { sky: layer ? getComputedStyle(layer).display : "none", landscape: !!bg && getComputedStyle(bg.parentElement).display !== "none", anims }; })()`);
check("Reduced motion: moving sky layer and looping animations off, landscape kept", rm.sky === "none" && rm.landscape && rm.anims.every((a) => a === "none"), JSON.stringify(rm));

check("No console errors or warnings", problems.length === 0, problems.join("\n      "));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail && !r.ok ? `\n      ${r.detail}` : ""}`);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed (width ${W})`);
ws.close();

process.exitCode = results.every((result) => result.ok) ? 0 : 1;
