import assert from 'node:assert/strict'
import { test } from 'node:test'
import { randomUUID } from 'node:crypto'
import { canonicalizeKnowledgeNoteArgs, parseCanonicalArgs, argsHash, knowledgeActionKey,
  editActionInput, approveActionInput, rejectActionInput, emptyProposalInput } from '../lib/knowledge-note-contract'
import { APPROVAL_TTL_MS, issueKnowledgeApproval, verifyKnowledgeApproval, type ApprovalBinding } from '../lib/knowledge-note-approval'
import { generateKnowledgeNoteProposal } from '../lib/knowledge-note-provider'
import { insufficientReport, type GroundedReport } from '../lib/grounded-report'

const secret = 'unit-test-secret-only-'.repeat(3)
const args = { title: 'Note title', content: 'Research supports a limited conclusion.' }
const canonical = canonicalizeKnowledgeNoteArgs(args)
const binding: ApprovalBinding = { userId: 1, workspaceId: 2, runId: 3, actionId: randomUUID(),
  actionVersion: 1, canonicalArgsHash: argsHash(canonical) }
const report: GroundedReport = { answerability: 'grounded', summary: [{ text: args.content, citationKeys: ['key'] }], findings: [], analysis: [], conclusion: [] }

test('canonical args trim, use deterministic field order, reject extras and invalid stored forms', () => {
  assert.equal(canonicalizeKnowledgeNoteArgs({ content: ` ${args.content} `, title: ` ${args.title} ` }), canonical)
  assert.deepEqual(parseCanonicalArgs(canonical), args)
  assert.throws(() => parseCanonicalArgs(JSON.stringify({ content: args.content, title: args.title })))
  for (const field of ['workspaceId', 'ownerId', 'userId', 'runId', 'toolName']) {
    assert.throws(() => canonicalizeKnowledgeNoteArgs({ ...args, [field]: 99 }))
    assert.throws(() => editActionInput.parse({ ...args, expectedVersion: 1, [field]: 99 }))
  }
  assert.throws(() => canonicalizeKnowledgeNoteArgs({ title: ' ', content: 'valid' }))
  assert.throws(() => canonicalizeKnowledgeNoteArgs({ title: 'x'.repeat(121), content: 'valid' }))
  assert.throws(() => canonicalizeKnowledgeNoteArgs({ title: 'valid', content: 'x'.repeat(2001) }))
  assert.throws(() => approveActionInput.parse({ approvalToken: 'token', ...args }))
  assert.throws(() => rejectActionInput.parse({ expectedVersion: 1, approval: true }))
  assert.throws(() => emptyProposalInput.parse({ report }))
})
test('approval has short TTL, binds every identity/version/hash field, rejects malformed and tampered tokens', () => {
  const token = issueKnowledgeApproval(binding, secret, () => 1000)
  assert.equal(verifyKnowledgeApproval(token, binding, secret, () => 1001).actionVersion, 1)
  assert.throws(() => verifyKnowledgeApproval(token, binding, secret, () => 1000 + APPROVAL_TTL_MS))
  assert.throws(() => verifyKnowledgeApproval(token, binding, secret, () => 0), /INVALID_APPROVAL_TOKEN/)
  for (const field of ['userId', 'workspaceId', 'runId', 'actionVersion'] as const)
    assert.throws(() => verifyKnowledgeApproval(token, { ...binding, [field]: binding[field] + 1 }, secret, () => 1001))
  assert.throws(() => verifyKnowledgeApproval(token, { ...binding, actionId: randomUUID() }, secret, () => 1001))
  assert.throws(() => verifyKnowledgeApproval(token, { ...binding, canonicalArgsHash: 'f'.repeat(64) }, secret, () => 1001))
  const [payload, signature] = token.split('.')
  const changed = JSON.parse(Buffer.from(payload, 'base64url').toString())
  changed.actionVersion++
  for (const bad of ['', 'malformed', `${payload}.bad`, `${payload}.${signature.slice(0, -2)}xx`,
    `${Buffer.from(JSON.stringify(changed)).toString('base64url')}.${signature}`])
    assert.throws(() => verifyKnowledgeApproval(bad, binding, secret, () => 1001))
  assert.throws(() => issueKnowledgeApproval(binding, 'short'))
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString())
  assert.ok(!JSON.stringify(decoded).includes(args.content)); assert.ok(!('canonicalArgs' in decoded))
})
test('idempotency key changes with action, version, run or canonical content and stays stable otherwise', () => {
  const key = knowledgeActionKey(3, binding.actionId, 1, canonical)
  assert.equal(key, knowledgeActionKey(3, binding.actionId, 1, canonical))
  assert.notEqual(key, knowledgeActionKey(3, binding.actionId, 2, canonical))
  assert.notEqual(key, knowledgeActionKey(4, binding.actionId, 1, canonical))
  assert.notEqual(key, knowledgeActionKey(3, randomUUID(), 1, canonical))
  assert.notEqual(key, knowledgeActionKey(3, binding.actionId, 1, canonicalizeKnowledgeNoteArgs({ ...args, content: 'Human edit' })))
})
test('proposal provider summarizes persisted report, has no tools, rejects provider writes/new fields and insufficient report', async () => {
  const previous = process.env.AI_NOTE_MODE
  try {
    process.env.AI_NOTE_MODE = 'mock'
    const mock = await generateKnowledgeNoteProposal(report, [], new AbortController().signal)
    assert.ok(mock.content.includes(args.content))
    await assert.rejects(generateKnowledgeNoteProposal(insufficientReport(), [], new AbortController().signal), /RUN_NOT_ELIGIBLE/)
    process.env.AI_NOTE_MODE = 'real'
    let calls = 0
    const response = (value: unknown) => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(value) } }] })
    const result = await generateKnowledgeNoteProposal(report, [], new AbortController().signal, async (messages, options) => {
      calls++; assert.equal(options.tools, undefined); assert.ok(JSON.stringify(messages).includes('untrusted data'))
      return response(args)
    })
    assert.deepEqual(result, args); assert.equal(calls, 1)
    await assert.rejects(generateKnowledgeNoteProposal(report, [], new AbortController().signal,
      async () => response({ ...args, workspaceId: 999 })), /PROPOSAL_PROVIDER_FAILED/)
    await assert.rejects(generateKnowledgeNoteProposal(report, [], new AbortController().signal,
      async () => ({ choices: [{ finish_reason: 'tool_calls', message: { content: null, tool_calls: [{ name: 'save' }] } }] })), /PROPOSAL_PROVIDER_FAILED/)
    await assert.rejects(generateKnowledgeNoteProposal(report, [], new AbortController().signal,
      async () => { throw new Error('provider raw secret') }), /PROPOSAL_PROVIDER_FAILED/)
  } finally { if (previous === undefined) delete process.env.AI_NOTE_MODE; else process.env.AI_NOTE_MODE = previous }
})

