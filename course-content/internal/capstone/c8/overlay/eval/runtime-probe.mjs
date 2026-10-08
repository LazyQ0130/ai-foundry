import { runResearchRuntime } from '../lib/research-runtime.ts'
export const externalReference = {sourceType:'CROSSREF',externalId:'10.1234/eval',title:'Synthetic abstract',sourceUrl:'https://doi.org/10.1234/eval',publishedYear:2025,supportLevel:'CLAIM_EVIDENCE',evidenceText:'Database-backed memory survives separate execution runs in this synthetic abstract.'}
export function evidence(text='Database-backed memory survives process restart.',key='gold-persistent') {
 return {chunkId:1,documentId:'synthetic',title:'Synthetic evidence',position:0,page:null,startOffset:0,endOffset:text.length,content:text,citationKey:key,contentHash:'synthetic',indexingVersion:'chunk-800-120-v1',similarity:1}
}
export async function runtime(overrides={}) {
 let step=0;const steps=[]
 const result=await runResearchRuntime({query:'memory',brief:{objective:'memory',subquestions:['memory'],successCriteria:['evidence']},signal:new AbortController().signal,deadlineAt:Date.now()+10000,
  reserveUnit:()=>true,beforeAction:async()=>{},decide:async turn=>turn?{type:'ready'}:{type:'tool',toolCalls:[{name:'search_knowledge',arguments:{query:'memory'}}]},
  search:async()=>[evidence()],startStep:async(kind,input,toolName)=>{steps.push({kind,input,toolName});return ++step},completeStep:async()=>{},failStep:async(id,code)=>steps.push({id,code}),...overrides})
 return {...result,steps}
}
