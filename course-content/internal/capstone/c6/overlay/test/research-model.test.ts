import assert from 'node:assert/strict'
import { test } from 'node:test'
import { decideResearchAction } from '../lib/research-model'
import { validateResearchToolCalls } from '../lib/research-tools'
import { runResearchRuntime } from '../lib/research-runtime'
import { chatCompletion } from '../lib/research-chat'

const input={query:'synthetic memory',brief:{goal:'memory',subquestions:['consistency']},turn:0,observations:[],signal:AbortSignal.timeout(30_000)}
const planner=(args:unknown,name='plan_research_step')=>({type:'function',function:{name,arguments:typeof args==='string'?args:JSON.stringify(args)}})
const ready=planner({action:'ready'})
async function decision(calls:unknown[]|undefined,finish='tool_calls',extra:Partial<Parameters<typeof decideResearchAction>[0]>={}) {
 return decideResearchAction({...input,...extra},async(_messages,options)=>{
  assert.equal(options.jsonMode,false);assert.equal(options.maxTokens,500)
  assert.equal(options.parallelToolCalls,false)
  assert.deepEqual(options.toolChoice,{type:'function',function:{name:'plan_research_step'}})
  assert.equal(options.tools?.length,1)
  assert.equal((options.tools![0] as {function:{name:string}}).function.name,'plan_research_step')
  return {choices:[{finish_reason:finish,message:{content:'untrusted planner prose',tool_calls:calls}}]}
 })
}
async function real(fn:()=>Promise<void>){const previous=process.env.AI_RESEARCH_MODE;process.env.AI_RESEARCH_MODE='real';try{await fn()}finally{if(previous===undefined)delete process.env.AI_RESEARCH_MODE;else process.env.AI_RESEARCH_MODE=previous}}

test('sole forced planner function maps private, ready and exact approved external decisions',()=>real(async()=>{
 const privateDecision=await decision([planner({action:'search_knowledge',query:'memory'})])
 assert.equal(privateDecision.type,'tool_calls');assert.deepEqual(validateResearchToolCalls(privateDecision.toolCalls),{query:'memory'})
 assert.deepEqual(await decision([ready]),{type:'ready',toolCalls:[]})
 const external=await decision([planner({action:'search_external_references',query:input.query})],'tool_calls',{sourcePolicy:'PRIVATE_AND_EXTERNAL'})
 assert.deepEqual(validateResearchToolCalls(external.toolCalls,'PRIVATE_AND_EXTERNAL'),{query:input.query})
}))

test('planner fails closed on envelope, shape, policy and exact-query violations',()=>real(async()=>{
 for(const calls of [undefined,[],[ready,ready],[planner({action:'ready'},'search_knowledge')],[planner('not JSON')],
  [planner({action:'ready',query:'extra'})],[planner({action:'delete_database'})],
  [planner({action:'search_knowledge',query:''})],[planner({action:'search_knowledge',query:'memory',workspaceId:99})],
  [planner({action:'search_external_references',query:input.query})]])await assert.rejects(decision(calls),/INVALID_MODEL_TURN/)
 for(const finish of ['stop','length','content_filter','unknown'])await assert.rejects(decision([ready],finish),/INVALID_MODEL_TURN/)
 for(const query of ['Synthetic memory',input.query+' ',input.query+' private evidence'])
  await assert.rejects(decision([planner({action:'search_external_references',query})],'tool_calls',{sourcePolicy:'PRIVATE_AND_EXTERNAL'}),/INVALID_MODEL_TURN/)
 await assert.rejects(decision([planner({action:'search_external_references',query:input.query})],'tool_calls',{
  sourcePolicy:'PRIVATE_AND_EXTERNAL',observations:[{query:input.query,matchCount:0,evidence:[],unavailable:'EXTERNAL_UNAVAILABLE'}]}),/INVALID_MODEL_TURN/)
}))

