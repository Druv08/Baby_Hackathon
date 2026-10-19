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


const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail });
await Promise.all([send('Page.enable'), send('Runtime.enable')]);
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 500 });
await go('/futures/melody');
check('active story entry from existing hero', await ev("!!document.querySelector('a[href=\"/futures/melody/story\"]')"));
check('hero no longer says coming soon', await ev("!document.body.innerText.includes('Story Coming Soon')"));
await ev("localStorage.removeItem('maria:journey-progress')");
await go('/futures/melody/story');
check('five story scenes', await ev("document.querySelectorAll('[data-scene]').length === 5"));
check('main story has no preview notice', await ev("!document.body.innerText.includes('Melody Path preview')"));
check('no horizontal overflow', await ev('document.documentElement.scrollWidth <= innerWidth'));
check('all sound starts off', await ev("![...document.querySelectorAll('button')].some(b => b.textContent === 'Sound on')"));
const project = id => 'document.getElementById('+JSON.stringify('project-'+id)+')';
const button = (id, text) => "[..."+project(id)+".querySelectorAll('button')].find(b=>b.textContent === "+JSON.stringify(text)+")";
check('background remains fixed', await ev("getComputedStyle(document.querySelector('[class*=backdrop]')).position==='fixed'"));
// Load each illustration and check anchored navigation geometry.
for(let i=1;i<=5;i++) {
 await ev("document.getElementById('scene-"+i+"').scrollIntoView({behavior:'instant'})"); await sleep(300);
 await ev("Promise.all([...document.getElementById('scene-"+i+"').querySelectorAll('img')].map(img=>img.decode().catch(()=>{})))");
 check('scene '+i+' clear of sticky navigation',await ev("document.querySelector('#scene-"+i+" h2').getBoundingClientRect().top >= 120"));
 check('scene '+i+' artwork loads',await ev("[...document.getElementById('scene-"+i+"').querySelectorAll('img')].every(img=>img.complete&&img.naturalWidth>0)"));
}
await clickEl(button('lullaby-lab','Play melody'));
check('sequencer starts with selected note',await ev(project('lullaby-lab')+".innerText.includes('Step 1: C')"));
await clickEl(button('lullaby-lab','Stop'));
check('sequencer stops',await ev(project('lullaby-lab')+".innerText.includes('Your lullaby is ready')"));
await ev("(()=>{const s="+project('lullaby-lab')+".querySelector('select[aria-label=\"Step 1 note\"]');s.value='A';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
await clickEl(button('lullaby-lab','Sound off'));
// Observe actual oscillator frequencies without replacing browser audio.
await ev("window.played=[];const orig=AudioContext.prototype.createOscillator; AudioContext.prototype.createOscillator=function(){const n=orig.call(this),start=n.start.bind(n);n.start=(...args)=>{window.played.push(n.frequency.value);return start(...args)};return n;}");
await clickEl(button('lullaby-lab','Play melody'));
check('actual selected frequency plays',await ev('played.some(f=>Math.abs(f-440)<.1)'),await ev('JSON.stringify(played)'));
await ev("(()=>{const s="+project('lullaby-lab')+".querySelector('select');s.value='Music box';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
await clickEl(button('lullaby-lab','Play melody'));
check('music box timbre uses higher octave',await ev('played.some(f=>Math.abs(f-880)<.1)'));
await clickEl(button('lullaby-lab','Stop'));
await ev(button('lullaby-lab','Play melody')+'.focus()');
await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});
await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});await sleep(150);
check('play works with keyboard',await ev(project('lullaby-lab')+".innerText.includes('Step 1: A')"));
await clickEl(button('lullaby-lab','Sound on'));
check('mute stops playback',await ev(project('lullaby-lab')+".innerText.includes('Your lullaby is ready')"));
await clickEl(button('lullaby-lab','Play melody'));
await ev("window.scrollTo({top:0,behavior:'instant'})");await sleep(500);
check('leaving project stops playback',await ev(project('lullaby-lab')+".innerText.includes('Your lullaby is ready')"));
await clickEl(button('lullaby-lab','Reset composition'));
check('reset restores first note',await ev(project('lullaby-lab')+".querySelector('select[aria-label=\"Step 1 note\"]').value==='C'"));
// Watch a real visual sequence, then replay and answer it.
await clickEl(button('rhythm-garden','Start round'));
const pattern=[];
for(let i=0;i<2;i++){ if(i) await sleep(650);pattern.push(await ev("[..."+project('rhythm-garden')+".querySelectorAll('button')].filter(b=>b.style.getPropertyValue('--flower')).findIndex(b=>b.dataset.active==='true')")); }
await sleep(1000);
check('garden visual sequence shown',pattern.length===2&&pattern.every(i=>i>=0),pattern.join(','));
for(const i of pattern) await clickEl("[..."+project('rhythm-garden')+".querySelectorAll('button')].filter(b=>b.style.getPropertyValue('--flower'))["+i+"]");
check('garden recognizes correct sequence',await ev(project('rhythm-garden')+".innerText.includes('The garden blooms!')"));
await clickEl(button('rhythm-garden','Replay sequence'));await sleep(1800);
check('garden replay permits answers',await ev(project('rhythm-garden')+".innerText.includes('Your turn!')"));
await clickEl("[..."+project('rhythm-garden')+".querySelectorAll('button')].filter(b=>b.style.getPropertyValue('--flower'))["+((pattern[0]+1)%4)+"]");
check('garden wrong choice feedback',await ev(project('rhythm-garden')+".innerText.includes('That flower was different')"));
await clickEl(button('rhythm-garden','Reset garden'));
check('garden reset',await ev(project('rhythm-garden')+".innerText.includes('Round 1')"));
await clickEl(button('moonlight-music-box','Star Box'));
await clickEl(button('moonlight-music-box','Moonlight Blue'));
await clickEl(button('moonlight-music-box','Open music box'));
check('music box live preview',await ev(project('moonlight-music-box')+".querySelector('[role=img]').getAttribute('aria-label').includes('Open Star Box, Moonlight Blue')"));
await clickEl(button('moonlight-music-box','Dreaming Stars'));
await clickEl(button('moonlight-music-box','Play selected melody'));
check('music box selected melody',await ev(project('moonlight-music-box')+".innerText.includes('Dreaming Stars: G')"));
await clickEl(button('moonlight-music-box','Close music box'));
check('closing stops melody',await ev(project('moonlight-music-box')+".innerText.includes('Open the box to see')"));
await clickEl(button('moonlight-music-box','Reset music box'));
check('box reset',await ev(project('moonlight-music-box')+".querySelector('[role=img]').getAttribute('aria-label')==='Closed Crescent Moon Box, Warm Gold lighting'"));
await clickEl("document.querySelector('button[aria-label=\"A tiny golden musical note\"]')");
await clickEl("document.querySelector('button[aria-label=\"Secret Note (already found)\"]')");
check('one canonical secret',await ev("JSON.parse(localStorage.getItem('maria:journey-progress')).easterEggsFound.join() === '8'"));
await ev("document.querySelector('p[data-done]').scrollIntoView({block:'center',behavior:'instant'})");await sleep(500);
check('completion stored independently',await ev("JSON.parse(localStorage.getItem('maria:journey-progress')).completedStories.join() === '8'"));
await go('/futures/melody/story');
check('progress survives reload',await ev("JSON.parse(localStorage.getItem('maria:journey-progress')).completedStories.join() === '8'"));
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
check('reduced motion disables floating notes',await ev("getComputedStyle(document.querySelector('[class*=ambient] span')).animationName==='none'"));
console.log(JSON.stringify({width:W,results,problems},null,2));
await send('Page.close');ws.close();
if(results.some(r=>!r.ok)||problems.length)process.exitCode=1;
