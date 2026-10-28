/** Actual locked Cordis source probes. No model/network/private file operations. */
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const source = process.argv[2]
if (!source) throw new Error('Pass the locked source archive directory')
const { Context } = await import(pathToFileURL(resolve(source, 'vendor/cordis/src/index.ts')).href)
const ctx = new Context()
const checks: {name: string; status: string; observed: unknown}[] = []
try {
  const trace: string[] = []
  ctx.on('course/wrap', async (next: () => Promise<string>) => {
    trace.push('A before'); const v = await next(); trace.push('A after'); return '['+v+']'
  })
  ctx.on('course/wrap', async (next: () => Promise<string>) => {
    trace.push('B before'); const v = await next(); trace.push('B after'); return v+'!'
  })
  const result = await ctx.waterfall('course/wrap', async () => { trace.push('body'); return 'ok' })
  assert.deepEqual(trace, ['A before','B before','body','B after','A after'])
  assert.equal(result, '[ok!]')
  checks.push({name:'actual waterfall wraps returned Promise',status:'PASS',observed:{trace,result}})
  let called = false
  ctx.on('course/deny', () => 'denied')
  const denied = ctx.waterfall('course/deny', () => { called = true; return 'body' })
  assert.equal(denied, 'denied'); assert.equal(called,false)
  checks.push({name:'no next short-circuits fallback',status:'PASS',observed:{denied,bodyCalls:0}})
  const serial: string[] = []
  ctx.on('course/serial', async () => { serial.push('false'); return false })
  ctx.on('course/serial', async () => { serial.push('zero'); return 0 })
  ctx.on('course/serial', async () => { serial.push('unreachable') })
  assert.equal(await ctx.serial('course/serial'), 0)
  assert.deepEqual(serial,['false','zero'])
  checks.push({name:'serial false continues and zero bails',status:'PASS',observed:serial})
  let hits=0
  const fiber=ctx.plugin({name:'course-lifecycle-probe',apply(c: typeof ctx){ c.on('course/tick',()=>{hits++}) }})
  await fiber
  ctx.emit('course/tick'); assert.equal(hits,1)
  await fiber.dispose(); ctx.emit('course/tick'); assert.equal(hits,1)
  checks.push({name:'plugin disposal removes owned listener',status:'PASS',observed:{hits}})
} finally { await ctx.fiber.dispose() }
const { Session, SessionId } = await import(pathToFileURL(resolve(source, 'packages/core/session/src/index.ts')).href)
const { createUserMessage } = await import(pathToFileURL(resolve(source, 'packages/llm/llm/src/message.ts')).href)
const session = Session.create(SessionId('course-probe'))
session.append('turn/start', {turn:1})
const message = createUserMessage({content:[{type:'text',text:'fixture'}],source:{kind:'user'}})
session.append('user/message',message,{surfaceOp:'append'})
session.append('assistant/attempt',{turn:1,step:1,stream:[]})
session.append('turn/end',{turn:1,reason:{kind:'completed'}})
assert.deepEqual(session.deriveMessages().map((m: {role:string})=>m.role),['user'])
assert.equal(session.snapshotEvents().filter((e: {type:string})=>e.type==='assistant/attempt').length,1)
const view=session.deriveMessages(); view.length=0
assert.equal(session.deriveMessages().length,1)
checks.push({name:'actual Session derives messages and excludes attempt; outer array detached',status:'PASS',observed:{messageCount:1}})
const { default:SystemPrompt } = await import(pathToFileURL(resolve(source,'packages/core/system-prompt/src/index.ts')).href)
const { default:Tools, defineTool } = await import(pathToFileURL(resolve(source,'packages/core/tools/src/index.ts')).href)
const native = await import(pathToFileURL(resolve(source,'packages/core/tool-executor-native/src/index.ts')).href)
const { ToolCallId } = await import(pathToFileURL(resolve(source,'packages/llm/llm/src/brand.ts')).href)
const toolsCtx = new Context()
try {
  await toolsCtx.plugin(SystemPrompt); await toolsCtx.plugin(Tools); await toolsCtx.plugin(native)
  let bodies=0
  toolsCtx.tools.register(defineTool({name:'course_echo',description:'fixture only',parameters:{text:{type:'string'}},
    output:{schema:{type:'string'},render:(_a:unknown,v:string)=>[{type:'text',text:v}]},
    async execute(a:{text:string}){bodies++; return a.text}}))
  const call=()=>toolsCtx.tools.execute({calls:[{type:'tool-call',id:ToolCallId('probe-call'),name:'course_echo',arguments:'{"text":"fixture"}'}],signal:new AbortController().signal})
  await call(); assert.equal(bodies,1)
  const ungard=toolsCtx.tools.guard(()=> 'fixture owner denial')
  const observed: unknown[]=[]
  const stop=toolsCtx.on('tools/result',(_e:unknown,r:unknown)=>observed.push(r))
  await call(); assert.equal(bodies,1)
  assert.equal((observed[0] as {isError:boolean}).isError,true)
  assert.equal(Object.isFrozen(observed[0]),true)
  ungard(); stop()
  toolsCtx.on('tools/pre-execute',()=>Promise.resolve({kind:'ask'}))
  await call(); assert.equal(bodies,1)
  checks.push({name:'actual native pipeline: successful body, monotonic denial, frozen result, missing approval denies',status:'PASS',observed:{bodies,deniedError:true}})
} finally {await toolsCtx.fiber.dispose()}
const evidence={commit:'f3803c96974ad4a94195fb97e5c637e9c2a3afe3',kind:'actual-source-library-probes',
  scope:'Cordis, detached Session and native in-memory tools pipeline; not upstream Vitest suite, full AgentLoop, native sandbox or real Provider',checks}
await writeFile(new URL('../evidence/official-probes.json', import.meta.url),JSON.stringify(evidence,null,2)+'\n')
console.log(JSON.stringify(evidence))
