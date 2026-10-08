import { retrievalCases, realReportCases, documents } from './fixtures/gold.mjs'
import { probe } from './probe.mjs'
import { hitAtK, reciprocalRank, claimsOf, citationValidity, fixedNoteSignals } from './metrics.mjs'
import { retrieveKnowledgeEvidence } from '../lib/knowledge-retrieval.ts'
import { generateReport } from '../lib/report-provider.ts'
import { validateGroundedReport } from '../lib/grounded-report.ts'
import { searchCrossref } from '../lib/crossref-adapter.ts'
import { externalEvidence } from '../lib/external-contract.ts'
import { generateKnowledgeNoteProposal } from '../lib/knowledge-note-provider.ts'
import { judgeSupport } from './judge.mjs'
const cases=[]
const add=(id,subcases,execute)=>cases.push({id,category:'quality',mode:'real_optional',subcases,execute:async c=>{const p=probe();await execute(c,p);return p.result()}})
const toEvidence=doc=>({chunkId:1,documentId:doc.id,title:doc.title,position:0,page:null,startOffset:0,endOffset:doc.text.length,content:doc.text,citationKey:doc.citationKey,contentHash:doc.contentHash,indexingVersion:doc.indexingVersion,similarity:1})
add('real-retrieval',retrievalCases.map(c=>c.id),async(c,p)=>{
 for(const row of retrievalCases){const matches=await retrieveKnowledgeEvidence({workspaceId:c.alice.workspaceId,query:row.query,limit:3})
  const keys=matches.map(r=>c.seeded.find(d=>d.citationKey===r.citationKey)?.title??'unexpected'),hit=hitAtK(keys,row.relevantCitationKeys)
  p.count('retrieval_total');p.count('retrieval_hits',hit);p.count('retrieval_rr',reciprocalRank(keys,row.relevantCitationKeys))
  p.check(row.id+' returned bounded Top3',matches.length===3,row.relevantCitationKeys,keys)
 }
})
for(const row of realReportCases)add(row.id,['fixed evidence','structural validity','answerability'],async(c,p)=>{
 const evidence=row.sources.map(id=>toEvidence(c.seeded.find(d=>d.title===id)))
 const raw=await generateReport(row.query,evidence),report=validateGroundedReport(raw,evidence).report
 p.count('invalid_citations',citationValidity(report,evidence.map(e=>e.citationKey)))
 const correct=report.answerability===(row.answerable?'grounded':'insufficient_evidence')
 p.check('gold answerability',correct,row.answerable?'grounded':'insufficient_evidence',report.answerability)
 if(row.answerable){p.count('answerable_total');p.count('answerable_success',Number(correct))}
 else{p.count('abstention_total');p.count('abstention_success',Number(correct));p.count('real_unsupported_answers',Number(!correct))}
 p.count('semantic_review_required',claimsOf(report).length)
 if(row.id==='report-negation-number'){
  const text=claimsOf(report).map(claim=>claim.text).join(' ')
  p.check('fixed entity number and negation signals',/Model A/i.test(text)&&/(?:\b3\b|三)/.test(text)&&/(?:not|no improvement|没有|未显示|未观察|并未)/i.test(text))
 }
})
add('real-mixed-report',['real Crossref','private evidence','both source types'],async(c,p)=>{
 const refs=await searchCrossref({query:'persistent agent memory'})
 const external=refs.map(externalEvidence).filter(Boolean)
 p.check('Crossref yielded abstract evidence',external.length>0)
 if(!external.length)return
 const privateEvidence=toEvidence(c.seeded[0]),ev=[privateEvidence,external[0]]
 const report=validateGroundedReport(await generateReport('Compare one claim from each source, cite both. Distinguish the private fixture from the external abstract; do not imply full-paper access.',ev),ev)
 p.check('private and abstract both cited',report.cited.some(e=>e.sourceType==='CROSSREF')&&report.cited.some(e=>e.sourceType!=='CROSSREF'))
 p.count('invalid_citations',citationValidity(report.report,ev.map(e=>e.citationKey)));p.count('semantic_review_required',claimsOf(report.report).length)
})
add('real-note-fidelity',['actual proposal','number','entity','negation','no new numbers'],async(c,p)=>{
 const e=toEvidence(c.seeded.find(d=>d.title==='experiment')),r=toEvidence(c.seeded.find(d=>d.title==='retry'))
 const report=validateGroundedReport(await generateReport('State which model was tested, whether it improved and exactly how many retries are allowed. Preserve negatives.',[e,r]),[e,r]).report
 const proposal=await generateKnowledgeNoteProposal(report,[],AbortSignal.timeout(30000))
 // Explicit fixed-corpus lexical checks are an explainable quality signal, not a general semantic proof.
 const signals=fixedNoteSignals(proposal.content)
 let pass=Object.values(signals).every(Boolean)
 p.count('lexical_fidelity_flags',Number(!pass))
 if(process.env.C8_JUDGE==='1'){
  const judged=await judgeSupport(proposal.content,claimsOf(report).map(item=>item.text).join('\n'))
  p.count('judgeCalls');p.count('judge_supported',Number(judged.status==='supported'))
  pass=judged.status==='supported'
  p.check('optional judge fidelity signal',pass,'supported',judged.status)
 }else for(const [name,passed] of Object.entries(signals))p.check(name+' fixed fidelity signal',passed)
 p.count('note_fidelity_total');p.count('note_fidelity_pass',Number(pass));p.check('number entity negation preserved signal',pass)
 p.count('semantic_review_required')
})
for(const [index,query] of [
 'According to my private fixtures, which memory survives process restart? Compare persistent database memory with short-term context.',
 'According to my private fixtures, was Model A or Model B tested, did the experiment show improvement, and how many retries are allowed?',
].entries())add(`real-workflow-${index+1}`,['bounded workflow','persisted report','proposal','human approval'],async(c,p)=>{
 const t=await c.call('/api/research/tasks',{method:'POST',cookie:c.alice.cookie,body:{title:'Fixed real workflow',query}})
 p.check('task created',t.status===201)
 const run=await c.call(`/api/research/tasks/${t.data.task.id}/runs`,{method:'POST',cookie:c.alice.cookie,body:{}})
 p.check('real workflow completed',run.status===201&&run.data.status==='COMPLETED')
 if(!run.data.runId)return
 const detail=await c.call(`/api/research/runs/${run.data.runId}`,{cookie:c.alice.cookie})
 p.check('grounded report snapshots',detail.data.run.report?.answerability==='grounded'&&detail.data.citations.length>0)
 const proposal=await c.call(`/api/research/runs/${run.data.runId}/knowledge-note-proposal`,{method:'POST',cookie:c.alice.cookie,body:{}})
 p.check('real proposal generated',proposal.status===200)
 if(!proposal.data.action)return
 const noteCount=await c.prisma.knowledgeNote.count({where:{sourceRunId:run.data.runId}});p.count('unapproved_writes',noteCount)
 const action=proposal.data.action
 const saved=await c.call(`/api/research/actions/${action.id}/approve`,{method:'POST',cookie:c.alice.cookie,body:{approvalToken:action.approvalToken}})
 p.check('exact approved note',saved.status===200&&saved.data.note.content===action.content)
 p.count('duplicate_knowledge_notes',Math.max(0,(await c.prisma.knowledgeNote.count({where:{sourceRunId:run.data.runId}}))-1))
 p.count('httpWorkflowModelCalls',detail.data.steps.filter(s=>s.kind==='MODEL').length+3) // brief + report + proposal
 p.count('httpWorkflowEmbeddingCalls',detail.data.steps.filter(s=>s.toolName==='search_knowledge').length)
 p.count('toolCalls',detail.data.steps.filter(s=>s.kind==='TOOL').length)
})
// Prevent accidental dataset expansion from becoming an unbounded paid run.
if(cases.length!==9||documents.length!==6||retrievalCases.length!==10)throw Error('REAL_EVAL_MATRIX_REVIEW_REQUIRED')
export { cases }
