// Real-browser checks for the Memory Book; /api/memories is mocked in the browser, so nothing reaches the database. Usage: node memory-book-check.mjs <port> <origin> <width> <height>
const [port, origin, width = "1366", height = "768"] = process.argv.slice(2);
const W = Number(width), H = Number(height);
const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map(), problems = [], loads = [];
ws.addEventListener("message", (e) => { onEvent(JSON.parse(e.data));
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
// ── Mock /api/memories in the browser: nothing reaches the real database. ──
const mem = (i, slug) => ({ id: `m${i}`, visitorName: `Friend ${i}`, message: `Memory number ${i} <b>not bold</b>`, formSlug: slug, createdAt: new Date(Date.UTC(2026, 9, 20 - i)).toISOString() });
const SLUGS = ["blossom", "star", "cloud", "aqua", "inventor", "forest", "melody", "luna", null];
let mode = "data"; let postStatus = 202; const posts = []; let gets = [];
function onEvent(m) {
  if (m.method !== "Fetch.requestPaused") return;
  const { requestId, request } = m.params;
  const url = new URL(request.url);
  let status = 200, body;
  if (request.method === "POST") {
    posts.push(JSON.parse(request.postData ?? "{}"));
    status = postStatus;
    body = status === 202 ? { status: "received", message: "Thanks!" } : status === 429 ? { error: { code: "rate_limited", message: "Too many" } } : { error: { code: "unavailable", message: "Down" } };
  } else {
    gets.push(url.search);
    if (mode === "error") { status = 503; body = { error: { code: "unavailable", message: "Down" } }; }
    else if (mode === "empty") body = { memories: [], nextCursor: null };
    else if (!url.searchParams.get("before")) body = { memories: Array.from({ length: 12 }, (_, i) => mem(i + 1, SLUGS[i % 9])), nextCursor: "2026-10-08T00:00:00.000Z" };
    else body = { memories: [mem(12, SLUGS[11 % 9]), mem(13, "luna"), mem(14, "melody")], nextCursor: null };
  }
  send("Fetch.fulfillRequest", { requestId, responseCode: status, responseHeaders: [{ name: "Content-Type", value: "application/json" }], body: Buffer.from(JSON.stringify(body)).toString("base64") });
}
await send("Fetch.enable", { patterns: [{ urlPattern: "*/api/memories*", requestStage: "Request" }] });
const q = (sel) => `document.querySelector(${JSON.stringify(sel)})`;
const text = (sel) => ev(`${q(sel)}?.innerText.replace(/\\s+/g, " ").trim()`);
const lanterns = `[...document.querySelectorAll("#read-memories ul button")]`;

await go("/memory-book");
await sleep(1500);
check("Hero: title, subtitle and both buttons", (await text("h1")) === "Memory Book" && /Every journey leaves a little memory behind/.test(await text("main")) && (await ev(`[...document.querySelectorAll("a")].filter(a => /Leave a Memory|Read Memories/.test(a.textContent)).map(a => a.getAttribute("href")).join()`)) === "#leave-memory,#read-memories");
await clickEl(`[...document.querySelectorAll("a")].find(a => a.textContent.includes("Read Memories"))`);
await sleep(900);
check("Read Memories scrolls to the lantern lake", await ev(`Math.abs(document.querySelector("#read-memories").getBoundingClientRect().top) < 120`));
let n = await ev(`${lanterns}.length`);
check("Approved memories appear as 12 lanterns (one page, limit 12)", n === 12 && gets[0] === "?limit=12", JSON.stringify({ n, gets }));
check("Visitor text is plain text (no HTML injected)", await ev(`!document.querySelector("main b")`));

await clickEl(`${lanterns}[0]`);
await sleep(300);
const d = await ev(`(() => { const d = document.querySelector("dialog"); return { open: d.open, text: d.innerText, focusIn: d.contains(document.activeElement) }; })()`);
check("Clicking a lantern opens a memory card with name, future, message and date", d.open && /Friend 1/.test(d.text) && /Blossom/.test(d.text) && /Memory number 1 <b>not bold<\/b>/.test(d.text) && /19 October 2026/.test(d.text) && d.focusIn, JSON.stringify(d));
await key("Escape", "Escape", 27);
await sleep(200);
check("Escape closes the memory card and returns focus to the lantern", await ev(`!document.querySelector("dialog").open && !!document.activeElement?.closest("#read-memories ul")`));
await ev(`${lanterns}[2].focus()`);
await key("Enter", "Enter", 13);
await sleep(200);
check("Keyboard: Enter on a lantern opens it", await ev(`document.querySelector("dialog").open && /Friend 3/.test(document.querySelector("dialog").innerText)`));
await clickEl(`document.querySelector("dialog button[aria-label='Close memory']")`);
check("Close button closes the card", await ev(`!document.querySelector("dialog").open`));

await clickEl(`[...document.querySelectorAll("#read-memories fieldset button")].find(b => b.textContent.includes("Luna"))`);
n = await ev(`${lanterns}.map(b => b.innerText.replace(/\\s+/g, " "))`);
check("Filtering by Luna shows only Luna lanterns", n.length === 1 && /Friend 8/.test(n[0]), JSON.stringify(n));
await clickEl(`[...document.querySelectorAll("#read-memories button")].find(b => b.textContent.includes("Load more"))`);
await sleep(600);
n = await ev(`${lanterns}.map(b => b.innerText.replace(/\\s+/g, " "))`);
const loadMoreGone = await ev(`![...document.querySelectorAll("#read-memories button")].some(b => b.textContent.includes("Load more"))`);
check("Load More uses the cursor and adds older lanterns; button disappears at the end", n.length === 2 && gets.at(-1).includes("before=2026-10-08") && loadMoreGone, JSON.stringify({ n, gets }));
await clickEl(`[...document.querySelectorAll("#read-memories fieldset button")].find(b => b.textContent.includes("All futures"))`);
n = await ev(`${lanterns}.length`);
check("All futures: 14 unique lanterns after paging", n === 14, String(n));
const featText = await ev(`document.querySelector("#featured-title").closest("figure").innerText`);
check("Featured memory shows a real loaded memory", /Glowing Memory/.test(featText) && /Memory number \d+/.test(featText) && /— Friend \d+/.test(featText), featText);

await clickEl(`[...document.querySelectorAll("a")].find(a => a.textContent.includes("Leave a Memory"))`);
await sleep(900);
check("Leave a Memory scrolls to the form", await ev(`Math.abs(document.querySelector("#leave-memory").getBoundingClientRect().top) < 120`));
const opts = await ev(`[...document.querySelector("#leave-memory select").options].map(o => o.value).filter(Boolean).join()`);
check("Favorite future lists all eight futures", opts === "blossom,star,cloud,aqua,inventor,forest,melody,luna", opts);
const submitBtn = `[...document.querySelectorAll("#leave-memory button")].find(b => b.type === "submit")`;
await clickEl(submitBtn);
await sleep(300);
const errs = await ev(`document.querySelectorAll("#leave-memory [aria-invalid=true]").length`);
check("Empty form shows validation errors and sends nothing", errs === 2 && posts.length === 0, JSON.stringify({ errs, posts }));
const type = async (sel, value) => { await ev(`${q(sel)}.focus()`); await send("Input.insertText", { text: value }); };
const clear = (sel) => ev(`(() => { const t = ${q(sel)}; const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(t), "value").set; set.call(t, ""); t.dispatchEvent(new Event("input", { bubbles: true })); })()`);
await type("#leave-memory input:not([tabindex])", "Ava");
await type("#leave-memory textarea", "Visit www.spam.com");
await clickEl(submitBtn);
await sleep(300);
check("Links are rejected by the shared validation", /Links aren't allowed/.test(await text("#leave-memory")) && posts.length === 0);
await clear("#leave-memory textarea");
await type("#leave-memory textarea", "I loved the lantern lake!");
await ev(`(() => { const s = document.querySelector("#leave-memory select"); const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set; set.call(s, "luna"); s.dispatchEvent(new Event("change", { bubbles: true })); })()`);
check("Character counter updates", /25 \/ 280/.test(await text("#leave-memory")));
postStatus = 429;
await clickEl(submitBtn);
await sleep(500);
check("Rate limit shows a friendly message and keeps the text", /wait a few minutes/.test(await text("#leave-memory [role=status]")) && (await ev(`document.querySelector("#leave-memory textarea").value`)) === "I loved the lantern lake!");
postStatus = 503;
await clickEl(submitBtn);
await sleep(500);
check("Service outage shows a friendly message", /resting/.test(await text("#leave-memory [role=status]")));
postStatus = 202;
const before = posts.length;
await ev(`(() => { const b = ${submitBtn}; b.click(); b.click(); b.click(); })()`);
await sleep(600);
const st = await text("#leave-memory [role=status]");
check("Success: one POST despite triple click, with the exact payload", posts.length - before === 1 && JSON.stringify(posts.at(-1)) === JSON.stringify({ visitorName: "Ava", message: "I loved the lantern lake!", formSlug: "luna" }), JSON.stringify(posts.slice(before)));
check("Success message shown, lantern rises, message cleared, name kept", st === "Your little memory has been received! Once it's approved, your lantern will join the others in Maria's sky." && (await ev(`!!document.querySelector("#leave-memory [class*=risingLantern]")`)) && (await ev(`document.querySelector("#leave-memory textarea").value`)) === "" && (await ev(`document.querySelector("#leave-memory input").value`)) === "Ava", st);
check("The pending memory is NOT added to the public lake", (await ev(`${lanterns}.some(b => b.innerText.includes("Ava"))`)) === false && (await ev(`${lanterns}.length`)) === 14);

check("Thank-you section with Normal Maria (1.png) and Return to My Futures", await ev(`[...document.querySelectorAll("img")].some(i => decodeURIComponent(i.currentSrc || i.src).includes("/characters/1.png")) && [...document.querySelectorAll("a")].some(a => a.textContent.includes("Return to My Futures") && a.getAttribute("href") === "/#futures")`));

mode = "empty"; await go("/memory-book"); await sleep(800);
check("Empty state invites the first memory (no fake memories)", /No lanterns are glowing yet/.test(await text("#read-memories")) && /waiting for its first memory/.test(await ev(`document.querySelector("#featured-title").closest("figure").innerText`)) && (await ev(`${lanterns}.length`)) === 0);
mode = "error"; await go("/memory-book"); await sleep(800);
check("Error state offers Try again", /can’t be reached/.test(await text("#read-memories")) && (await ev(`[...document.querySelectorAll("#read-memories button")].some(b => b.textContent.includes("Try again"))`)));
mode = "data";
await clickEl(`[...document.querySelectorAll("#read-memories button")].find(b => b.textContent.includes("Try again"))`);
await sleep(600);
check("Try again recovers", (await ev(`${lanterns}.length`)) === 12);

await go("/futures/luna/story");
gets = [];
await clickEl(`[...document.querySelectorAll("button")].find(b => b.textContent.includes("Moonlit Memory Book"))`);
await sleep(700);
const luna = await ev(`document.querySelector("[aria-label='Shared memories']")?.innerText ?? ""`);
check("Luna's Moonlit Memory Book reads the same shared memories", gets[0] === "?limit=6" && /Memory number 1/.test(luna), JSON.stringify({ gets, luna: luna.slice(0, 80) }));

await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await go("/memory-book"); await sleep(600);
const anim = await ev(`[...document.querySelectorAll("#read-memories li, main [class*=star], main [class*=petal]")].filter(e => getComputedStyle(e).animationName !== "none").length`);
check("Reduced motion stops floating, twinkling and petals", anim === 0, String(anim));
await send("Emulation.setEmulatedMedia", { features: [] });
await go("/memory-book"); await sleep(600);

const nav = await ev(`(() => { const links = [...document.querySelectorAll("header nav a")]; const vis = links.filter(a => a.offsetParent); return { rows: new Set(vis.map(a => Math.round(a.getBoundingClientRect().top))).size, vis: vis.length, toggle: getComputedStyle(document.querySelector("header button[aria-controls]")).display, current: document.querySelector("header nav a[aria-current=page]")?.textContent }; })()`);
if (W > 960) check("Navbar: five links on one row, Memory Book highlighted", nav.rows === 1 && nav.vis === 5 && nav.toggle === "none" && /Memory Book/.test(nav.current), JSON.stringify(nav));
else {
  await clickEl(`document.querySelector("header button[aria-controls]")`);
  const open = await ev(`[...document.querySelectorAll("header nav a")].filter(a => a.offsetParent).length`);
  await key("Escape", "Escape", 27);
  check("Mobile: menu button opens all five links; Escape closes it", nav.vis === 0 && open === 5 && (await ev(`document.querySelector("header button[aria-controls]").getAttribute("aria-expanded")`)) === "false", JSON.stringify({ nav, open }));
}

const overflow = await ev(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
check("No horizontal overflow", overflow <= 0, `${overflow}px`);
const fs = await import("node:fs");
for (const [name, sel] of [["hero", "main"], ["lake", "#read-memories"], ["form", "#leave-memory"]]) {
  await ev(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({ block: "start", behavior: "instant" })`);
  await sleep(400);
  fs.mkdirSync("shots", { recursive: true }); fs.writeFileSync(`shots/memory-${name}-${W}.png`, Buffer.from((await send("Page.captureScreenshot", { format: "png" })).data, "base64"));
}
const relevant = problems.filter((p) => !/503|429|Failed to load resource/.test(p));
check("No console errors or warnings", relevant.length === 0, relevant.join("\n      "));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail && !r.ok ? `\n      ${r.detail}` : ""}`);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed (${W}x${H})`);
ws.close();
