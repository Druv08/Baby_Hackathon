// Real-browser interaction check over the Chrome DevTools Protocol (Edge).
// Usage: node browser-check.mjs <devtoolsPort> <siteOrigin>
const [port, origin] = process.argv.slice(2);

const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));

let nextId = 0;
const pending = new Map();
const listeners = [];
const consoleProblems = [];
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
    return;
  }
  if (msg.method === "Runtime.consoleAPICalled" && ["error", "warning", "assert"].includes(msg.params.type)) {
    consoleProblems.push(`${msg.params.type}: ${msg.params.args.map((a) => a.value ?? a.description).join(" ")}`);
  }
  if (msg.method === "Runtime.exceptionThrown") {
    consoleProblems.push(`exception: ${msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text}`);
  }
  if (msg.method === "Log.entryAdded" && ["error", "warning"].includes(msg.params.entry.level)) {
    consoleProblems.push(`log ${msg.params.entry.level}: ${msg.params.entry.text} ${msg.params.entry.url ?? ""}`);
  }
  listeners.forEach((l) => l(msg));
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const evaluate = async (expression) => {
  const { result, exceptionDetails } = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (exceptionDetails) throw new Error(exceptionDetails.text);
  return result.value;
};
async function goto(path) {
  const loaded = new Promise((r) => {
    const l = (m) => m.method === "Page.loadEventFired" && (listeners.splice(listeners.indexOf(l), 1), r());
    listeners.push(l);
  });
  await send("Page.navigate", { url: origin + path });
  await loaded;
  await sleep(700); // let hydration and effects settle
}
async function key(keyName, code, keyCode, shift = false) {
  const base = { key: keyName, code, windowsVirtualKeyCode: keyCode, modifiers: shift ? 8 : 0 };
  await send("Input.dispatchKeyEvent", { type: "keyDown", ...base });
  await send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
  await sleep(120);
}
const tab = () => key("Tab", "Tab", 9);
async function clickSelector(selector) {
  const box = await evaluate(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  for (const type of ["mousePressed", "mouseReleased"]) {
    await send("Input.dispatchMouseEvent", { type, x: box.x, y: box.y, button: "left", clickCount: 1 });
  }
  await sleep(400);
}
const focused = () =>
  evaluate(`(() => { const e = document.activeElement; return e ? (e.getAttribute("aria-label") || e.textContent.trim().replace(/\\s+/g, " ")).slice(0, 40) : null; })()`);

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

await Promise.all([send("Page.enable"), send("Runtime.enable"), send("Log.enable")]);

// ── Mobile (true 375px viewport via device emulation) ─────────────────
await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
await send("Emulation.setTouchEmulationEnabled", { enabled: true });

const PAGES = ["/", "/forms", "/journey", "/creations", "/memory-book",
  ...["blossom", "star", "cloud", "aqua", "inventor", "forest", "melody", "luna"].map((s) => `/futures/${s}`)];
const overflowing = [];
for (const p of PAGES) {
  await goto(p);
  const w = await evaluate(`({ inner: innerWidth, scroll: document.documentElement.scrollWidth })`);
  if (w.scroll > w.inner) overflowing.push(`${p} (${w.scroll}px > ${w.inner}px)`);
}
check("No horizontal overflow at 375px on all 13 pages", overflowing.length === 0, overflowing.join(", "));

await goto("/");
const toggleSel = 'header button[aria-controls]';
const menuState = () =>
  evaluate(`(() => { const b = document.querySelector('${toggleSel}'); const nav = document.getElementById(b.getAttribute('aria-controls'));
    return { expanded: b.getAttribute('aria-expanded'), toggleVisible: getComputedStyle(b).display !== 'none', navVisible: getComputedStyle(nav).display !== 'none', label: b.textContent.trim() }; })()`);
let s = await menuState();
check("Mobile: menu toggle visible, menu initially closed", s.toggleVisible && s.expanded === "false" && !s.navVisible, JSON.stringify(s));

await clickSelector(toggleSel);
s = await menuState();
check("Mobile: tapping Menu opens it (aria-expanded=true, links shown)", s.expanded === "true" && s.navVisible && s.label === "Close", JSON.stringify(s));

await key("Escape", "Escape", 27);
s = await menuState();
const focusAfterEsc = await evaluate(`document.activeElement === document.querySelector('${toggleSel}')`);
check("Mobile: Escape closes menu and returns focus to toggle", s.expanded === "false" && !s.navVisible && focusAfterEsc, JSON.stringify(s));

await clickSelector(toggleSel);
await clickSelector('header nav a[href="/journey"]');
await sleep(800);
s = await menuState();
const path = await evaluate("location.pathname");
check("Mobile: choosing a link navigates and closes the menu", path === "/journey" && s.expanded === "false" && !s.navVisible, `path=${path} ${JSON.stringify(s)}`);
const current = await evaluate(`document.querySelector('header nav a[aria-current="page"]')?.textContent.trim()`);
check("Mobile: current page marked with aria-current", current?.includes("My Journey"), String(current));

// ── Desktop keyboard navigation ───────────────────────────────────────
await send("Emulation.setTouchEmulationEnabled", { enabled: false });
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await goto("/");
const order = [];
for (let i = 0; i < 9; i++) {
  await tab();
  order.push(await focused());
}
check("Keyboard: first Tab reaches the skip link", order[0] === "Skip to content", order[0]);
const skipVisible = await (async () => {
  await goto("/");
  await tab();
  return evaluate(`(() => { const r = document.activeElement.getBoundingClientRect(); return r.top >= 0 && r.height > 0; })()`);
})();
check("Keyboard: skip link becomes visible when focused", skipVisible);
const expectedNav = ["Home", "My Journey", "My Forms", "My Creations", "Memory Book"];
check(
  "Keyboard: tab order is skip → logo → 5 nav links → homepage CTA",
  order[1] === "Maria — home" &&
    expectedNav.every((label, i) => order[2 + i]?.endsWith(label)) &&
    /^(Start My Journey|Explore My Futures)/.test(order[7] ?? ""),
  order.join(" | "),
);
const focusRing = await evaluate(`(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle + " " + s.outlineWidth; })()`);
check("Keyboard: focused element shows a visible outline", !focusRing.startsWith("none"), focusRing);

await key("Enter", "Enter", 13); // activate skip link
const afterSkip = await evaluate("location.hash");
check("Keyboard: Enter on skip link jumps to #main", afterSkip === "#main", afterSkip);

// Future page: disabled story button must be skipped; Explore Creations reachable.
await goto("/futures/aqua");
const futureOrder = [];
for (let i = 0; i < 10; i++) {
  await tab();
  futureOrder.push(await focused());
}
const disabled = await evaluate(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Story Coming Soon')); return b ? { disabled: b.disabled, described: !!document.getElementById(b.getAttribute('aria-describedby')) } : null; })()`);
check("Future page: Story Coming Soon is a real disabled button with a description", disabled?.disabled && disabled?.described, JSON.stringify(disabled));
check("Future page: keyboard skips the disabled button and reaches Explore Creations",
  !futureOrder.some((f) => f?.includes("Story Coming Soon")) && futureOrder.some((f) => f?.includes("Explore Creations")),
  futureOrder.join(" | "));
await evaluate(`[...document.querySelectorAll('a')].find(a => a.textContent.includes('Explore Creations')).focus()`);
await key("Enter", "Enter", 13);
await sleep(500);
check("Future page: Explore Creations jumps to #creations", (await evaluate("location.hash")) === "#creations");

// Reduced motion
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await goto("/");
const anim = await evaluate(`getComputedStyle(document.querySelector('main img').parentElement).animationDuration`);
check("Reduced motion: floating animation effectively disabled", anim === "1e-05s" || parseFloat(anim) < 0.001, anim);

// ── Report ─────────────────────────────────────────────────────────────
check("No console errors, warnings or exceptions across all checks", consoleProblems.length === 0, consoleProblems.slice(0, 8).join("\n   "));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `\n      ${r.detail}` : ""}`);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed`);
ws.close();
process.exit(results.every((r) => r.ok) ? 0 : 1);