test('real proposal prompt targets a margin below the strict character cap; valid output stays single-call without truncation', async () => {
  const previous = process.env.AI_NOTE_MODE
  process.env.AI_NOTE_MODE = 'real'
  try {
    for (const length of [1500, 2000]) {
      let calls = 0
      const content = 'x'.repeat(length)
      const result = generateKnowledgeNoteProposal(report, [], AbortSignal.timeout(3000), async (messages, options) => {
        calls++
        const prompt = JSON.stringify(messages)
        for (const instruction of ['1200-1600', 'HARD maximum of 2000', 'not tokens', 'limitations', 'entities and numbers', 'Human review'])
          assert.ok(prompt.includes(instruction))
        assert.equal(options.tools, undefined)
        assert.equal(options.maxTokens, 1800)
        return { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ title: args.title, content }) } }] }
      })
      if (length > 2000) await assert.rejects(result, /PROPOSAL_PROVIDER_FAILED/)
      else assert.equal((await result).content, content)
      assert.equal(calls, 1)
    }
  } finally { if (previous === undefined) delete process.env.AI_NOTE_MODE; else process.env.AI_NOTE_MODE = previous }
})


test('overlength-only proposal has one compression using exact proposal, shared signal, no research; fidelity preserved', async()=>{
 const previous=process.env.AI_NOTE_MODE;process.env.AI_NOTE_MODE='real'
 try{
  const facts='NumaDB did not improve latency by 37 ms. Orion may help; the result is uncertain and limited to the synthetic 2025 fixture.'
  const initial={title:'NumaDB / Orion limits',content:facts.repeat(30)},compressed={title:initial.title,content:facts}
  const signals:AbortSignal[]=[];let calls=0
  const result=await generateKnowledgeNoteProposal(report,[],AbortSignal.timeout(3000),async(messages,options)=>{
   signals.push(options.signal);calls++;assert.equal(options.tools,undefined);assert.equal(options.maxTokens,1800)
   if(calls===2){const sent=JSON.parse((messages[1] as {content:string}).content);assert.deepEqual(sent,{proposal:initial});assert.ok(!JSON.stringify(sent).includes(args.content))}
   return {choices:[{finish_reason:'stop',message:{content:JSON.stringify(calls===1?initial:compressed)}}]}
  })
  assert.equal(calls,2);assert.equal(signals[0],signals[1]);assert.deepEqual(result,compressed)
  for(const fact of ['NumaDB','Orion','did not','37 ms','2025','may','uncertain','limited to'])assert.ok(result.content.includes(fact))
  for(const altered of ['did improve','99 ms','certain result'])assert.ok(!result.content.includes(altered))
 }finally{if(previous===undefined)delete process.env.AI_NOTE_MODE;else process.env.AI_NOTE_MODE=previous}
})

