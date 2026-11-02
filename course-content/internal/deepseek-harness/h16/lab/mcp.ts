import * as McpClient from '@deepseek-ai/dsh-mcp-client';
import McpResources from '@deepseek-ai/dsh-mcp-resources';
import {publicToolName} from '@deepseek-ai/dsh-mcp-client/src/tools.ts';
import {createScope} from '@deepseek-ai/dsh-scope';
import {fileURLToPath} from 'node:url';
import {base,invoke,until,carrier} from './support.ts';
export async function mountMcp(ctx:any,name='alpha',reconnect=false){
 const env=Object.fromEntries(['HARNESS_SOURCE_CACHE','H16_DEPS_ANCHOR','H16_FS_DEPS_ANCHOR','H16_ECO_DEPS_ANCHOR'].map(k=>[k,process.env[k]!]));
 return ctx.plugin(McpClient,{transport:'stdio',serverName:name,command:process.execPath,
  args:['--import',new URL('./bootstrap.mjs',import.meta.url).href,fileURLToPath(new URL('./mcp-server.mjs',import.meta.url)),name],
  env,cwd:process.cwd(),toolCallTimeoutMs:3000,failOnStartupError:true,
  reconnect:{enabled:reconnect,initialDelayMs:50,maxDelayMs:200,maxAttempts:2}});
}
export async function mcpPractice(reconnect=false){
 const h=await base(),events:any[]=[];h.ctx.on('tools/change',()=>events.push({stage:'tools/change',names:h.ctx.tools.schemas().map(t=>t.name)}));
 const errors:string[]=[];h.ctx.logger.error=(s:any)=>{errors.push(String(s));};
 try{
  await h.ctx.plugin(McpResources);const alpha=await mountMcp(h.ctx,'alpha',reconnect),beta=await mountMcp(h.ctx,'beta');
  const initial=h.ctx.tools.schemas(),a=await invoke(h.ctx,'mcp__alpha__metadata',{}),b=await invoke(h.ctx,'mcp__beta__metadata',{});
  const resourceList=await invoke(h.ctx,'list_mcp_resources',{server:'alpha'}),resource=await invoke(h.ctx,'read_mcp_resource',{server:'alpha',uri:'fixture://project'});
  const remoteError=await invoke(h.ctx,'mcp__alpha__control',{action:'error'});
  await invoke(h.ctx,'mcp__alpha__control',{action:'add'});await until(()=>h.ctx.tools.get('mcp__alpha__extra')?true:undefined);const refreshed=h.ctx.tools.schemas();
  await invoke(h.ctx,'mcp__alpha__control',{action:'duplicate-list'});await until(()=>errors.some(s=>s.includes('re-sync failed'))?true:undefined);
  const afterFailedRefresh=h.ctx.tools.schemas();
  const cursor=events.length;await invoke(h.ctx,'mcp__alpha__control',{action:'disconnect'});
  let afterDisconnect:any,afterReconnect:any;
  if(reconnect){await until(()=>events.slice(cursor).some(e=>e.names.includes('mcp__alpha__metadata')&&!e.names.includes('mcp__alpha__extra'))?true:undefined);afterReconnect=await invoke(h.ctx,'mcp__alpha__metadata',{});}
  else{await until(()=>errors.some(s=>s.includes('connection lost'))?true:undefined);afterDisconnect={schemas:h.ctx.tools.schemas(),call:await invoke(h.ctx,'mcp__alpha__metadata',{}),resource:await invoke(h.ctx,'list_mcp_resources',{server:'alpha'})};}
  const scopeAgent=carrier(h.ctx,process.cwd(),'resource-scope');let local:any;
  const scoped=await h.ctx.plugin({inject:['mcpResources'],apply(owner){local=createScope(owner,scopeAgent);local.ctx.mcpResources.register('scope-only',{async request(){return {resources:[]};}});}});
  const hiddenResource=await invoke(h.ctx,'list_mcp_resources',{server:'scope-only'});
  const visibleResource=await invoke(h.ctx,'list_mcp_resources',{server:'scope-only'},scopeAgent);await scoped.dispose();
  await alpha.dispose();const afterAlpha=h.ctx.tools.schemas();await beta.dispose();const afterDispose=h.ctx.tools.schemas();
  return {transport:'ACTUAL_STDIO_CHILD_PROCESSES',sdk:'client/server 2.2.0; actual negotiation/discovery/calls/resources',reconnect,initial,a,b,resourceList,resource,remoteError,refreshed,afterFailedRefresh,afterDisconnect,afterReconnect,hiddenResource,visibleResource,afterAlpha,afterDispose,events,errors,
   normalized:[publicToolName('alpha','name.with.dot'),publicToolName('alpha','name/with/dot')],
   limits:'Trusted local fixture Server; no external endpoint, Streamable HTTP, credentials or full outage/backoff race matrix'};
 }finally{await h.close();}
}
