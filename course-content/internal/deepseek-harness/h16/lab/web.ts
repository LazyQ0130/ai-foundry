import WebRuntime from '@deepseek-ai/dsh-web';
import * as ToolWeb from '@deepseek-ai/dsh-tool-web';
import {validateFetchUrl} from '@deepseek-ai/dsh-web-fetch-http/src/policy.ts';
import {base,carrier,invoke,gate} from './support.ts';
export const webCases=['unique','explicit','none','ambiguous','configured-missing','configured-unavailable','not-ready','cancel'] as const;
export function webProviders(){
 const trace:any[]=[],entered=gate();let ready=true,wait=false;
 const search=(id:string)=>({id,available:()=>true,ready:async(route:any)=>{trace.push({stage:'searchReady',route});return ready;},
  async search(req:any,signal?:AbortSignal){trace.push({stage:'search',id,req});if(signal?.aborted)throw Error('fixture aborted');
   return {content:'offline fixture answer',sources:[1,2,3,4].map(n=>({url:`https://fixture.invalid/${n}`,title:`Doc ${n}`,summary:'long-summary-'.repeat(10)})),truncated:false};}});
 const fetch=(id:string)=>({id,available:()=>true,ready:async()=>ready,
  async fetch(req:any,signal?:AbortSignal){trace.push({stage:'fetch',id,req});entered.resolve();
   if(wait)await new Promise<void>((_r,reject)=>{if(signal?.aborted)reject(Error('fixture fetch aborted'));else signal?.addEventListener('abort',()=>reject(Error('fixture fetch aborted')),{once:true});});
   return {url:req.url,statusCode:404,body:{kind:'html' as const,content:'<h1>Fixture documentation</h1><script>hidden-bad</script><p>'+('Data only. '.repeat(150))+'</p>'},truncated:false};}});
 return {trace,search,fetch,entered,setReady(v:boolean){ready=v;},setWait(v:boolean){wait=v;}};
}
export async function mountWeb(ctx:any){const p=webProviders();await ctx.plugin(WebRuntime);ctx.web.registerSearchProvider(p.search('offline-search'));ctx.web.registerFetchProvider(p.fetch('offline-fetch'));await ctx.plugin(ToolWeb,{searchMaxResults:2,searchSummaryMaxChars:12,fetchMaxOutputChars:500});return p;}
export async function webPractice(kind:typeof webCases[number]='unique'){
 const h=await base(),p=webProviders(),agent=carrier(h.ctx,process.cwd(),'web');
 try{
  await h.ctx.plugin(WebRuntime,kind==='explicit'?{searchProvider:'second',fetchProvider:'fetch'}:kind==='configured-missing'?{searchProvider:'missing'}:kind==='configured-unavailable'?{searchProvider:'offline'}:{});
  if(kind!=='none'&&kind!=='configured-missing')h.ctx.web.registerSearchProvider(kind==='configured-unavailable'?{...p.search('offline'),available:()=>false}:p.search('first'));
  if(['explicit','ambiguous'].includes(kind))h.ctx.web.registerSearchProvider(p.search('second'));
  h.ctx.web.registerFetchProvider(p.fetch('fetch'));if(kind==='not-ready')p.setReady(false);
  const plugin=await h.ctx.plugin(ToolWeb,{searchMaxResults:2,searchSummaryMaxChars:12,fetchMaxOutputChars:500});
  const schemas=h.ctx.tools.schemas(),signal=new AbortController();
  const set=await h.ctx.tools.resolve({agent,modelSelection:{provider:'fixture',model:'text'},signal:signal.signal});
  const admitted=h.ctx.tools.schemas(agent,set);
  const search=await invoke(h.ctx,'web_search',{queries:['fixture docs']},agent,signal.signal,set);
  let fetch:any;
  if(kind==='cancel'){
   p.setWait(true);const pending=invoke(h.ctx,'web_fetch',{url:'https://fixture.invalid/docs'},agent,signal.signal,set);await p.entered.promise;signal.abort();fetch=await pending;
  }else fetch=await invoke(h.ctx,'web_fetch',{url:'https://fixture.invalid/docs'},agent,signal.signal,set);
  set.dispose();await plugin.dispose();
  const offlineUrlPolicy={loopbackAccepted:validateFetchUrl('http://127.0.0.1/').hostname==='127.0.0.1',networkRequests:0};
  return {kind,schemas,admitted,search,fetch,trace:p.trace,afterDispose:h.ctx.tools.schemas(),offlineUrlPolicy,
   boundary:'Real WebRuntime/tool-web/Tools/activation; memory providers only, no HTTP fetch, search API, DNS or network request'};
 }finally{await h.close();}
}