test('compression eligibility fails closed; malformed/extra/title/type/finish/provider errors never retry',async()=>{
 const previous=process.env.AI_NOTE_MODE;process.env.AI_NOTE_MODE='real'
 try{
  const long={title:'valid',content:'x'.repeat(2200)}
  for(const value of [{...long,ownerId:99},{...long,title:'x'.repeat(121)},{...long,content:99},{...long,content:''},{...long,content:'x'.repeat(13000)},null,'malformed']){
   let calls=0
   await assert.rejects(generateKnowledgeNoteProposal(report,[],AbortSignal.timeout(3000),async()=>{calls++;return {choices:[{finish_reason:'stop',message:{content:value==='malformed'?'not JSON':JSON.stringify(value)}}]}}),/PROPOSAL_PROVIDER_FAILED/)
   assert.equal(calls,1)
  }
  for(const bad of [{choices:[{finish_reason:'length',message:{content:JSON.stringify(long)}}]},
   {choices:[{finish_reason:'stop',message:{content:JSON.stringify(long),tool_calls:[{name:'save'}]}}]}]){
   let calls=0;await assert.rejects(generateKnowledgeNoteProposal(report,[],AbortSignal.timeout(3000),async()=>{calls++;return bad}),/PROPOSAL_PROVIDER_FAILED/);assert.equal(calls,1)
  }
  for(const second of [{...long,content:'short',extra:true},'malformed']){
   let calls=0;await assert.rejects(generateKnowledgeNoteProposal(report,[],AbortSignal.timeout(3000),async()=>{calls++;return {choices:[{finish_reason:'stop',message:{content:second==='malformed'&&calls===2?'not JSON':JSON.stringify(calls===1?long:second)}}]}}),/PROPOSAL_PROVIDER_FAILED/);assert.equal(calls,2)
  }
  const aborted=new AbortController();let calls=0
  await assert.rejects(generateKnowledgeNoteProposal(report,[],aborted.signal,async()=>{calls++;aborted.abort();return {choices:[{finish_reason:'stop',message:{content:JSON.stringify(long)}}]}}),/PROPOSAL_PROVIDER_FAILED/);assert.equal(calls,1)
 }finally{if(previous===undefined)delete process.env.AI_NOTE_MODE;else process.env.AI_NOTE_MODE=previous}
})


