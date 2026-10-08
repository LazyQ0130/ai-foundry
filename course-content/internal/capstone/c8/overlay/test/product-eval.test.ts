import assert from 'node:assert/strict'
import test from 'node:test'
import { hitAtK, reciprocalRank, supportGold, noteFidelity, compareBaseline, fixedNoteSignals } from '../eval/metrics.mjs'
import { makeReport } from '../eval/report.mjs'
import { assertEvalDatabase } from '../eval/context.mjs'
import { semanticGold } from '../eval/fixtures/gold.mjs'
import { judgeContract, judgeSupport } from '../eval/judge.mjs'

test('retrieval metrics and semantic gold detect distractor, negation, number, entity and new facts', () => {
 assert.equal(hitAtK(['wrong','right'],['right']),1)
 assert.equal(hitAtK(['a','b','c','right'],['right']),0)
 assert.equal(reciprocalRank(['wrong','right'],['right']),.5)
 for(const row of semanticGold){for(const claim of row.supported)assert.equal(supportGold(claim,row.source,semanticGold),true)
  for(const claim of row.forbidden)assert.equal(supportGold(claim,row.source,semanticGold),false)}
 assert.equal(noteFidelity('3 retries Model A',['3 retries'],['30 retries','Model B']),true)
 assert.equal(noteFidelity('30 retries Model B',['3 retries'],['30 retries','Model B']),false)
 assert.equal(Object.values(fixedNoteSignals('Model A did not improve. 3 retries, not 30 retries.')).every(Boolean),true)
 assert.equal(Object.values(fixedNoteSignals('模型A没有改善。3次重试，而不是30次。')).every(Boolean),true)
 assert.equal(Object.values(fixedNoteSignals('Model A did not improve. 3 or 30 retries are allowed.')).every(Boolean),false)
})
test('hard gates are independent of pass rate and execution errors are INCOMPLETE',()=>{
 const row={id:'x',category:'safety',status:'PASS',latencyMs:1,assertions:[],metrics:{unapproved_writes:1}}
 assert.equal(makeReport([row],{total:1}).overall,'FAIL')
 assert.equal(makeReport([{...row,status:'INCOMPLETE',metrics:{}}],{total:1}).overall,'INCOMPLETE')
 assert.equal(makeReport([],{total:1}).overall,'INCOMPLETE')
 assert.equal(makeReport([{...row,metrics:{}}],{total:2,partial:true}).fullSuitePassed,false)
 assert.equal(makeReport([{...row,metrics:{}}],{total:1}).overall,'INCOMPLETE')
 assert.equal(makeReport([{...row,metrics:{}}],{total:1,kind:'real-provider-product-eval'}).hardGates.unapproved_writes.status,'SIGNAL_ONLY')
})
test('baseline compares reviewed versions and detects new failure and score regression',()=>{
 const row={id:'x',category:'quality',status:'PASS',latencyMs:1,assertions:[],metrics:{retrieval_total:10,retrieval_hits:10}}
 const report=makeReport([row],{total:1})
 const baseline={version:report.version,datasetVersion:report.datasetVersion,kind:report.kind,caseStatuses:{x:'PASS'},metrics:report.metrics}
 assert.equal(compareBaseline(report,baseline).regressed,false)
 assert.equal(compareBaseline({...report,results:[{...row,status:'FAIL'}]},baseline).regressed,true)
 assert.equal(compareBaseline({...report,metrics:{...report.metrics,retrieval_hit_at_3:.8}},baseline).regressed,true)
 assert.throws(()=>compareBaseline({...report,datasetVersion:'changed'},baseline))
})
test('eval DB guard rejects production platform ordinary dev and mismatched URLs',()=>{
 const url='postgresql://eval:local@127.0.0.1:55440/capstone_c8_eval?schema=public'
 assert.equal(assertEvalDatabase({...process.env,DATABASE_URL:url,TEST_DATABASE_URL:url}),'capstone_c8_eval')
 for(const bad of [url.replace('55440','5432'),url.replace('capstone_c8_eval','aifoundry'),url.replace('127.0.0.1','db.example.com'),url.replace('public','aifoundry_test')])
  assert.throws(()=>assertEvalDatabase({...process.env,DATABASE_URL:bad,TEST_DATABASE_URL:bad}))
 assert.throws(()=>assertEvalDatabase({...process.env,DATABASE_URL:url,TEST_DATABASE_URL:url+'x'}))
})
test('optional judge contract is strict and cannot masquerade as safety authorization',()=>{
 assert.equal(judgeContract.parse({status:'partially_supported',reason:'Limited evidence.'}).status,'partially_supported')
 assert.equal(judgeContract.safeParse({status:'supported',reason:'ok',approved:true}).success,false)
 assert.equal(judgeContract.safeParse({status:'approved',reason:'ok'}).success,false)
})
test('judge sees only bounded claim and cited excerpt, with no tools or identity',async()=>{
 const previous=process.env.C8_JUDGE;process.env.C8_JUDGE='1'
 try{
  const result=await judgeSupport('Synthetic claim','Synthetic excerpt',async(messages,options)=>{
   assert.deepEqual(Object.keys(JSON.parse((messages[1] as {content:string}).content)).sort(),['citedExcerpt','claim'])
   assert.equal('tools' in options,false)
   return {choices:[{finish_reason:'stop',message:{content:JSON.stringify({status:'supported',reason:'Matches excerpt.'})}}]}
  })
  assert.equal(result.status,'supported')
 }finally{if(previous===undefined)delete process.env.C8_JUDGE;else process.env.C8_JUDGE=previous}
})
