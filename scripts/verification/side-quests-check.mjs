import { mkdirSync, writeFileSync } from 'node:fs';
const [port='9333', origin='http://localhost:3000'] = process.argv.slice(2);
if(!['localhost','127.0.0.1'].includes(new URL(origin).hostname))throw Error('This live verification is restricted to a local server.');
const out = '.next/side-quests-verification'; mkdirSync(out,{recursive:true});
const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let serial=0, fixture=false, revision=0, unavailable=false; const pending=new Map(), problems=[], requests=[], responses=[], results=[];
const marker='sidequest-'+crypto.randomUUID();
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,m=>m.error?reject(Error(m.error.message)):resolve(m.result));ws.send(JSON.stringify({id,method,params}));});
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);return;}
 if(m.method==='Runtime.exceptionThrown')problems.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
 if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')problems.push(m.params.args.map(a=>a.value||a.description).join(' '));
 if(m.method==='Network.requestWillBeSent')requests.push({url:m.params.request.url,method:m.params.request.method});
 if(m.method==='Network.responseReceived'&&m.params.response.url.includes('/api/'))responses.push({url:m.params.response.url,status:m.params.response.status});
 if(m.method==='Fetch.requestPaused')void(async()=>{const p=m.params;const url=new URL(p.request.url);if((fixture&&url.pathname==='/api/memories'&&p.request.method==='GET')||(unavailable&&url.pathname==='/api/visits')){
  const body=unavailable&&url.pathname==='/api/visits'?{error:{code:'unavailable',message:'Unavailable'}}:{memories:Array.from({length:revision+1},(_,i)=>({id:`00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,visitorName:'Browser Fixture '+i,message:'An approved lantern <script>window.fixtureRan=true</script>',formSlug:'luna',createdAt:new Date(Date.UTC(2026,9,19,8,i)).toISOString()})).reverse(),nextCursor:null};
  await send('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:unavailable&&url.pathname==='/api/visits'?503:200,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(body)).toString('base64')});
 }else await send('Fetch.continueRequest',{requestId:p.requestId});})().catch(e=>problems.push(e.message));
});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ev(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const check=(name,ok,detail)=>results.push({name,ok:!!ok,...(detail===undefined?{}:{detail})});
async function go(path){await send('Page.navigate',{url:origin+path});await sleep(1750);await ev("document.documentElement.style.scrollBehavior='auto'");}
async function click(selector){const p=await ev(`(()=>{const el=${selector};if(!el)return null;el.scrollIntoView({block:'center',behavior:'instant'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);if(!p)throw Error('Missing '+selector);await sleep(100);for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});await sleep(250);}
const byText=text=>`[...document.querySelectorAll('button')].find(b=>b.textContent.includes(${JSON.stringify(text)}))`;
async function fill(selector,value){await ev(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});const set=Object.getOwnPropertyDescriptor(el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set;set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`);await sleep(50);}
async function size(width,height=900){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500});await send('Emulation.setTouchEmulationEnabled',{enabled:width<500});await sleep(250);}
await Promise.all([send('Page.enable'),send('Runtime.enable'),send('Network.enable')]);
await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Network.setExtraHTTPHeaders',{headers:{'x-forwarded-for':'192.0.2.174'}});
await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.mediaLog=[];window.audioContexts=[];const play=HTMLMediaElement.prototype.play,pause=HTMLMediaElement.prototype.pause;HTMLMediaElement.prototype.play=function(){window.mediaLog.push({kind:'play',src:this.getAttribute('src')});return play.call(this)};HTMLMediaElement.prototype.pause=function(){window.mediaLog.push({kind:'pause',src:this.getAttribute('src')});return pause.call(this)};if(window.AudioContext){const Original=AudioContext;window.AudioContext=new Proxy(Original,{construct(target,args){const ctx=Reflect.construct(target,args);window.audioContexts.push(ctx);return ctx}});}`});
await size(1366,768);await go('/');await ev("localStorage.setItem('maria:sound','off');localStorage.setItem('maria:chaos','off')");await go('/');
check('no automatic audio on load',await ev("mediaLog.filter(x=>x.kind==='play').length===0"));
await ev("document.querySelector('footer').scrollIntoView({behavior:'instant'})");await sleep(800);
const liveCount=await ev("fetch('/api/visits').then(r=>r.json()).then(x=>x.count)");
check('real database count in footer',await ev(`document.querySelector('[data-visit-counter]').textContent.includes(${JSON.stringify(String(liveCount)+' dreams delivered')})`),liveCount);
check('session posts exactly one visit',requests.filter(r=>r.method==='POST'&&r.url.endsWith('/api/visits')).length===1);
await click("document.querySelector('button[aria-label=\"Turn Chaos Mode on\"]')");
check('Chaos Mode turns on',await ev("document.documentElement.dataset.chaos==='true'&&!!document.querySelector('.chaos-ribbon')"));
for(const width of [1920,1366,768,390]){await size(width,900);await ev('scrollTo(0,0)');await sleep(200);check('Chaos Mode no overflow '+width,await ev('document.documentElement.scrollWidth<=innerWidth'));check('header controls accessible '+width,await ev("[...document.querySelectorAll('header button[title]')].every(b=>{const r=b.getBoundingClientRect();return r.width>=44&&r.left>=0&&r.right<=innerWidth})"));const shot=await send('Page.captureScreenshot',{format:'png'});writeFileSync(`${out}/chaos-${width}.png`,Buffer.from(shot.data,'base64'));}
await size(1366,768);await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
check('Chaos Mode respects reduced motion',await ev("getComputedStyle(document.querySelector('.chaos-sticker')).animationName==='none'"));
check('cursor trail hidden for reduced motion',await ev("getComputedStyle(document.querySelector('canvas[data-cursor-trail]')).display==='none'"));
await send('Emulation.setEmulatedMedia',{features:[]});
await click("document.querySelector('button[aria-label=\"Turn sound on\"]')");await sleep(650);
check('teammate background track starts on explicit gesture',await ev("!document.querySelector('[data-background-audio]').paused&&document.querySelector('[data-background-audio]').getAttribute('src').includes('The%20base')"));
await click("document.querySelector('a[href=\"/futures/cloud\"]')");await sleep(500);
check('music changes to Cloud with one player',await ev("document.querySelectorAll('[data-background-audio]').length===1&&document.querySelector('[data-background-audio]').getAttribute('src')==='/bg-music/Cloud.mp4'"));
await click("document.querySelector('button[aria-label=\"Turn Chaos Mode off\"]')");
check('click sound matches Cloud',await ev("mediaLog.some(x=>x.kind==='play'&&x.src==='/audio/cloud.wav')"));
check('old track paused on route change',await ev("mediaLog.some(x=>x.kind==='pause'&&x.src?.includes('The%20base'))"));
await click("document.querySelector('button[aria-label=\"Turn sound off\"]')");
check('global mute pauses music',await ev("document.querySelector('[data-background-audio]').paused"));
await go('/');check('mute survives reload',await ev("document.querySelector('button[aria-label=\"Turn sound on\"]').getAttribute('aria-pressed')==='false'"));
await click("document.querySelector('button[aria-label=\"Turn sound on\"]')");await go('/');
check('remembered sound does not autoplay before a new gesture',await ev("document.querySelector('[data-background-audio]').paused&&mediaLog.filter(x=>x.kind==='play').length===0"));
await click("document.querySelector('button[aria-label=\"Turn sound off\"]')");
for(const slug of ['normal','blossom','star','cloud','aqua','inventor','forest','melody','luna']){await go(slug==='normal'?'/':`/futures/${slug}`);check('character route and cursor '+slug,await ev(`document.documentElement.dataset.paw===${JSON.stringify(slug)}&&document.querySelector('canvas').dataset.cursorTrail===${JSON.stringify(slug)}&&!!document.querySelector('h1')`));await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:260,y:280});await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:300,y:300});await sleep(70);const particles=await ev("Number(document.querySelector('canvas').dataset.particles||0)");check('bounded themed particles '+slug,particles>0&&particles<=24,{particles,fine:await ev("matchMedia('(hover:hover) and (pointer:fine)').matches")});}
await sleep(800);check('particles expire',await ev("document.querySelector('canvas').dataset.particles==='0'"));
await size(390,844);check('touch trail disabled',await ev("getComputedStyle(document.querySelector('canvas')).display==='none'"));await size(1366,768);
await go('/futures/melody/story');check('Melody uses global mute',await ev("[...document.querySelectorAll('[data-melody-audio] button')].some(b=>b.textContent==='Sound off')"));
await click("document.querySelector('button[aria-label=\"Turn sound on\"]')");
check('Melody updates from header sound toggle',await ev("[...document.querySelectorAll('[data-melody-audio] button')].some(b=>b.textContent==='Sound on')"));
await click("[...document.getElementById('project-lullaby-lab').querySelectorAll('button')].find(b=>b.textContent==='Play melody')");await sleep(500);
check('Melody project audio still works',await ev('audioContexts.length>0'));
await click("document.querySelector('button[aria-label=\"Turn sound off\"]')");
check('global mute stops Melody playback',await ev("document.getElementById('project-lullaby-lab').textContent.includes('Your lullaby is ready')"));
console.log('Visual, cursor, sound and counter checks complete. Testing the shared guestbook.');
await go('/memory-book');const beforePosts=requests.filter(r=>r.method==='POST'&&r.url.endsWith('/api/memories')).length;
await click("document.querySelector('#leave-memory button[type=submit]')");
check('invalid form does not submit',requests.filter(r=>r.method==='POST'&&r.url.endsWith('/api/memories')).length===beforePosts);
await fill('#leave-memory input[autocomplete=nickname]','Side Quest Check');await fill('#leave-memory textarea',marker+' Global guestbook verification.');
await click("document.querySelector('#leave-memory button[type=submit]')");await sleep(750);
check('live guestbook submission accepted for moderation',await ev("document.querySelector('#leave-memory').textContent.includes('has been received')"),await ev("document.querySelector('#leave-memory [role=status]').textContent"));
check('pending memory not added to lantern wall',await ev(`!document.querySelector('#read-memories').textContent.includes(${JSON.stringify(marker)})`));
const oldReads=requests.filter(r=>r.method==='GET'&&r.url.includes('/api/memories')).length;
await click(byText('Refresh memories'));check('manual refresh reads approved feed',requests.filter(r=>r.method==='GET'&&r.url.includes('/api/memories')).length>oldReads);
await go('/futures/luna/story');await click(byText('Tap to open and read'));
check('Luna shares the same refresh functionality',await ev("!!document.getElementById('project-moonlit-memory-book').querySelector('button[aria-busy]')"));
await fill('#project-moonlit-memory-book form input:not([tabindex])','Side Quest Check');await fill('#project-moonlit-memory-book textarea',marker+' Luna guestbook verification.');
await click("document.querySelector('#project-moonlit-memory-book button[type=submit]')");await sleep(750);
check('Luna submission waits for moderation',await ev("document.getElementById('project-moonlit-memory-book').textContent.includes('waiting to be checked')"),await ev("document.querySelector('#project-moonlit-memory-book form [role=status]').textContent"));
console.log('Live pending submissions sent. Testing approved display with isolated browser-only fixtures.');
fixture=true;await send('Fetch.enable',{patterns:[{urlPattern:'*/api/memories*'},{urlPattern:'*/api/visits*'}]});await go('/memory-book');
check('approved lantern rendered from shared feed',await ev("document.querySelector('#read-memories').textContent.includes('Browser Fixture 0')"));
await click(byText('Browser Fixture 0'));
check('lantern opens accessible dialog and treats text literally',await ev("!!document.querySelector('dialog[open]')&&document.querySelector('dialog').textContent.includes('<script>')&&!window.fixtureRan"));
await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
revision=1;await click(byText('Refresh memories'));check('newly approved lantern appears on refresh',await ev("document.querySelector('#read-memories').textContent.includes('Browser Fixture 1')"));
revision=2;console.log('Waiting for the real 45-second refresh interval.');await sleep(45500);
check('new approved lantern appears by polling',await ev("document.querySelector('#read-memories').textContent.includes('Browser Fixture 2')"));
unavailable=true;await go('/');check('counter handles API outage without invented count',await ev("document.querySelector('[data-visit-counter]').textContent.includes('counter is resting')"));
check('no route-change visit increments',requests.filter(r=>r.method==='POST'&&r.url.endsWith('/api/visits')).length===1);
// The outage was intentionally injected above, so its single resource error is expected.
const unexpected=problems.filter(p=>!p.includes('503'));
const report={marker,results,problems:unexpected,liveApiResponses:responses.filter(r=>!r.url.includes('limit=')).map(r=>({endpoint:new URL(r.url).pathname,status:r.status}))};
writeFileSync('docs/side-quests-browser.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok),problems:unexpected,marker},null,2));
await send('Page.close');ws.close();if(results.some(r=>!r.ok)||unexpected.length)process.exitCode=1;