test('otherwise-valid overlength twice produces grounded whole-Claim fallback with no third call', async () => {
 const previous=process.env.AI_NOTE_MODE;process.env.AI_NOTE_MODE='real'
 try {
  const facts=['NumaDB did not improve latency by 37 ms.', 'Orion may help; results remain uncertain.', 'Limited to the synthetic 2025 fixture; no generalization.']
  const full:GroundedReport={answerability:'grounded',summary:[{text:facts[0],citationKeys:['key']}],conclusion:[{text:facts[1],citationKeys:['key']}],findings:[{text:facts[2],citationKeys:['key']}],analysis:Array.from({length:8},(_,i)=>({text:String(i)+' '+ 'full claim '.repeat(45).trim(),citationKeys:['key']}))}
  const sources=[{citationKey:'key',title:'fixture',sourceType:'KNOWLEDGE',excerpt:'Never use raw excerpt facts'}]
  let calls=0;const logs:string[]=[];const original=console.info;console.info=(line)=>logs.push(String(line))
  let result
  try {result=await generateKnowledgeNoteProposal(full,sources,AbortSignal.timeout(3000),async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({title:calls++===0?'Initial valid title':'Compressed title',content:'x'.repeat(calls===1?2800:2600)})}}]}))}finally{console.info=original}
  assert.equal(calls,2);assert.equal(result.title,'Initial valid title');assert.ok(result.content.length<=1850)
  assert.ok(logs.some(line=>line.includes('GROUNDED_FALLBACK')))
  const originalClaims=[...full.summary,...full.conclusion,...full.findings,...full.analysis].map(c=>c.text)
  for(const paragraph of result.content.split('\n\n').filter(p=>!p.startsWith('## ')))assert.ok(originalClaims.includes(paragraph))
  for(const fact of facts)assert.ok(result.content.includes(fact))
  assert.ok(!result.content.includes('Never use raw excerpt facts'));canonicalizeKnowledgeNoteArgs(result)
  for(const invalid of [{...full,summary:[{text:'x'.repeat(501),citationKeys:['key']}]},{...full,summary:[{text:'unknown',citationKeys:['missing']}]}]){
   let count=0;await assert.rejects(generateKnowledgeNoteProposal(invalid,sources,AbortSignal.timeout(3000),async()=>{count++;return {choices:[{finish_reason:'stop',message:{content:JSON.stringify({title:'valid',content:'x'.repeat(2500)})}}]}}),/PROPOSAL_PROVIDER_FAILED/);assert.equal(count,2)
  }
 }finally{if(previous===undefined)delete process.env.AI_NOTE_MODE;else process.env.AI_NOTE_MODE=previous}
})


test('proposal safe logs distinguish normal model and successful bounded compression', async()=>{
 const previous=process.env.AI_NOTE_MODE;process.env.AI_NOTE_MODE='real';const original=console.info;const logs:string[]=[];console.info=line=>logs.push(String(line))
 try {
  for(const [initial,compressed,mode] of [[1500,0,'MODEL'],[2500,1400,'MODEL_COMPRESSED']] as const){
   let calls=0;logs.length=0
   const result=await generateKnowledgeNoteProposal(report,[],AbortSignal.timeout(3000),async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({title:'valid',content:'x'.repeat(calls++===0?initial:compressed)})}}]}))
   assert.equal(calls,compressed?2:1);assert.equal(result.content.length,compressed||initial);assert.ok(logs.some(line=>JSON.parse(line).proposalMode===mode))
  }
 }finally{console.info=original;if(previous===undefined)delete process.env.AI_NOTE_MODE;else process.env.AI_NOTE_MODE=previous}
})
