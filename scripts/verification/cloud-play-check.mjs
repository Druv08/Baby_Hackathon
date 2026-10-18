import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const downloadPath = resolve('.next/cloud-verification/downloads');
mkdirSync(downloadPath, { recursive: true });
// Real-browser checks for Cloud projects. Usage: node cloud-play-check.mjs <port> <origin> <width> <height>
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

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

await Promise.all([send("Page.enable"), send("Runtime.enable")]);
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: W < 600 });

// Cloud portfolio + projects
const inP = (pid, label) => `[...document.querySelectorAll("#project-${pid} button")].find(b => ((b.getAttribute("aria-label") ?? "") + " " + b.textContent).includes(${JSON.stringify(label)}))`;
const pStatus = (pid) => ev(`document.querySelector("#project-${pid} [role=status]")?.innerText.replace(/\\s+/g, " ").trim()`);
async function tap(js) {
  const box = await ev(`(() => { const el = ${js}; if (!el) return null; el.scrollIntoView({ block: "center", behavior: "instant" }); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  if (!box) throw new Error("missing element: " + js);
  await sleep(150);
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x, y: box.y }] });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await sleep(350);
}
const mobile = W < 600;
if (mobile) await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
const press = mobile ? tap : clickEl;

await go("/futures/cloud/story#portfolio");
const sheet = await ev(`(() => { const s = document.getElementById("portfolio"); const t = s.innerText;
  return { title: s.querySelector("h2")?.textContent, portrait: decodeURIComponent(s.querySelector("img")?.currentSrc ?? "").match(/characters\\/\\d\\.png/)?.[0],
    fields: ["Baby red panda", "Sky Explorer, Cloud Maker and Floating-Island Adventurer", "Adventurous, curious, brave, playful, imaginative", "Helping travelers navigate the sky", "The Floating Sky Islands", "Courage and exploration", "Hi! I’m Cloud Maria!", "Every adventure begins with one little step.", "I can go somewhere I've never been before."].filter(f => !t.includes(f)),
    strengths: [...s.querySelectorAll("ul li")].map(li => li.textContent) }; })()`);
check("Portfolio: Cloud Maria's Travel Journal with her 4.png portrait", sheet.title === "Cloud Maria’s Travel Journal" && sheet.portrait === "characters/4.png", JSON.stringify(sheet));
check("Portfolio: every profile field, motto and tagline is shown", sheet.fields.length === 0, "missing: " + sheet.fields.join(" | "));
check("Portfolio: six strengths", sheet.strengths.join() === "Courage,Curiosity,Observation,Navigation,Creativity,Problem-solving", sheet.strengths.join());

await ev(`(async () => { for (const li of document.querySelectorAll("#creations li")) { li.scrollIntoView({ block: "center", behavior: "instant" }); await new Promise(r => setTimeout(r, 600)); } })()`);
const cards = await ev(`[...document.querySelectorAll("#creations li")].filter(li => li.querySelector("h3")).map(li => { const img = li.querySelector("img"); return { title: li.querySelector("h3").textContent, src: decodeURIComponent(img?.currentSrc ?? "").match(/projects\\/cloud\\/[a-z-]+\\.png/)?.[0], loaded: !!img && img.complete && img.naturalWidth > 0, play: li.querySelector("a")?.getAttribute("href") }; })`);
check("Creations: three cards with their real artwork and Play links", cards.length === 3 && cards.every((c) => c.loaded) &&
  cards.map((c) => `${c.title}|${c.src}|${c.play}`).join() === "Cloud Maker|projects/cloud/cloud-maker.png|#project-cloud-maker,Sky Route Planner|projects/cloud/sky-route-planner.png|#project-sky-route-planner,Cloud Postcards|projects/cloud/cloud-postcards.png|#project-cloud-postcards", JSON.stringify(cards));

// Cloud Maker
await press(inP("cloud-maker", "Star cloud")); await press(inP("cloud-maker", "Blossom pink")); await press(inP("cloud-maker", "Large"));
await press(`document.querySelector("#project-cloud-maker [role=application]")`);
await press(inP("cloud-maker", "Fluffy cloud")); await press(inP("cloud-maker", "Small"));
await press(`document.querySelector("#project-cloud-maker [role=application]")`);
const made = await ev(`[...document.querySelectorAll("#project-cloud-maker [data-cloud]")].map(g => g.dataset.cloud + "/" + g.dataset.scale + "/" + g.querySelector("path:nth-of-type(2)")?.getAttribute("fill"))`);
check("Cloud Maker: shape, colour and size choices visibly change the placed clouds", made.join() === "star/large/#ffd6e5,fluffy/small/#ffd6e5", made.join());
const sizes = await ev(`[...document.querySelectorAll("#project-cloud-maker [data-cloud]")].map(g => Math.round(g.getBoundingClientRect().width))`);
check("Cloud Maker: large clouds are drawn bigger than small ones", sizes[0] > sizes[1] * 1.4, sizes.join(" vs "));
// keyboard placement
await ev(`document.querySelector("#project-cloud-maker [role=application]").focus()`);
await key("ArrowRight", "ArrowRight", 39); await key("ArrowRight", "ArrowRight", 39); await key("Enter", "Enter", 13);
const afterKey = await ev(`document.querySelectorAll("#project-cloud-maker [data-cloud]").length`);
check("Cloud Maker: keyboard (arrows + Enter) places a cloud", afterKey === 3, String(afterKey));
await press(inP("cloud-maker", "Undo"));
const afterUndo = await ev(`document.querySelectorAll("#project-cloud-maker [data-cloud]").length`);
await press(inP("cloud-maker", "Clear the sky"));
const afterClear = await ev(`document.querySelectorAll("#project-cloud-maker [data-cloud]").length`);
check("Cloud Maker: undo and clear reset the sky", afterUndo === 2 && afterClear === 0, `${afterUndo} → ${afterClear}`);

// Sky Route Planner
const isl = (name) => inP("sky-route-planner", name);
await press(isl("Waterfall Cliff")); await press(isl("Cloud Castle"));
const r0 = await pStatus("sky-route-planner");
await press(isl("Windmill Isle"));
await press(isl("Cloud Castle"));
const rWindy = await pStatus("sky-route-planner");
check("Route Planner: start + destination chosen, then a headwind route is refused", /Plan a route from Waterfall Cliff to Cloud Castle/.test(r0) && /headwind/.test(rWindy), `${r0} / ${rWindy}`);
const bridgeBtns = await ev(`[...document.querySelectorAll("#project-sky-route-planner [data-kind]")].filter(e => e.tagName === "BUTTON").map(b => b.textContent.trim())`);
check("Route Planner: bridges from the current island are listed as buttons", bridgeBtns.some((t) => t.includes("Lantern Village (safe cloud bridge)")) && bridgeBtns.some((t) => t.includes("strong headwind")), bridgeBtns.join(" | "));
await press(`[...document.querySelectorAll("#project-sky-route-planner button")].find(b => b.textContent.includes("→ Lantern Village"))`);
await press(isl("Cloud Castle"));
const rDone = await pStatus("sky-route-planner");
const used = await ev(`document.querySelectorAll('#project-sky-route-planner line[data-used="true"]').length`);
check("Route Planner: reaching the destination by safe bridges succeeds (shortest route)", /reached Cloud Castle in 3 hops: the shortest safe route/.test(rDone) && used === 3, `${used} lines; ${rDone}`);
await press(inP("sky-route-planner", "Plan another trip"));
await press(isl("Blossom Isle")); await press(isl("Lantern Village")); await press(isl("Lantern Village"));
const rBroken = await pStatus("sky-route-planner");
check("Route Planner: reset, then a broken bridge is refused", /bridge to Lantern Village is broken/.test(rBroken), rBroken);

// Cloud Postcards
const pc = "#project-cloud-postcards";
await press(inP("cloud-postcards", "Sunset Islands"));
await ev(`document.querySelector("${pc} textarea").scrollIntoView({ block: "center", behavior: "instant" })`);
await ev(`document.querySelector("${pc} textarea").focus()`);
await send("Input.insertText", { text: "Hi <b>Mum</b>! The clouds here are soft." });
await sleep(300);
await press(inP("cloud-postcards", "Rainbow cloud"));
const card = await ev(`(() => { const f = document.querySelector("${pc} figure"); return { design: f.dataset.design, title: f.querySelector("p").textContent, note: f.querySelector("figcaption").textContent, bold: !!f.querySelector("figcaption b"), sticker: f.querySelector("[data-sticker]").dataset.sticker, img: (() => { const i = f.querySelector("img"); return i.complete && i.naturalWidth > 0 && getComputedStyle(i).objectPosition; })(), counter: document.querySelector("${pc} [aria-live]").textContent }; })()`);
check("Postcards: design, message and sticker update the preview", card.design === "sunset-islands" && card.title === "Greetings from Sunset Islands!" && card.note === "Hi <b>Mum</b>! The clouds here are soft." && card.sticker === "rainbow" && card.counter.startsWith("40 /"), JSON.stringify(card));
check("Postcards: visitor text stays plain text (no HTML injected)", card.bold === false);
check("Postcards: the floating-islands artwork shows the design's crop", card.img === "78% 42%", String(card.img));
const maxLen = await ev(`document.querySelector("${pc} textarea").maxLength`);
check("Postcards: message length is limited", maxLen === 120, String(maxLen));
await send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath }).catch((e) => console.log("download behavior:", e.message));
await press(inP("cloud-postcards", "Save postcard"));
await sleep(2500);
const saved = await pStatus("cloud-postcards");
check("Postcards: Save renders a real PNG of the card", /Saved cloud-postcard-sunset-islands\.png \(\d+ KB\)/.test(saved), saved);
await press(inP("cloud-postcards", "Start a new card"));
const fresh = await ev(`(() => { const f = document.querySelector("${pc} figure"); return f.dataset.design + "|" + f.querySelector("[data-sticker]").dataset.sticker + "|" + document.querySelector("${pc} textarea").value; })()`);
check("Postcards: Start a new card resets everything", fresh === "waterfall-cliffs|smiley|", fresh);

const overflow = await ev(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
check("No horizontal overflow", overflow <= 0, `${overflow}px`);
check("No console errors or warnings", problems.length === 0, problems.join("\n      "));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail && !r.ok ? `\n      ${r.detail}` : ""}`);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed (${W}x${H})`);
ws.close();

process.exitCode = results.every((result) => result.ok) ? 0 : 1;
