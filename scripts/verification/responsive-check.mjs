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
await Promise.all([send('Page.enable'),send('Runtime.enable'),send('Network.enable')]);await send('Fetch.enable',{patterns:[{urlPattern:'*/api/memories*'},{urlPattern:'*/api/visits*'}]});const slugs=['blossom','star','cloud','aqua','inventor','forest','melody','luna'];const routes=['/','/forms','/journey','/creations','/memory-book','/meet-maria',...slugs.flatMap(slug=>[`/futures/${slug}`,`/futures/${slug}/story`])];const sizes=[[1920,1080],[1366,768],[1024,768],[768,1024],[390,844],[360,800]];
for(const route of routes){await go(route);for(const [width,height]of sizes){await size(width,height);check(`layout ${route} ${width}x${height}`,await ev('document.documentElement.scrollWidth<=innerWidth'));}if(route.includes('/story')){await ev("document.getElementById('portfolio').scrollIntoView({behavior:'instant'})");await sleep(120);check('phone portfolios and three projects '+route,await ev("document.querySelectorAll('article[id^=project-]').length===3&&document.documentElement.scrollWidth<=innerWidth"));}}
writeFileSync('docs/responsive-browser.json',JSON.stringify({recordedAt:new Date().toISOString(),routes,viewports:sizes,results,problems},null,2)+'\n');console.log(JSON.stringify({passed:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok),problems},null,2));await send('Page.close');ws.close();if(results.some(r=>!r.ok)||problems.length)process.exitCode=1;
