import assert from 'node:assert/strict'
import { test } from 'node:test'
import { plannerProtocol } from '../lib/planner-decision'

const turn=(args:unknown)=>({choices:[{finish_reason:'tool_calls',message:{content:null,tool_calls:[{type:'function',function:{name:'plan_research_step',arguments:JSON.stringify(args)}}]}}]})
test('C5 planner exposes private search and ready, strictly excludes external and extra fields',()=>{
 const protocol=plannerProtocol()
 assert.deepEqual(protocol.parse(turn({action:'ready'})),{type:'ready',toolCalls:[]})
 assert.deepEqual(protocol.parse(turn({action:'search_knowledge',query:'memory'})),{type:'tool_calls',toolCalls:[{name:'search_knowledge',arguments:'{"query":"memory"}'}]})
 for(const args of [{action:'search_external_references',query:'memory'},{action:'ready',query:'extra'},{action:'search_knowledge',query:'memory',workspaceId:2}])assert.throws(()=>protocol.parse(turn(args)),/INVALID_MODEL_TURN/)
})
