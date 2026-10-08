import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { publicHttps } from './check-production-env.mjs'

export async function deliverySmoke({base,staging=false,local=false}) {
 if(!local&&!publicHttps(base))throw Error('PUBLIC_HTTPS_BASE_REQUIRED')
 if(local&&(!staging||process.env.C9_LOCAL_STAGING_SMOKE!=='1'||!['localhost','127.0.0.1'].includes(new URL(base).hostname)))throw Error('LOCAL_STAGING_OPT_IN_REQUIRED')
 const started=Date.now(),deadline=started+480_000;let calls=0,runCalls=0,phase='health',notesWritten=0,actionsProposed=0
 try {
 const fetchSafe=async(url,options={})=>{
  if(++calls>60||Date.now()>=deadline)throw Error('SMOKE_BUDGET_EXHAUSTED')
  return fetch(url,{...options,signal:AbortSignal.timeout(Math.min(130_000,deadline-Date.now()))})
 }
 async function call(route,{method='GET',cookie,body}={}) {
  const r=await fetchSafe(base+route,{method,headers:{...(cookie?{cookie}:{}),...(body!==undefined?{'content-type':'application/json'}:{})},body:body===undefined?undefined:JSON.stringify(body)})
  if(r.status>=400)throw Error('HTTP_'+r.status)
  return {status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],data:await r.json()}
 }
 assert.deepEqual((await call('/api/health')).data,{status:'ok'})
 phase='register'
 const username='smoke_'+Date.now().toString(36),password=randomBytes(24).toString('base64url')
 const user=await call('/api/auth/register',{method:'POST',body:{username,password}});assert.equal(user.status,201)
 phase='login'
 const login=await call('/api/auth/login',{method:'POST',body:{username,password}});assert.equal(login.status,200)
 const cookie=login.cookie;assert.ok(cookie)
 const me=await call('/api/auth/me',{cookie});assert.equal(me.status,200)
 const documentIds=[]
 // Full staging uses both formats; production uses one small synthetic TXT.
 for(const name of staging?['agent-memory-approaches.txt','valid-two-page.pdf']:['agent-memory-approaches.txt']){
  phase='upload_'+(name.endsWith('.pdf')?'PDF':'TXT')
  const bytes=await readFile(new URL('../test/fixtures/'+name,import.meta.url))
  const mimeType=name.endsWith('.pdf')?'application/pdf':'text/plain'
  const upload=await call('/api/knowledge/uploads',{method:'POST',cookie,body:{originalName:name,title:'[SMOKE] Synthetic research '+name,mimeType,byteSize:bytes.length}})
  assert.equal(upload.status,201)
  assert.ok((await fetchSafe(upload.data.uploadUrl,{method:'PUT',headers:{'content-type':mimeType},body:bytes})).ok)
  const indexed=await call(`/api/knowledge/documents/${upload.data.id}/process`,{method:'POST',cookie});assert.equal(indexed.status,200);assert.equal(indexed.data.status,'READY')
  documentIds.push(upload.data.id)
 }
 phase='private_retrieval'
 const search=await call('/api/knowledge/search',{method:'POST',cookie,body:{query:'persistent agent memory event log snapshot'}})
 assert.equal(search.status,200);assert.ok(search.data.matches.length>0)
 const runResults=[]
 for(const sourcePolicy of staging?['PRIVATE_ONLY','PRIVATE_AND_EXTERNAL']:['PRIVATE_AND_EXTERNAL']){
  phase=sourcePolicy+'_run'
  const task=await call('/api/research/tasks',{method:'POST',cookie,body:{title:'[SMOKE] Memory approaches',query:sourcePolicy==='PRIVATE_ONLY'?'Compare the append-only event log and snapshot-based key-value approaches to persistent agent memory described in my uploaded note. Focus on consistency and cost trade-offs. Use only this note.':'agent memory. Compare persistence approaches in my private note with public scholarly research. The note cannot establish published findings; add a clearly separated abstract-supported research perspective and cite both private and external evidence.'}})
  assert.equal(task.status,201)
  if(++runCalls>(staging?2:1))throw Error('RUN_BUDGET_EXHAUSTED')
  const result=await call(`/api/research/tasks/${task.data.task.id}/runs`,{method:'POST',cookie,body:{sourcePolicy}})
  assert.equal(result.status,201)
  if(result.data.status!=='COMPLETED')throw Error(['MODEL_FAILED','TIMEOUT','BUDGET_EXCEEDED','CANCELLED'].includes(result.data.errorCode)?result.data.errorCode:'RESEARCH_RUN_FAILED')
  const detail=await call(`/api/research/runs/${result.data.runId}`,{cookie});assert.equal(detail.status,200)
  assert.equal(detail.data.run.report.answerability,'grounded');assert.ok(detail.data.citations.length)
  assert.ok(detail.data.steps.some(s=>s.toolName==='search_knowledge'&&s.status==='COMPLETED'))
  if(sourcePolicy==='PRIVATE_AND_EXTERNAL'){assert.ok(detail.data.steps.some(s=>s.toolName==='search_external_references'&&s.status==='COMPLETED'));assert.ok(detail.data.citations.some(c=>c.sourceType==='CROSSREF'));assert.ok(detail.data.citations.some(c=>c.sourceType==='KNOWLEDGE'))}
  phase=sourcePolicy+'_report_and_citation_preview'
  for(const citation of detail.data.citations){assert.ok(citation.excerpt?.length);assert.ok(citation.sourceType)}
  if(sourcePolicy==='PRIVATE_ONLY'){runResults.push({sourcePolicy,status:'PASS',citations:detail.data.citations.length,privateCitations:detail.data.citations.filter(c=>c.sourceType==='KNOWLEDGE').length,noteCount:0});continue}
  phase='proposal'
  const proposed=await call(`/api/research/runs/${result.data.runId}/knowledge-note-proposal`,{method:'POST',cookie,body:{}});assert.equal(proposed.status,200)
  let action=proposed.data.action;actionsProposed++; assert.equal(action.status,'PROPOSED')
  const before=await call('/api/knowledge/notes',{cookie});assert.equal(before.data.notes.filter(n=>n.sourceRunId===result.data.runId).length,0)
  // This approval is the smoke operator's explicit review of synthetic data only.
  assert.ok(action.content.length>0&&action.content.length<=2000)
  phase='human_edit'
  const edited=await call(`/api/research/actions/${action.id}`,{method:'PATCH',cookie,body:{expectedVersion:action.version,title:'[SMOKE reviewed] Memory trade-offs',content:action.content}})
  assert.equal(edited.status,200);assert.equal(edited.data.action.version,action.version+1);assert.notEqual(edited.data.action.approvalToken,action.approvalToken)
  action=edited.data.action
  phase='approve_and_replay'
  const approve=()=>call(`/api/research/actions/${action.id}/approve`,{method:'POST',cookie,body:{approvalToken:action.approvalToken}})
  const saved=await approve(),replayed=await approve();assert.equal(saved.status,200);assert.equal(replayed.status,200)
  assert.equal(saved.data.note.id,replayed.data.note.id);assert.equal(replayed.data.replayed,true)
  notesWritten++
  const notes=await call('/api/knowledge/notes',{cookie});assert.equal(notes.data.notes.filter(n=>n.sourceRunId===result.data.runId).length,1);assert.equal(notes.data.notes.length,1)
  runResults.push({sourcePolicy,status:'PASS',citations:detail.data.citations.length,externalCitations:detail.data.citations.filter(c=>c.sourceType==='CROSSREF').length,noteCount:1})
 }
 phase='protected_source_access'
 for(const id of documentIds){
  const source=await call(`/api/knowledge/documents/${id}/source`,{cookie});assert.equal(source.status,200)
  const signed=await fetchSafe(source.data.url);assert.equal(signed.status,200)
  const unsigned=new URL(source.data.url);unsigned.search=''
  const anonymous=await fetchSafe(unsigned);assert.ok([401,403].includes(anonymous.status))
  if(!local){
   const cors=await fetchSafe(source.data.url,{method:'OPTIONS',headers:{origin:new URL(base).origin,'access-control-request-method':'PUT','access-control-request-headers':'content-type'}})
   assert.equal(cors.headers.get('access-control-allow-origin'),new URL(base).origin)
  }
 }
 console.log(JSON.stringify({result:'PASS',environment:local?'LOCAL PRODUCTION-LIKE VERIFIED':staging?'STAGING':'PRODUCTION SAFE',https:local?'NOT VERIFIED':'PASS',storageAccess:'SIGNED_GET_PASS_ANONYMOUS_DENIED',browserCors:local?'NOT VERIFIED':'PREFLIGHT_PASS_BROWSER_CONFIRM_REQUIRED',runs:runResults,knowledgeNotes:notesWritten,humanEdit:true,approvalReplay:true,anonymousSourceDenied:true,calls,elapsedMs:Date.now()-started}))
 }catch(error){console.error(JSON.stringify({result:'FAIL',phase,errorCategory:/^(?:HTTP_\d{3}|MODEL_FAILED|TIMEOUT|BUDGET_EXCEEDED|CANCELLED|RESEARCH_RUN_FAILED|SMOKE_BUDGET_EXHAUSTED|RUN_BUDGET_EXHAUSTED)$/.test(error.message)?error.message:error.code==='ERR_ASSERTION'?'CONTRACT_ASSERTION':error.name==='TimeoutError'?'TIMEOUT':'OTHER',retryOccurred:false,partialSideEffect:{researchRuns:runCalls,actionsProposed,knowledgeNotes:notesWritten},calls,elapsedMs:Date.now()-started}));throw Error('STAGING_SMOKE_FAILED')}
}
