// Real-browser check of Blossom progress + Golden Seed. Usage: node journey-check.mjs <port> <origin> [width]
const [port, origin, width = "1366"] = process.argv.slice(2);
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
async function go(path) {
  const loaded = new Promise((r) => loads.push(r));
  await send("Page.navigate", { url: origin + path });
  await loaded;
  await sleep(1000);
}
const saved = () => ev(`JSON.parse(localStorage.getItem("maria:journey-progress") ?? "null")`);
async function clickSelector(sel) {
  const box = await ev(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return null;
    el.scrollIntoView({ block: "center", behavior: "instant" }); const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  if (!box) throw new Error("missing " + sel);
  await sleep(200);
  for (const type of ["mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: box.x, y: box.y, button: "left", clickCount: 1 });
  await sleep(500);
}
const toast = () => ev(`document.querySelector('[aria-live="polite"][data-visible]')?.innerText.replace(/\\s+/g, " ").trim() ?? ""`);

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

await Promise.all([send("Page.enable"), send("Runtime.enable")]);
await send("Emulation.setDeviceMetricsOverride", { width: Number(width), height: 900, deviceScaleFactor: 1, mobile: Number(width) < 600 });
await send("Storage.clearDataForOrigin", { origin, storageTypes: "local_storage" });

await go("/futures/blossom");
let p = await saved();
check("Opening Blossom's hero discovers it but doesn't complete the story", p?.discoveredForms?.includes(2) && p.completedStories.length === 0, JSON.stringify(p));

await go("/futures/blossom/story");
p = await saved();
check("Story isn't complete at the top of the story page", p?.completedStories.length === 0);

const seedSel = 'button[aria-label="A tiny golden glimmer"]';
await clickSelector(seedSel);
const t1 = await toast();
p = await saved();
check("Golden Seed: clicking shows the message and the secret count", /You found the Golden Seed!/.test(t1) && /Secrets found: 1 \/ 8/.test(t1), t1);
check("Golden Seed: saved as secret 2", JSON.stringify(p.easterEggsFound) === "[2]", JSON.stringify(p.easterEggsFound));
await clickSelector('button[aria-label^="Golden Seed"]');
const t2 = await toast();
p = await saved();
check("Golden Seed: a second click doesn't increase the count", /already found/.test(t2) && /Secrets found: 1 \/ 8/.test(t2) && p.easterEggsFound.length === 1, t2);

await ev(`document.getElementById("scene-5").scrollIntoView({ block: "start", behavior: "instant" })`);
await sleep(400);
await ev(`window.scrollBy(0, document.getElementById("scene-5").getBoundingClientRect().height - 600)`);
await sleep(900);
p = await saved();
const note = await ev(`[...document.querySelectorAll('[role=status]')].map(e => e.innerText).find(t => t.includes("Story complete")) ?? ""`);
check("Reaching scene 5 completes Blossom's story", JSON.stringify(p.completedStories) === "[2]" && /Story complete/.test(note), `${JSON.stringify(p.completedStories)} ${note}`);

await go("/futures/blossom/story");
const foundLabel = await ev(`!!document.querySelector('button[aria-label^="Golden Seed"]')`);
check("After reload: the seed shows as already found", foundLabel);

await go("/journey");
const stats = await ev(`[...document.querySelectorAll("dl div")].map(d => d.innerText.replace(/\\s+/g, " ").trim())`);
check("My Journey shows 1 future explored, 1 story finished, 1 secret", JSON.stringify(stats).includes("explored 1 / 8") && JSON.stringify(stats).includes("finished 1 / 8") && JSON.stringify(stats).includes("found 1 / 8"), stats.join(" | "));

await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await go("/futures/blossom/story");
const petals = await ev(`(() => { const s = [...document.querySelectorAll("[aria-hidden=true]")].find(e => getComputedStyle(e).position === "fixed" && !e.querySelector("img")); const bg = [...document.images].find(i => i.src.includes("background.png")); return s ? getComputedStyle(s).display + (bg && getComputedStyle(bg.parentElement).display !== "none" ? "+landscape-visible" : "+landscape-missing") : "none"; })()`);
const floatAnim = await ev(`getComputedStyle(document.querySelector('button[aria-label^="Golden Seed"] span')).animationName`);
check("Reduced motion: drifting petals hidden and seed shimmer stopped", petals === "none+landscape-visible" && floatAnim === "none", `petals=${petals} seed=${floatAnim}`);

check("No console errors or warnings", problems.length === 0, problems.join("\n      "));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `\n      ${r.detail}` : ""}`);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed (width ${width})`);
ws.close();

process.exitCode = results.every((result) => result.ok) ? 0 : 1;
