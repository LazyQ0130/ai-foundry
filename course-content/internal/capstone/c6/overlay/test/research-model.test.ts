import assert from 'node:assert/strict'
import { test } from 'node:test'
import { decideResearchAction } from '../lib/research-model'

test('planner stop contract is explicit; invalid stop responses fail without retry', async () => {
 const previous=process.env.AI_RESEARCH_MODE
 process.env.AI_RESEARCH_MODE='real'
 try {
  for(const content of ['{"ready_to_synthesize":true}','{"ready_to_synthesize":false}','{"ready_to_synthesize":true,"extra":1}','not json']){
   let calls=0
   const result=decideResearchAction({query:'synthetic memory',brief:{goal:'memory',subquestions:['consistency']},turn:1,observations:[],signal:AbortSignal.timeout(3000)},async(messages,options)=>{
    calls++;assert.ok(JSON.stringify(messages).includes('A false value is invalid'));assert.equal(options.maxTokens,500)
    return {choices:[{finish_reason:'stop',message:{content}}]}
   })
   if(content==='{"ready_to_synthesize":true}')assert.deepEqual(await result,{type:'ready',toolCalls:[]})
   else await assert.rejects(result,/INVALID_MODEL_TURN/)
   assert.equal(calls,1)
  }
 }finally{if(previous===undefined)delete process.env.AI_RESEARCH_MODE;else process.env.AI_RESEARCH_MODE=previous}
})
