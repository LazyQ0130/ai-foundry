import { afterEach, describe, expect, it } from 'vitest';
import { createServer, type Server } from 'node:http';
import { requestSummary, SUMMARY_URL } from '../extension/src/api-client';
import { createApp } from '../api/src/app';
import type { Snapshot } from '../shared/contracts';
const snapshot=():Snapshot=>({tabId:1,url:'https://example.com/',title:'client fixture',text:'data',snapshotId:crypto.randomUUID(),contextToken:crypto.randomUUID(),capturedAt:new Date().toISOString(),truncated:false});
const servers:Server[]=[];
afterEach(async()=>{await Promise.all(servers.splice(0).map(s=>new Promise<void>(r=>{s.closeAllConnections();s.close(()=>r());})));});
async function client(server:Server) {
  servers.push(server);server.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const address=server.address();if(!address||typeof address==='string')throw Error('address');
  const transport:typeof fetch=(url,init)=>{expect(url).toBe(SUMMARY_URL);expect(init?.redirect).toBe('error');expect(init?.credentials).toBe('omit');return fetch(`http://127.0.0.1:${address.port}/api/ai/summary`,{...init,headers:{...init?.headers,Origin:`chrome-extension://${'a'.repeat(32)}`}});};
  return transport;
}
describe('actual HTTP tests of the shared Panel fetch client (NOT Panel UI)',()=>{
  it('matches request/snapshot IDs across the real API boundary',async()=>{
    const transport=await client(createServer(createApp(`chrome-extension://${'a'.repeat(32)}`)));
    expect(await requestSummary(snapshot(),new AbortController().signal,transport)).toMatchObject({provider:'mock'});
  });
  it.each(['bad-json','wrong-id','wrong-schema','http-error','redirect'])('rejects %s',async mode=>{
    const transport=await client(createServer((_req,res)=>{
      res.setHeader('Content-Type','application/json');
      if(mode==='http-error'){res.writeHead(503);res.end('{}');}
      else if(mode==='redirect'){res.writeHead(302,{Location:'http://127.0.0.1:1/forbidden'});res.end();}
      else res.end(mode==='bad-json'?'not JSON':mode==='wrong-schema'?'{}':JSON.stringify({requestId:crypto.randomUUID(),snapshotId:crypto.randomUUID(),provider:'mock',text:'wrong IDs'}));
    }));
    await expect(requestSummary(snapshot(),new AbortController().signal,transport)).rejects.toThrow();
  });
  it('bounds stalled HTTP and allows a subsequent request',async()=>{
    let calls=0;
    const transport=await client(createServer((_req,res)=>{if(++calls>1){res.writeHead(503);res.end('{}');}}));
    await expect(requestSummary(snapshot(),new AbortController().signal,transport,40)).rejects.toMatchObject({name:'AbortError'});
    await expect(requestSummary(snapshot(),new AbortController().signal,transport)).rejects.toThrow('API_HTTP_503');
  });
  it('propagates external cancellation before or during fetch',async()=>{
    const transport=await client(createServer(()=>{}));const controller=new AbortController();
    const pending=requestSummary(snapshot(),controller.signal,transport);controller.abort();await expect(pending).rejects.toMatchObject({name:'AbortError'});
    await expect(requestSummary(snapshot(),controller.signal,transport)).rejects.toMatchObject({name:'AbortError'});
  });
  it('reports a stopped local service without hanging',async()=>{
    const server=createServer();const transport=await client(server);await new Promise<void>(r=>server.close(()=>r()));
    await expect(requestSummary(snapshot(),new AbortController().signal,transport)).rejects.toThrow();
  });
});
