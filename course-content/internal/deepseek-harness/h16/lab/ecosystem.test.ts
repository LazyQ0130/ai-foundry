import assert from 'node:assert/strict';
import {test} from 'node:test';
import {isAbsolute} from 'node:path';
import {filePractice} from './file.ts';
import {shellPractice} from './shell.ts';
import {webPractice,webCases} from './web.ts';
import {mcpPractice} from './mcp.ts';
import {combinedPractice} from './combined.ts';
import {textOf} from './support.ts';
import {parseReadArgs} from '@deepseek-ai/dsh-tool-fs/src/read.ts';
import {validateFetchUrl} from '@deepseek-ai/dsh-web-fetch-http/src/policy.ts';
import {publicToolName} from '@deepseek-ai/dsh-mcp-client/src/tools.ts';
const names=(s:any[])=>s.map(t=>t.name).sort();
for(const [label,args] of [['offset-zero',{file_path:'a',offset:0}],['limit-over-cap',{file_path:'a',limit:3}],['blank-path',{file_path:' '}]])test('C File argument '+label,()=>{assert.throws(()=>parseReadArgs(args as any,2));});
for(const url of ['file:///fixture','ftp://fixture.invalid','https://name:pass@fixture.invalid','https://fixture.invalid/'+('x'.repeat(2100))])test('C HTTP URL hygiene '+url.slice(0,35),()=>{assert.throws(()=>validateFetchUrl(url));});
test('C MCP normalized names preserve identity and budget',()=>{const a=publicToolName('alpha','a.b'),b=publicToolName('alpha','a/b');assert.notEqual(a,b);assert.ok(a.length<=64&&b.length<=64);assert.equal(publicToolName('alpha','metadata'),'mcp__alpha__metadata');});
test('C MCP long raw names are stable and bounded',()=>{const raw='long'.repeat(40);assert.equal(publicToolName('alpha',raw),publicToolName('alpha',raw));assert.equal(publicToolName('alpha',raw).length,64);});
test('D A real File tools, streaming window, edits, optional policy and lifecycle',async()=>{
 const r=await filePractice(),at=(label:string)=>r.trace.find((x:any)=>x.label===label).result;
 assert.equal(at('create').isError,false);assert.deepEqual(at('window').value.lines.map((x:any)=>x.number),[2,3]);assert.equal(at('window').value.totalLines,4);
 assert.equal(at('ambiguous').error.info.code,'FS_AMBIGUOUS_EDIT');assert.equal(at('edit').isError,false);assert.equal(at('verify').value.lines[0].text,'title=ne... (line truncated to 8 chars)');
 assert.equal(at('length-cap').value.lines[0].text,'last-lin... (line truncated to 8 chars)');assert.equal(r.unseen.error.info.code,'FS_NOT_OBSERVED');assert.equal(r.withoutObservation.isError,false);
 assert.equal(at('cancel').isError,true);assert.equal(r.readImageWithoutAttachments,false);assert.equal(r.readImageWithMockAttachments,true);assert.equal(r.readImageAfterDispose,false);
 assert.equal(r.imageRouteRefusal.isError,true);assert.match(textOf(r.imageRouteRefusal),/model route|unknown|resolve|adapter/i);
 assert.deepEqual(names(r.readOnlySchemas),['read']);assert.deepEqual(r.afterToolDispose,[]);assert.equal(r.fileRemoved,true);
});
test('D B real Shell consumer/env/Jobs over explicit Mock Executor',async()=>{
 const r=await shellPractice();assert.equal(r.missingExecutor,true);assert.equal(r.normal.isError,false);assert.equal(r.normal.value.exitCode,0);
 assert.equal(r.nonzero.isError,false);assert.equal(r.nonzero.value.exitCode,7);assert.equal(r.withoutJobs.isError,true);assert.equal(r.cancelled.isError,true);
 assert.ok(!JSON.stringify(r.schemas).includes('run_in_background'));assert.ok(JSON.stringify(r.withJobsSchemas).includes('run_in_background'));
 assert.equal(r.background.value.kind,'background');assert.match(textOf(r.jobOutput),/project-check/);assert.equal(r.afterToolDispose,false);
 assert.ok(r.requests[0].dshEnv.DSH_HOME);assert.ok(isAbsolute(r.requests[0].workdir));
});
for(const kind of webCases)test('D C Web '+kind,async()=>{
 const r=await webPractice(kind);assert.deepEqual(names(r.schemas),['web_fetch','web_search']);assert.equal(r.offlineUrlPolicy.networkRequests,0);assert.equal(r.offlineUrlPolicy.loopbackAccepted,true);
 const failures:any={none:'WEB_PROVIDER_UNAVAILABLE',ambiguous:'WEB_PROVIDER_AMBIGUOUS','configured-missing':'WEB_PROVIDER_CONFIGURED_MISSING','configured-unavailable':'WEB_PROVIDER_CONFIGURED_UNAVAILABLE'};
 if(failures[kind]){assert.equal(r.search.isError,true);assert.equal(r.search.error.info.code,failures[kind]);assert.ok(names(r.admitted).includes('web_search'));}
 else if(kind==='not-ready'){assert.deepEqual(r.admitted,[]);assert.equal(r.search.isError,true);assert.equal(r.trace.filter(x=>x.stage==='search').length,0);}
 else{assert.equal(r.search.isError,false);assert.equal(r.search.value.sources.length,2);assert.equal(r.search.value.truncated,true);assert.ok(r.search.value.sources.every((s:any)=>s.summary.length<=12));assert.match(textOf(r.search),/untrusted data/);}
 if(kind==='explicit')assert.equal(r.trace.find(x=>x.stage==='search').id,'second');
 if(kind==='cancel')assert.equal(r.fetch.isError,true);
 else if(kind!=='not-ready'){assert.equal(r.fetch.isError,false);assert.equal(r.fetch.value.statusCode,404);assert.ok(textOf(r.fetch).length<=500);assert.match(textOf(r.fetch),/untrusted data/);assert.ok(!textOf(r.fetch).includes('hidden-bad'));assert.equal(r.fetch.meta.truncated,true);}
 assert.deepEqual(r.afterDispose,[]);
});
for(const reconnect of [false,true])test('D D actual MCP SDK stdio '+(reconnect?'one reconnect':'disconnect retained'),async()=>{
 const r=await mcpPractice(reconnect);assert.equal(r.a.isError,false);assert.equal(r.b.isError,false);
 const a=JSON.parse(textOf(r.a)),b=JSON.parse(textOf(r.b));assert.equal(a.rawTool,'metadata');assert.equal(b.rawTool,'metadata');assert.notEqual(a.server,b.server);
 assert.equal(r.resourceList.isError,false);assert.match(textOf(r.resource),/structured project metadata/);assert.equal(r.remoteError.isError,true);
 assert.ok(names(r.refreshed).includes('mcp__alpha__extra'));assert.deepEqual(names(r.afterFailedRefresh),names(r.refreshed));
 if(reconnect){assert.equal(r.afterReconnect.isError,false);assert.notEqual(JSON.parse(textOf(r.afterReconnect)).pid,a.pid);}
 else{assert.ok(names(r.afterDisconnect.schemas).includes('mcp__alpha__metadata'));assert.equal(r.afterDisconnect.call.isError,true);assert.equal(r.afterDisconnect.resource.isError,true);}
 assert.equal(r.hiddenResource.isError,true);assert.equal(r.visibleResource.isError,false);
 assert.ok(!names(r.afterAlpha).some(n=>n.startsWith('mcp__alpha__')));assert.deepEqual(r.afterDispose,[]);
});
for(const blocked of [false,true])test('D integrated AgentLoop '+(blocked?'remote discovery cannot expand allowlist':'four families'),async()=>{
 const r=await combinedPractice(blocked);assert.deepEqual(r.errors,[]);assert.equal(r.requests.length,blocked?3:2);assert.equal(r.prefixes.length,r.requests.length);
 for(const request of r.requests)assert.deepEqual(request.tools.map((t:any)=>t.name).sort(),r.allow.toSorted());
 const calls=r.facts.filter((e:any)=>e.type==='tool/call'),results=r.facts.filter((e:any)=>e.type==='tool/result');assert.equal(calls.length,blocked?7:5);assert.equal(results.length,calls.length);
 assert.ok(r.requests[1].messages.filter((m:any)=>m.role==='tool').length===5);
 if(blocked){const result=results.find((e:any)=>e.data.message.toolCallId==='blocked-write');assert.equal(result.data.message.isError,true);assert.equal(JSON.parse(textOf(r.observed.find(x=>x.callId==='check-counter').result)).writes,0);}
});