test('business registry independently rejects unknown, extra, multiple and planner functions',()=>{
 for(const calls of [[],[{name:'plan_research_step',arguments:'{"action":"ready"}'}],
  [{name:'unknown',arguments:'{}'}],[{name:'search_knowledge',arguments:'bad JSON'}],
  [{name:'search_knowledge',arguments:'{"query":"memory","workspaceId":99}'}],
  [{name:'search_knowledge',arguments:'{"query":"memory"}'},{name:'search_knowledge',arguments:'{"query":"memory"}'}]])assert.throws(()=>validateResearchToolCalls(calls))
})

test('ready without evidence stays insufficient; planner calls consume model units, zero business units',()=>real(async()=>{
 let units=0;const summaries:string[]=[]
 const result=await runResearchRuntime({query:input.query,brief:input.brief,signal:input.signal,deadlineAt:Date.now()+3000,reserveUnit:()=>++units<=10,beforeAction:async()=>{},
  decide:async()=>decision([ready]),search:async()=>{throw Error('MUST_NOT_SEARCH')},startStep:async(_kind,summary)=>{summaries.push(summary);return 1},
  completeStep:async(_id,summary)=>{summaries.push(summary)},failStep:async()=>{throw Error('MUST_NOT_FAIL_PROTOCOL')}})
 assert.equal(result.outcome,'INSUFFICIENT_EVIDENCE');assert.equal(result.modelCalls,1);assert.equal(result.toolCalls,0);assert.equal(units,1)
 assert.deepEqual(result.evidence,[]);assert.ok(!JSON.stringify({result,summaries}).includes('untrusted planner prose'))
}))

test('actual provider request forces sole function without JSON mode; default JSON mode preserved',()=>real(async()=>{
 const keys=['AI_CHAT_BASE_URL','AI_CHAT_API_KEY','AI_CHAT_MODEL','AI_CHAT_DISABLE_THINKING'];const previous=keys.map(k=>process.env[k]);const original=globalThis.fetch
 try{
  Object.assign(process.env,{AI_CHAT_BASE_URL:'https://provider.invalid',AI_CHAT_API_KEY:'synthetic-unit-only',AI_CHAT_MODEL:'qwen3.7-flash',AI_CHAT_DISABLE_THINKING:'1'})
  const bodies:Record<string,unknown>[]=[]
  globalThis.fetch=async(_url,options)=>{bodies.push(JSON.parse(String(options?.body)));return Response.json({choices:[{finish_reason:'tool_calls',message:{content:null,tool_calls:[ready]}}]})}
  await decideResearchAction(input)
  await chatCompletion([],{signal:input.signal,maxTokens:1800})
  assert.ok(!('response_format' in bodies[0]));assert.deepEqual(bodies[0].tool_choice,{type:'function',function:{name:'plan_research_step'}})
  assert.equal(bodies[0].parallel_tool_calls,false);assert.equal(bodies[0].enable_thinking,false)
  const tools=bodies[0].tools as {function:{name:string;parameters:{oneOf:{properties:{action:{const:string}}}[]}}}[]
  assert.equal(tools.length,1);assert.equal(tools[0].function.name,'plan_research_step')
  assert.deepEqual(tools[0].function.parameters.oneOf.map(x=>x.properties.action.const),['search_knowledge','ready'])
  assert.deepEqual(bodies[1].response_format,{type:'json_object'});assert.ok(!('tool_choice' in bodies[1]))
 }finally{globalThis.fetch=original;keys.forEach((key,i)=>{if(previous[i]===undefined)delete process.env[key];else process.env[key]=previous[i]})}
}))


test('search then ready counts two model decisions, one actual search and three units',()=>real(async()=>{
 let units=0
 const result=await runResearchRuntime({query:input.query,brief:input.brief,signal:input.signal,deadlineAt:Date.now()+3000,reserveUnit:()=>++units<=10,beforeAction:async()=>{},
  decide:async(turn)=>decision([turn===0?planner({action:'search_knowledge',query:'memory'}):ready]),search:async()=>[],
  startStep:async()=>1,completeStep:async()=>{},failStep:async()=>{throw Error('MUST_NOT_FAIL_PROTOCOL')}})
 assert.equal(result.outcome,'INSUFFICIENT_EVIDENCE');assert.equal(result.modelCalls,2);assert.equal(result.toolCalls,1);assert.equal(units,3)
}))
