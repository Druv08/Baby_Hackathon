// Usage: node shoot.mjs <devtoolsPort> <url> <outDir> <name:WxH[:mobile]>...
import { writeFileSync } from "node:fs";

const [port, url, outDir, ...specs] = process.argv.slice(2);
const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
const events = [];
const problems = [];
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  } else {
    events.push(m);
    if (m.method === "Runtime.exceptionThrown") problems.push("exception: " + m.params.exceptionDetails.text);
    if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type))
      problems.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 300)}`);
  }
});
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const i = ++id;
    pending.set(i, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result)));
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await send("Page.enable");
await send("Runtime.enable");

for (const spec of specs) {
  const [name, size, mobile] = spec.split(":");
  const [w, h] = size.split("x").map(Number);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: mobile === "mobile" });
  await send("Page.navigate", { url });
  await sleep(3500);
  const { result } = await send("Runtime.evaluate", {
    expression: "JSON.stringify({ scrollW: document.documentElement.scrollWidth, innerW: innerWidth })",
    returnByValue: true,
  });
  let shotParams = { format: "png" };
  if (spec.endsWith(":full")) {
    // Scroll through so scroll-triggered content appears, then capture all of it.
    const { result: hr } = await send("Runtime.evaluate", { expression: "document.documentElement.scrollHeight", returnByValue: true });
    for (let y = 0; y < hr.value; y += Math.floor(h * 0.7)) {
      await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` });
      await sleep(250);
    }
    await sleep(1200);
    await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" });
    await sleep(300);
    const { result: hr2 } = await send("Runtime.evaluate", { expression: "document.documentElement.scrollHeight", returnByValue: true });
    shotParams = { format: "jpeg", quality: 70, captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: hr2.value, scale: 1 } };
  }
  const shot = await send("Page.captureScreenshot", shotParams);
  writeFileSync(`${outDir}/${name}.${shotParams.format === "jpeg" ? "jpg" : "png"}`, Buffer.from(shot.data, "base64"));
  console.log(`${name} ${w}x${h} saved`, result.value);
}
console.log(problems.length ? "console problems:\n  " + problems.join("\n  ") : "console: clean");
ws.close();
