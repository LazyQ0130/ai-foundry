import {test} from 'node:test'
import assert from 'node:assert/strict'
import * as m from './reference.mjs'
test('M1 responsibility: model proposes and runtime executes',()=>assert.deepEqual(m.classifyResponsibilities(),{propose:'model',execute:'runtime',record:'runtime',approve:'trusted policy/user channel'}))
test('M1 patch replaces whole config and reports missing targets',()=>{
 const input=[{id:'a',config:{provider:'p',model:'x'}}]
 const r=m.composeRows(input,[{id:'a',config:{model:'y'}},{id:'missing',config:{}}])
 assert.deepEqual(r.rows,[{id:'a',config:{model:'y'}}]);assert.deepEqual(r.warnings,['missing:missing']);assert.equal(input[0].config.provider,'p')
})
test('M2 wraps before and after and can stop default',async()=>{
 const trace=[];const v=await m.wrap([async next=>{trace.push('A+');const x=await next();trace.push('A-');return x},async next=>{trace.push('B+');const x=await next();trace.push('B-');return x}],()=>{trace.push('body');return 7})
 assert.equal(v,7);assert.deepEqual(trace,['A+','B+','body','B-','A-']);assert.equal(m.wrap([()=>0],()=>{throw Error('must not run')}),0)
})
test('M2 plugin duplicate, empty value and idempotent cleanup',()=>{
 const r=new m.MemoryRegistry(),dispose=m.countWordsPlugin(r)
 assert.equal(r.call('count_words',''),0);assert.equal(r.call('count_words','one two'),2);assert.throws(()=>m.countWordsPlugin(r),/duplicate/)
 dispose();dispose();assert.deepEqual(r.names(),[]);assert.throws(()=>r.call('count_words','x'),/unknown/)
})
test('M3 zero-step turns use no model',async()=>{
 for(const options of [{reject:true},{empty:true}]){const r=await m.boundedLoop(options);assert.equal(r.calls.model,0);assert.ok(!r.events.includes('step/start'))}
})
test('M3 tool result owes another model request',async()=>{
 const r=await m.boundedLoop({responses:['tool','done']});assert.equal(r.calls.model,2);assert.equal(r.calls.tools,1);assert.equal(r.events.at(-1),'turn/end:completed')
})
test('M3 cancellation blocks subsequent tool and partial JSON never executes',async()=>{
 const r=await m.boundedLoop({responses:['tool'],cancelAt:1});assert.equal(r.calls.tools,0)
 const p=await m.boundedLoop({responses:['partial-json']});assert.equal(p.calls.tools,0);assert.equal(p.events.at(-1),'turn/end:error')
})
test('M3 retry does not duplicate entered user input',async()=>{
 const r=await m.boundedLoop({failOnce:true});assert.equal(r.calls.model,2);assert.deepEqual(r.messages,['user:fixture'])
})
test('M3 bound calls reject altered config and second dispatch',()=>{
 const f=m.oneUseCall({model:'a'},()=>1);assert.throws(()=>f({model:'b'}),/INVALID/);assert.equal(f({model:'a'}),1);assert.throws(()=>f({model:'a'}),/INVALID/)
})
test('M3 adapter ownership controls private replay state',()=>{
 const source={source:{provider:'p',replayState:{private:'fixture'}}},a={},b={}
 assert.equal(m.replayStateFor(source,a,b).source.replayState,undefined);assert.deepEqual(m.replayStateFor(source,a,a),source);assert.ok(source.source.replayState)
})
test('M4 self registration and global restriction differ',()=>assert.deepEqual(m.visibleTools(['read','write'],['write'],['write']),['read','write']))
test('M4 unknown or hidden tools never run',async()=>assert.equal((await m.pipeline({name:'write'})).counts.body,0))
test('M4 ask missing/rejected/guard cannot run body',async()=>{
 for(const options of [{pre:'ask'},{pre:'ask',approval:'rejected'},{pre:'ask',approval:'allowed-once',guard:true}]){const r=await m.pipeline(options);assert.equal(r.counts.body,0);assert.equal(r.result.isError,true)}
})
test('M4 approved allowed path runs exactly once',async()=>{const r=await m.pipeline({pre:'ask',approval:'allowed-once'});assert.equal(r.counts.body,1);assert.equal(r.result.isError,false)})
test('M4 post block is not side-effect rollback; result frozen',async()=>{
 const r=await m.pipeline({postBlock:true});assert.equal(r.counts.body,1);assert.equal(r.result.isError,true);assert.ok(Object.isFrozen(r.result));assert.throws(()=>{r.result.isError=false},TypeError)
})
test('M4 body errors survive as errors',async()=>assert.equal((await m.pipeline({throwBody:true})).result.text,'body-error'))
test('M5 replay/replace keeps canonical facts; seq gap rejects',()=>{
 const log=[{seq:0,type:'message/add',data:{text:'a'}},{seq:1,type:'message/add',data:{text:'b'}},{seq:2,type:'view/replace',data:{targets:[0,1],text:'summary'}}],before=JSON.stringify(log)
 assert.deepEqual(m.foldLog(log),{factCount:3,messages:['summary']});assert.equal(JSON.stringify(log),before);assert.throws(()=>m.foldLog([log[1]]),/gap/)
})
test('M5 fork prefix is independent and unknown write cannot be retried blindly',()=>{
 const parent=[{seq:0,type:'message/add',data:{text:'parent'}}],child=m.forkLog(parent,1);child[0].data.text='child';assert.equal(parent[0].data.text,'parent');assert.equal(m.mayRetry('unknown-write'),false);assert.equal(m.mayRetry('business-idempotent'),true)
})
test('M5 compaction quality and length are distinct measured quantities',()=>{
 const r=m.compactComparison(['factA:alpha '.repeat(8),'factB:beta '.repeat(8)],'factA:alpha',['factA','factB']);assert.equal(r.full.facts,2);assert.equal(r.summary.facts,1);assert.ok(r.summary.characters<r.full.characters)
})
test('M6 parent/caller delivery and cancellation ownership',()=>{
 const t=new m.ChildTasks();t.start('a','parent');t.start('b','caller');t.settle('a');t.settle('b');assert.deepEqual(t.notifications,['a']);t.start('c');t.cancel();assert.deepEqual(t.statuses(),['completed','completed','cancelled']);assert.throws(()=>t.start('d'),/closed/)
})
test('M6 late generation cannot replace successful current tools',()=>{
 const b=new m.GenerationBridge(),a=b.begin(),c=b.begin();b.publish(c,['read']);assert.equal(b.publish(a,['write']),false);assert.equal(b.publish(c,['write'],false),false);assert.deepEqual(b.tools,['read']);b.dispose();assert.deepEqual(b.tools,[])
})
test('M6 virtual scheduler deterministic and repeat delivery guarded',()=>{
 const seen=new Set(),s={id:'fixture',at:10,message:'wake'};assert.deepEqual(m.deliverDue(s,9,seen),[]);assert.deepEqual(m.deliverDue(s,10,seen),['wake']);assert.deepEqual(m.deliverDue(s,11,seen),[])
})
test('M6 desktop fixture cancellation cannot undo delivered input',()=>{
 const c=new AbortController();let state={clicks:0};state=m.canvasAction(state,c.signal);c.abort();state=m.canvasAction(state,c.signal);assert.equal(state.clicks,1)
})
test('M6 dependency order, cycles and missing artifacts',()=>{
 const g={types:[],host:['types'],desktop:['host'],client:['desktop'],web:['client'],check:['types']},o=m.topo(g)
 assert.ok(o.indexOf('types')<o.indexOf('host'));assert.ok(o.indexOf('desktop')<o.indexOf('client'));assert.throws(()=>m.topo({a:['b'],b:['a']}),/cycle/);assert.throws(()=>m.topo({a:['missing']}),/artifact/)
})
