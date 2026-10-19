// Real-browser checks. Guestbook writes are isolated; live APIs are read-only.
import { mkdirSync, writeFileSync } from 'node:fs';
const [port='9444',origin='http://localhost:3000']=process.argv.slice(2);
if(!['localhost','127.0.0.1'].includes(new URL(origin).hostname))throw Error('Local verification only');
const out='.next/legendary-audit';mkdirSync(out,{recursive:true});
const target=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let serial=0,bookFixture=false;const pending=new Map(),results=[],problems=[],requests=[];
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,m=>m.error?reject(Error(m.error.message)):resolve(m.result));ws.send(JSON.stringify({id,method,params}));});
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);return;}
 if(m.method==='Runtime.exceptionThrown')problems.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
 if(m.method==='Network.requestWillBeSent')requests.push({url:m.params.request.url,method:m.params.request.method});
 if(m.method==='Fetch.requestPaused')void(async()=>{const p=m.params,u=new URL(p.request.url);let body;
  if(u.pathname==='/api/visits'&&p.request.method==='POST')body=await(await fetch(origin+'/api/visits')).json();
  if(u.pathname==='/api/memories'&&p.request.method==='POST')body={status:'pending'};
  if(u.pathname==='/api/memories'&&p.request.method==='GET'&&bookFixture)body={memories:Array.from({length:8},(_,i)=>({id:`00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,visitorName:`Isolated Reader ${i}`,message:i===0?'<img src=x onerror="window.injected=true"> A little wish.':`Approved fixture memory ${i}.`,formSlug:'luna',createdAt:new Date(Date.UTC(2026,9,19,8,i)).toISOString()})),nextCursor:null};
  if(body)await send('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:p.request.method==='POST'&&u.pathname==='/api/memories'?202:200,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(body)).toString('base64')});else await send('Fetch.continueRequest',{requestId:p.requestId});
 })().catch(e=>problems.push(e.message));
});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ev(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const check=(name,ok,detail)=>{results.push({name,ok:!!ok,...(detail===undefined?{}:{detail})});console.log(`${ok?'PASS':'FAIL'} ${name}`);};
async function go(path){await send('Page.navigate',{url:origin+path});await sleep(1250);}
async function size(width,height=844){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500});await send('Emulation.setTouchEmulationEnabled',{enabled:width<500});await sleep(120);}
async function key(key){await send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,...(key==='Enter'?{text:'\r',unmodifiedText:'\r'}:{}),windowsVirtualKeyCode:{Escape:27,ArrowRight:39,ArrowLeft:37,ArrowUp:38,Enter:13}[key]});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key});await sleep(150);}
async function shot(name){const r=await send('Page.captureScreenshot',{format:'png'});writeFileSync(`${out}/${name}.png`,Buffer.from(r.data,'base64'));}
await Promise.all([send('Page.enable'),send('Runtime.enable'),send('Network.enable')]);await send('Fetch.enable',{patterns:[{urlPattern:'*/api/memories*'},{urlPattern:'*/api/visits*'}]});await size(1366,900);await go('/');await ev("localStorage.removeItem('maria:journey-progress');localStorage.setItem('maria:sound','off')");
const slugs=['blossom','star','cloud','aqua','inventor','forest','melody','luna'];
for(let i=0;i<slugs.length;i++){const slug=slugs[i];await go(`/futures/${slug}/story`);
 if(slug==='star'){for(const label of ['A very faint star','Another faint star','A third faint star']){await ev(`(()=>{const e=document.querySelector('button[aria-label="${label}"]');e.scrollIntoView({block:'center',behavior:'instant'});e.focus()})()`);await key('Enter');}}
 else {await ev("(()=>{const e=document.querySelector('button[aria-label*=silver]')||document.querySelector('button[data-found]');e.scrollIntoView({block:'center',behavior:'instant'});e.focus()})()");await key('Enter');}
 check('secret collected and saved '+slug,await ev(`JSON.parse(localStorage.getItem('maria:journey-progress')).easterEggsFound.includes(${i+2})`));
 if(slug==='star')await ev("document.querySelector('button[aria-label=\"Hidden Constellation star\"]').focus()");await key('Enter');check('secret cannot count twice '+slug,await ev(`JSON.parse(localStorage.getItem('maria:journey-progress')).easterEggsFound.length===${i+1}`));
}
check('eight-secret feedback offers the ending',await ev("[...document.querySelectorAll('a')].some(a=>a.getAttribute('href')==='/journey#secret-ending')"));await go('/journey');check('existing ending content is visibly rendered',await ev("document.getElementById('secret-ending')?.textContent.includes('Every future was always a part of me.')&&document.getElementById('secret-ending').querySelector('img').getAttribute('src').includes('characters%2F1.png')"));await go('/journey');check('ending and all eight secrets survive reload',await ev("document.querySelectorAll('#secret-ending li').length===8&&JSON.parse(localStorage.getItem('maria:journey-progress')).easterEggsFound.length===8"));await size(360,800);await ev("document.getElementById('secret-ending').scrollIntoView({block:'center',behavior:'instant'})");check('secret ending fits a small phone',await ev('document.documentElement.scrollWidth<=innerWidth'));await shot('secret-ending-phone');
writeFileSync('docs/secrets-browser.json',JSON.stringify({recordedAt:new Date().toISOString(),results,problems},null,2)+'\n');console.log(JSON.stringify({passed:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok),problems},null,2));await send('Page.close');ws.close();if(results.some(r=>!r.ok)||problems.length)process.exitCode=1;
