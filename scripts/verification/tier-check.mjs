// Read-only browser verification of the tier requirements; no guestbook writes.
import { mkdirSync, writeFileSync } from 'node:fs';
const [port='9333', origin='http://localhost:3000'] = process.argv.slice(2);
const out='.next/tier-audit'; mkdirSync(out,{recursive:true});
const target=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
const ws=new WebSocket(target.webSocketDebuggerUrl); await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let serial=0; const pending=new Map(),results=[],problems=[];
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,m=>m.error?reject(Error(m.error.message)):resolve(m.result));ws.send(JSON.stringify({id,method,params}));});
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}if(m.method==='Runtime.exceptionThrown')problems.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ev(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const check=(name,ok,detail)=>{results.push({name,ok:!!ok,...(detail===undefined?{}:{detail})});console.log(`${ok?'PASS':'FAIL'} ${name}`);};
async function go(path){await send('Page.navigate',{url:origin+path});await sleep(1400);}
async function click(selector){const p=await ev(`(()=>{const el=${selector};if(!el)return null;let r=el.getBoundingClientRect();if(r.top<70||r.bottom>innerHeight){el.scrollIntoView({block:'center',behavior:'instant'});r=el.getBoundingClientRect();}return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);if(!p)throw Error('Missing '+selector);await sleep(100);for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});await sleep(220);}
const byText=(text,scope='document')=>`[...${scope}.querySelectorAll('button')].find(b=>b.textContent.trim().endsWith(${JSON.stringify(text)}))`;
async function size(width,height=844){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500});await send('Emulation.setTouchEmulationEnabled',{enabled:width<500});await sleep(150);}
async function shot(name){const s=await send('Page.captureScreenshot',{format:'png'});writeFileSync(`${out}/${name}.png`,Buffer.from(s.data,'base64'));}
await Promise.all([send('Page.enable'),send('Runtime.enable'),send('Network.enable')]);
await send('Network.setExtraHTTPHeaders',{headers:{'x-forwarded-for':'192.0.2.181'}});
await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.oscillators=[];if(window.AudioContext){const original=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){const node=original.call(this),stop=node.stop.bind(node);const setFrequency=node.frequency.setValueAtTime.bind(node.frequency);node.frequency.setValueAtTime=(value,time)=>{node.scheduledFrequency=value;return setFrequency(value,time)};node.stopCalls=0;node.stop=(...args)=>{node.stopCalls++;return stop(...args)};window.oscillators.push(node);return node;};}`});
await size(1366,768);await go('/');await ev("localStorage.removeItem('maria:journey-progress');localStorage.setItem('maria:night-palette','off');localStorage.setItem('maria:chaos','off');localStorage.setItem('maria:sound','off')");await go('/');
const portrait="document.querySelector('[data-reactive-portrait]')";
const p=await ev(`(()=>{const r=${portrait}.getBoundingClientRect();return {x:r.right-12,y:r.y+r.height/2}})()`);
await send('Input.dispatchMouseEvent',{type:'mouseMoved',...p});await sleep(250);
check('canonical portrait follows mouse without replacing its asset',await ev(`${portrait}.style.getPropertyValue('--portrait-tilt')!=='0deg'&&parseFloat(${portrait}.style.getPropertyValue('--portrait-tilt'))>1&&${portrait}.querySelector('img').getAttribute('src').includes('characters%2F1.png')`));
await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:20,y:120});check('portrait returns to rest on pointer exit',await ev(`${portrait}.style.getPropertyValue('--portrait-tilt')==='0deg'`));
const day=await ev("getComputedStyle(document.querySelector('header')).backgroundColor");
await click("document.querySelector('button[aria-label=\"Switch to night palette\"]')");
check('night changes visible palette',await ev(`document.documentElement.dataset.palette==='night'&&getComputedStyle(document.querySelector('header')).backgroundColor!==${JSON.stringify(day)}`));
await shot('home-night');await go('/');check('night preference survives reload',await ev("document.documentElement.dataset.palette==='night'"));
await click("document.querySelector('button[aria-label=\"Switch to day palette\"]')");
await size(390);await ev(`${portrait}.scrollIntoView({block:'center',behavior:'instant'})`);const t=await ev(`(()=>{const r=${portrait}.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[t]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(150);
check('touch greeting works',await ev("[...document.querySelectorAll('[role=status]')].some(e=>e.textContent==='Normal Maria says hello!')"));
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
check('portrait respects reduced motion',await ev(`getComputedStyle(${portrait}).transform==='none'`));await send('Emulation.setEmulatedMedia',{features:[]});
for(const width of [320,390,768,1000,1024,1366,1920]){await size(width);await ev("scrollTo({top:0,behavior:'instant'})");check('home and controls fit '+width,await ev("document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('header button[title]')].every(b=>{const r=b.getBoundingClientRect();return r.width>=44&&r.left>=0&&r.right<=innerWidth})"));if(width===390||width===1366)await shot('home-'+width);}
await size(1366,900);await go('/futures/forest/story');
check('story has five scenes and native smooth scrolling',await ev("document.querySelectorAll('[data-scene]').length===5&&getComputedStyle(document.documentElement).scrollBehavior==='smooth'"));
await ev("document.getElementById('scene-2').scrollIntoView({block:'center',behavior:'instant'})");await sleep(350);
check('story progress follows visible scene',await ev("document.querySelector('nav[aria-label=\"Story progress\"] [aria-current=step]')?.getAttribute('href')==='#scene-2'"));
await ev("document.querySelector('nav[aria-label=\"Story progress\"] a[href=\"#scene-3\"]').click()");await sleep(60);const early=await ev('scrollY');await sleep(1200);const late=await ev('scrollY');check('scene link animates scrolling to its destination',late>early+100,{early,late});
const map="document.querySelector('[data-scroll-route-map]')";
await ev(`scrollTo({top:scrollY+${map}.getBoundingClientRect().top-innerHeight*.88,behavior:'instant'})`);await sleep(250);const first=await ev(`Number(${map}.dataset.scrollProgress)`);
  const travelerStart=await ev("[...document.querySelector('[data-scroll-traveler]').attributes].filter(a=>['cx','cy'].includes(a.name)).map(a=>a.value).join(',')");
await ev('scrollBy({top:400,behavior:"instant"})');await sleep(250);const next=await ev(`Number(${map}.dataset.scrollProgress)`);
  const travelerForward=await ev("[...document.querySelector('[data-scroll-traveler]').attributes].filter(a=>['cx','cy'].includes(a.name)).map(a=>a.value).join(',')");
  await ev('scrollBy({top:-400,behavior:"instant"})');await sleep(250);
  const travelerBack=await ev("[...document.querySelector('[data-scroll-traveler]').attributes].filter(a=>['cx','cy'].includes(a.name)).map(a=>a.value).join(',')");
  check('SVG traveler follows scrolling forward and backward',travelerStart!==travelerForward&&travelerBack===travelerStart,{travelerStart,travelerForward,travelerBack});
check('SVG route ink synchronizes with actual scrolling',next>first+.3&&await ev("document.querySelectorAll('[data-route-ink]').length===9"),{first,next});
const project="document.getElementById('project-dream-delivery-map')";
await click(byText('Rabbit',project));await click(byText('Oak Cottage',project));
check('rabbit cannot use flight destination',await ev(`${byText('Treetop Village',project)}.disabled`));
await click(`${project}.querySelector('button[aria-label^="Mushroom Clearing"]')`);
await click(`${project}.querySelector('button[aria-label^="Oak Cottage"]')`);
check('delivery rejects unsuitable fallen log',await ev(`${project}.textContent.includes('isn’t right for a rabbit')`));
await click(byText('Step back',project));
for(const label of ['Riverside Trail','Golden Bridge','Oak Cottage'])await click(`${project}.querySelector('button[aria-label^=${JSON.stringify(label)}]')`);
check('playable delivery game reaches real win condition',await ev(`${map}.dataset.delivered==='true'&&${project}.textContent.includes('Delivered!')&&${project}.querySelectorAll('path[data-used=true]').length===3`));await shot('forest-delivered');
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});check('route ink fully shown with reduced motion',await ev("[...document.querySelectorAll('[data-route-ink]')].every(p=>parseFloat(getComputedStyle(p).strokeDashoffset)===0)"));await send('Emulation.setEmulatedMedia',{features:[]});
await go('/futures/melody/story');await click("document.querySelector('button[aria-label=\"Turn sound on\"]')");
const lab="document.getElementById('project-lullaby-lab')";
await ev(`(()=>{const s=${lab}.querySelector('select');s.value='Soft piano';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
await click(byText('Play melody',lab));await sleep(300);
check('Lullaby Lab produces eight real musical oscillator notes',await ev('oscillators.length===8&&new Set(oscillators.map(o=>o.scheduledFrequency)).size>=4'),await ev('oscillators.map(o=>o.scheduledFrequency)'));
// Header remains sticky. Do not scroll away, which would independently stop playback.
await ev("document.querySelector('button[aria-label=\"Turn sound off\"]').click()");await sleep(100);
check('global mute cancels every scheduled note immediately',await ev(`oscillators.every(o=>o.stopCalls>=2)&&${lab}.textContent.includes('Your lullaby is ready')&&document.querySelector('[data-background-audio]').paused`));
await click("document.querySelector('button[aria-label=\"A tiny golden musical note\"]')");
check('discoverable musical Easter egg recorded',await ev("JSON.parse(localStorage.getItem('maria:journey-progress')).easterEggsFound.includes(8)"));
await go('/');check('returning visitor gets saved personalized progress greeting',await ev("[...document.querySelectorAll('[role=status]')].some(e=>e.textContent.includes('Welcome back!')&&e.textContent.includes('two'))&&JSON.parse(localStorage.getItem('maria:journey-progress')).discoveredForms.includes(7)"));
for(const width of [1366,768,390]){await size(width);for(const path of ['/futures/forest/story','/futures/melody/story','/memory-book']){await go(path);check('responsive '+width+' '+path,await ev('document.documentElement.scrollWidth<=innerWidth'));if(width===390)await shot(path.includes('forest')?'forest-mobile':path.includes('melody')?'melody-mobile':'memory-mobile');}}
check('live moderated feed and counter respond successfully',await ev("Promise.all(['/api/memories','/api/visits'].map(p=>fetch(p).then(r=>r.status))).then(s=>s.every(n=>n===200))"));
const report={origin,recordedAt:new Date().toISOString(),results,problems};writeFileSync('docs/tier-browser.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok),problems},null,2));
await send('Page.close');ws.close();if(results.some(r=>!r.ok)||problems.length)process.exitCode=1;
