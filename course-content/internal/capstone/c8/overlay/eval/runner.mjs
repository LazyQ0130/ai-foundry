import { readFile, mkdir, writeFile } from 'node:fs/promises'
const started=Date.now()
const options={}
let context
try {
 const argv=process.argv.slice(2)
 for(let i=0;i<argv.length;i++){
  if(['--case','--inject-failure','--compare-baseline'].includes(argv[i])) {const key=argv[i].slice(2);if(!argv[i+1]||argv[i+1].startsWith('--')||options[key])throw Error('INVALID_ARGUMENT');options[key]=argv[++i]}
  else if(argv[i]==='--real')options.real=true
  else throw Error('UNKNOWN_ARGUMENT')
 }
 const real=Boolean(options.real)
 if(real&&process.env.C8_REAL_EVAL!=='1')throw Error('REAL_EVAL_REQUIRES_OPT_IN')
 if(real&&(options['inject-failure']||options['compare-baseline']))throw Error('REAL_EVAL_NO_DETERMINISTIC_BASELINE_OR_INJECTION')
 const usage={modelCalls:0,embeddingCalls:0,externalCalls:0}
 const originalFetch=globalThis.fetch
 if(real){
  for(const key of ['AI_CHAT_API_KEY','AI_CHAT_MODEL','AI_EMBEDDING_API_KEY','AI_EMBEDDING_MODEL'])if(!process.env[key])throw Error('REAL_CONFIG_MISSING')
  if(process.env.AI_EMBEDDING_DIMENSION!=='1024')throw Error('REAL_DIMENSION_MISMATCH')
  for(const key of ['AI_EMBEDDING_MODE','AI_RESEARCH_MODE','AI_REPORT_MODE','AI_NOTE_MODE'])process.env[key]='real'
  globalThis.fetch=async(input,init)=>{
   const u=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url)
   const key=u.pathname.endsWith('/embeddings')?'embeddingCalls':u.pathname.endsWith('/chat/completions')?'modelCalls':u.hostname==='api.crossref.org'?'externalCalls':null
   if(key){usage[key]++;if(usage[key]>({modelCalls:10,embeddingCalls:16,externalCalls:2})[key])throw Error('REAL_CALL_BUDGET_EXHAUSTED')}
   const remaining=480000-(Date.now()-started)
   if(remaining<=0)throw Error('REAL_EVAL_DEADLINE')
   const deadline=AbortSignal.timeout(remaining)
   return originalFetch(input,{...init,signal:init?.signal?AbortSignal.any([init.signal,deadline]):deadline})
  }
 }
 const [{createContext},{makeReport,writeReport},module]=await Promise.all([import('./context.mjs'),import('./report.mjs'),import(real?'./real-cases.mjs':'./cases.mjs')])
 const matrix=module.cases
 if(!matrix.length||new Set(matrix.map(c=>c.id)).size!==matrix.length||matrix.some(c=>!c.id||!['functional','quality','safety','reliability'].includes(c.category)||!['deterministic','database','stub','real_optional'].includes(c.mode)||!c.subcases.length||typeof c.execute!=='function'))throw Error('INVALID_CASE_MATRIX')
 if(options['case']&&!matrix.some(c=>c.id===options['case']))throw Error('UNKNOWN_CASE')
 const injection=options['inject-failure']
 const injectCases={'unapproved-write':'unapproved-write','leak':'cross-workspace-isolation','unsupported-claim':'citation-support-gold','retrieval':'retrieval-gold','execution-error':'private-research'}
 if(injection&&(!injectCases[injection]||(options['case']&&options['case']!==injectCases[injection])))throw Error('INVALID_INJECTION_CASE')
 context=await createContext(real)
 const setupCalls={...usage}
 const results=[]
 const selected=options['case']?matrix.filter(c=>c.id===options['case']):matrix
 for(const item of selected){
  const start=performance.now(),before={...usage};let result
  try{
   if(Date.now()-started>(real?480000:120000))throw Error('EVAL_DEADLINE')
   if(injection==='execution-error'&&item.id===injectCases[injection])throw Error('INJECTED_EXECUTION_ERROR')
   result=await item.execute(context)
   if(item.id===injectCases[injection]){
    const key={'unapproved-write':'unapproved_writes',leak:'cross_workspace_leaks','unsupported-claim':'unsupported_deterministic_claims'}[injection]
    if(key){result.metrics[key]=(result.metrics[key]??0)+1;result.status='FAIL';result.assertions.push({name:'injected observation '+key,passed:false,expected:0,observed:1})}
    if(injection==='retrieval'){result.metrics.retrieval_hits=0;result.metrics.retrieval_rr=0;result.status='FAIL';result.assertions.push({name:'injected wrong Top3 observation',passed:false,expected:'gold evidence',observed:'distractor'})}
   }
  }catch{result={status:'INCOMPLETE',metrics:{},assertions:[{name:'case execution completed',passed:false}],errorCategory:'EVAL_EXECUTION_ERROR'}}
  if(real)for(const key of Object.keys(usage))result.metrics[key]=(result.metrics[key]??0)+usage[key]-before[key]
  const safe={id:item.id,category:item.category,mode:item.mode,subcaseCount:item.subcases.length,...result,latencyMs:Math.round(performance.now()-start)}
  results.push(safe);console.log(`${safe.status} ${item.id}`)
 }
 const report=makeReport(results,{total:matrix.length,partial:Boolean(options['case']),injected:injection??null,
  kind:real?'real-provider-product-eval':'deterministic-product-eval',versions:{chatModel:real?process.env.AI_CHAT_MODEL:'mock-report-v1',embeddingModel:real?process.env.AI_EMBEDDING_MODEL:'mock-embedding-v1',embeddingDimension:1024,parserVersion:'pdfjs-6.4.299-utf8-v1',indexingVersion:'chunk-800-120-v1',judgeModel:real&&process.env.C8_JUDGE==='1'?process.env.AI_CHAT_MODEL:null}})
 report.callAccounting={setupCalls,directPaidCalls:real?{...usage}:{modelCalls:0,embeddingCalls:0,externalCalls:0},
  httpWorkflowModelCalls:report.metrics.httpWorkflowModelCalls??0,httpWorkflowEmbeddingCalls:report.metrics.httpWorkflowEmbeddingCalls??0,
  note:'Real direct calls are counted at fetch; full-workflow calls derive from persisted steps plus brief/report/proposal. Mock metrics count only explicitly instrumented boundaries, not paid calls.',
  fixedRealBounds:{directChat:10,directEmbedding:16,directCrossref:2,fullWorkflows:2,maxResearchProviderUnitsEach:10,proposalChatCallsEach:1,deadlineMs:480000}}
 if(options['compare-baseline']){
  const {compareBaseline}=await import('./metrics.mjs')
  report.comparison=compareBaseline(report,JSON.parse(await readFile(options['compare-baseline'],'utf8')))
  if(report.comparison.regressed&&report.overall!=='INCOMPLETE')report.overall='FAIL'
  report.fullSuitePassed=report.scope==='full'&&report.overall==='PASS'
 }
 const location=await writeReport(report,real?(options['case']?`real-case-${options['case']}`:'real'):injection?`injected-${injection}`:options['case']?`case-${options['case']}`:'deterministic')
 console.log(JSON.stringify({overall:report.overall,summary:report.summary,metrics:report.metrics,report:location}))
 if(report.overall!=='PASS')process.exitCode=report.overall==='INCOMPLETE'?2:1
}catch{
 // Bootstrap, DB guard, missing fixture/import and baseline errors also fail closed.
 const report={version:1,overall:'INCOMPLETE',fullSuitePassed:false,errorCategory:'EVAL_SETUP_OR_REPORT_ERROR',scope:'unknown'}
 await mkdir('.runtime/capstone-eval/incomplete',{recursive:true})
 await writeFile('.runtime/capstone-eval/incomplete/report.json',JSON.stringify(report,null,2)+'\n')
 await writeFile('.runtime/capstone-eval/incomplete/report.md','# Capstone Product Eval\n\nOverall: **INCOMPLETE**. Setup, fixture, argument, baseline or report execution failed; inspect local configuration. No safety PASS is inferred.\n')
 console.log(JSON.stringify(report));process.exitCode=2
}finally{await context?.close()}
