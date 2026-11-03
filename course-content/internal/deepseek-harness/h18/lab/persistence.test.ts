import {test} from 'node:test';
import {SessionPreparation,buildForkSeed} from '@deepseek-ai/dsh-session';
import {assert,backend,freshRoot,header,events,Context,SessionStore,SessionSeq,SessionId,user} from './support.ts';
import {handlePractice} from './handle.ts';
import {diskPractice} from './disk.ts';
import {semanticCase,physicalTail} from './recovery.ts';
import {forkPractice} from './fork.ts';
import {emptyPractice,leasePractice} from './ownership.ts';
import {bufferPractice} from './buffer.ts';
import {formatCase} from './format.ts';
import {integratedPractice,resumePractice} from './agent.ts';
test('C A: real JSONL handle access, ownership, lifecycle and contiguous batches',async()=>{const r=await handlePractice();assert.equal(r.events.length,5);});
test('C B raw: new backend and independent process reopen exactly the stored log',async()=>{await diskPractice();});
test('C B default compressed: actual Zstandard round trip and independent process',async()=>{await diskPractice('zstd');});
test('C empty: pending visibility, close discard and explicit flush materialization',async()=>{await emptyPractice();});
test('C lease: actual second process denied; reads allowed; release and holder exit',async()=>{await leasePractice();});
for(const kind of ['closed','open','not-started','unknown'] as const)test('C repair '+kind+': real JSONL prefix and conservative semantic closers',async()=>{await semanticCase(kind);});
test('C physical raw: ignore partial final line, repair only on new append',async()=>{await physicalTail();});
test('C physical zstd: recover complete record from torn checksum frame then rewrite',async()=>{await physicalTail('zstd');});
test('C live routing: failed flush retains events; explicit retry and close drain',async()=>{await bufferPractice();});
test('C D fork: multi-turn prefixes, marker, independent future, invalid cuts and identity',async()=>{await forkPractice();});
test('C fork seed: marker precedes child-owned closers; closed step is not retrospectively repaired',()=>{
 const open=events('unknown'),seed=buildForkSeed(open,SessionSeq(4));assert.deepEqual(seed.slice(0,5),open);
 assert.deepEqual(seed.slice(5).map(e=>e.type),['session/end-seed','tool/result','step/end','turn/end']);
 assert.deepEqual((seed.at(-1) as any).data.reason,{kind:'forked'});assert.deepEqual(seed[6].sourceEventSeqs,[4]);
 const closed=[...open,{type:'step/end' as const,seq:SessionSeq(5),time:2000,data:{turn:1,step:1}}];
 const after=buildForkSeed(closed,SessionSeq(5));assert.deepEqual(after.slice(6).map(e=>e.type),['session/end-seed','turn/end']);
});
test('C preparation: exact unpublished Session and synchronous idempotent release',async()=>{
 const ctx=new Context();await ctx.plugin(SessionStore);try{const s=ctx.sessions.prepare(SessionId('prepared'));let released=0;
 const p=SessionPreparation.create(s,{release:()=>{released++;}});assert.equal(p.session,s);assert.equal(ctx.sessions.get(s.id),undefined);
 assert.throws(()=>s.append('turn/start',{turn:1}),/outside/);p[Symbol.dispose]();p[Symbol.dispose]();assert.equal(released,1);
 }finally{await ctx.fiber.dispose();}
});
for(const kind of ['future','corrupt','ignorable','required','historical'] as const)test('C format '+kind+': refusal/classification and immutable fixture source',async()=>{await formatCase(kind);});
test('C append snapshots the accepted batch before caller mutation',async()=>{
 const root=await freshRoot('snapshot'),f=await backend(root),h=header('snapshot');try{const w=await f.store.create(h),log=events();
 const append=w.append(log);(log[0] as any).data.turn=99;await append;assert.equal((await w.read()).events[0].data.turn,1);
 await assert.rejects(w.append([{type:'turn/start',seq:5,time:2000,data:{turn:2,bad:1n}}] as any),/JSON/);assert.equal((await w.read()).events.length,5);await w.close();
 }finally{await f.close();}
});
test('C cancellation before backend work does not acknowledge an append',async()=>{
 const root=await freshRoot('cancel'),f=await backend(root),h=header('cancel'),controller=new AbortController(),reason=Error('controlled abort');controller.abort(reason);
 try{await assert.rejects(f.store.create(h,{signal:controller.signal}),e=>e===reason);assert.equal(await f.store.stat(h.id),undefined);
 const w=await f.store.create(h);await assert.rejects(w.append(events(),{signal:controller.signal}),e=>e===reason);
 assert.deepEqual((await w.read()).events,[]);await assert.rejects(w.flush({signal:controller.signal}),e=>e===reason);await w.close();assert.equal(await f.store.stat(h.id),undefined);
 }finally{await f.close();}
});
test('D resume: real Loop + JSONL repair and turn continuation without tool replay',async()=>{await resumePractice();});
test('D X: actual Agent task saved, closed, resumed and forked with independent futures',async()=>{const x=await integratedPractice();assert.equal(x.firstToolExecutions,1);assert.equal(x.replayedToolExecutions,0);});
