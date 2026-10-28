/** 执行锁定源码的内存库级探针；不是官方 AgentLoop 集成测试。 */
import assert from 'node:assert/strict'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const source=process.argv[2];if(!source)throw Error('Pass locked source directory')
const load=(p:string)=>import(pathToFileURL(resolve(source,p)).href)
const {Session,SessionId}=await load('packages/core/session/src/index.ts')
const {createUserMessage,createAssistantMessage}=await load('packages/llm/llm/src/message.ts')
const {AssistantStreamAttempt}=await load('packages/core/agent-loop/src/assistant-stream.ts')
const checks:any[]=[]
const session=Session.create(SessionId('h03-memory-probe'))
session.append('turn/start',{turn:1});session.append('step/start',{turn:1,step:1})
session.append('user/message',createUserMessage({content:[{type:'text',text:'fixture only'}],source:{kind:'user'}}),{surfaceOp:'append'})
let revision=0;const frames:any[]=[]
const attempt=new AssistantStreamAttempt(session.id,1,()=>++revision,1,1,(frame:any)=>{
 if(frame.type==='end'&&frame.outcome.kind==='committed')assert.equal(session.snapshotEvents().at(-1).seq,frame.outcome.seq)
 frames.push(frame)
})
attempt.start();attempt.push({type:'text-delta',index:0,text:'资料摘要'})
assert.ok(!session.snapshotEvents().some((e:any)=>e.type==='assistant/message'))
checks.push({name:'live chunk is visible before any assistant settlement',status:'PASS'})
attempt.push({type:'finish',reason:{kind:'stop'}})
attempt.settle('assistant/message',()=>session.append('assistant/message',{
 turn:1,step:1,message:createAssistantMessage({content:attempt.blocks(),source:{provider:'mock',model:'mock'}}),stream:attempt.stream,
},{surfaceOp:'append'}).seq)
assert.deepEqual(frames.map(f=>f.type),['start','chunk','chunk','end'])
assert.equal(frames.at(-1).outcome.eventType,'assistant/message')
assert.ok(!session.snapshotEvents().some((e:any)=>e.type==='assistant/chunk'))
checks.push({name:'actual settle appends before committed end; compact stream is embedded',status:'PASS',seq:frames.at(-1).outcome.seq})
session.append('assistant/attempt',{turn:1,step:1,stream:[]})
session.append('step/end',{turn:1,step:1});session.append('turn/end',{turn:1,reason:{kind:'completed'}})
assert.deepEqual(session.deriveMessages().map((m:any)=>m.role),['user','assistant'])
const replay=Session.create(SessionId('h03-replay-probe'),structuredClone(session.snapshotEvents()))
assert.deepEqual(replay.deriveMessages(),session.deriveMessages())
checks.push({name:'actual detached Session replay derives same messages; boundaries/attempt excluded',status:'PASS'})
const abandoned:any[]=[]
const failed=new AssistantStreamAttempt(session.id,2,()=>++revision,1,1,(f:any)=>abandoned.push(f))
failed.start();assert.throws(()=>failed.settle('assistant/attempt',()=>{throw Error('fixture append refused')}),/fixture append refused/)
assert.equal(abandoned.at(-1).outcome.kind,'abandoned')
checks.push({name:'rejected append emits abandoned, never committed end',status:'PASS'})
const paths=['packages/core/session/src/index.ts','packages/core/agent-loop/src/assistant-stream.ts','packages/llm/llm/src/message.ts']
const files=await Promise.all(paths.map(async path=>({path,sha256:createHash('sha256').update(await readFile(resolve(source,path))).digest('hex')})))
await writeFile(new URL('../evidence/actual-probes.json',import.meta.url),JSON.stringify({commit:'f3803c96974ad4a94195fb97e5c637e9c2a3afe3',status:'PASS',scope:'4 actual-source in-memory library probes, not full AgentLoop, persistence flush or upstream suite',checks,files},null,2)+'\n')
console.log('PASS: 4 actual locked-source library probes; no model, network, private files or persistence')
