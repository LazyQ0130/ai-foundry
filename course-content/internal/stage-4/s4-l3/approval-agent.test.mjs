import assert from 'node:assert/strict'
import test from 'node:test'
import { runAgent } from './common/lib/agent-runtime.ts'
import { modelTools, saveResearchNote, validateToolCall } from './common/lib/agent-tools.ts'
import { approvalTtlMs, canonicalizeSaveResearchNoteArgs, issueApprovalToken, verifyApprovalToken } from './common/lib/agent-approval.ts'

const secret = 'unit-only-high-entropy-secret-0123456789abcdefgh'
const args = { title: ' Git 恢复版本 ', content: ' 使用 reflog 查找历史引用。 ' }
const call = (name = 'save_research_note', value = args) => ({ id: 'write-1', type: 'function', function: {
  name, arguments: JSON.stringify(value),
} })
const turn = item => ({ finishReason: 'tool_calls', content: null, toolCalls: [item], usage: null })

test('write tool exposes exactly two arguments and strict server risk', () => {
  const visible = modelTools.find(item => item.function.name === 'save_research_note')
  assert.deepEqual(Object.keys(visible.function.parameters.properties), ['title', 'content'])
  assert.equal(visible.function.parameters.additionalProperties, false)
  assert.equal(saveResearchNote.risk, 'write')
  assert.deepEqual(validateToolCall(call()).args, { title: 'Git 恢复版本', content: '使用 reflog 查找历史引用。' })
  for (const bad of [{ title: '', content: 'x' }, { title: 'x', content: ' ' },
    { title: 1, content: 'x' }, { title: 'x'.repeat(101), content: 'x' },
    { title: 'x', content: 'x'.repeat(501) },
    ...['ownerId', 'userId', 'tag', 'important', 'id', 'extra'].map(key => ({ ...args, [key]: 1 }))])
    assert.throws(() => validateToolCall(call('save_research_note', bad)))
  assert.equal(canonicalizeSaveResearchNoteArgs({ content: ' c ', title: ' t ' }), '{"title":"t","content":"c"}')
})

test('valid write returns proposal without executing tool', async () => {
  const original = saveResearchNote.execute
  let executions = 0
  saveResearchNote.execute = async () => { executions++; throw new Error('MUST_NOT_EXECUTE') }
  try {
    const result = await runAgent({ goal: 'Git', userId: 17, availableTools: modelTools,
      reserve: () => true, model: async () => turn(call()),
      issueApproval: (normalized, userId) => issueApprovalToken({ userId, args: normalized, secret, now: () => 1000 }) })
    assert.equal(result.status, 'waiting_approval')
    assert.equal(result.modelCalls, 1); assert.equal(result.toolCalls, 0)
    assert.equal(executions, 0)
    assert.deepEqual(result.proposal.args, { title: 'Git 恢复版本', content: '使用 reflog 查找历史引用。' })
    assert.deepEqual(verifyApprovalToken({ token: result.approvalToken, userId: 17, secret, now: () => 1001 }), result.proposal.args)
  } finally { saveResearchNote.execute = original }
})

test('unknown write, bad arguments and absent approval capability fail closed', async () => {
  for (const item of [call('unknown_write_tool'), call('save_research_note', { ...args, ownerId: 2 })]) {
    const result = await runAgent({ goal: 'Git', userId: 17, availableTools: modelTools,
      reserve: () => true, model: async () => turn(item), issueApproval: () => 'unused' })
    assert.equal(result.status, 'failed'); assert.equal(result.toolCalls, 0)
  }
  const missing = await runAgent({ goal: 'Git', userId: 17, availableTools: modelTools,
    reserve: () => true, model: async () => turn(call()) })
  assert.equal(missing.status, 'failed'); assert.equal(missing.toolCalls, 0)
})

test('HMAC rejects payload mutations, signature, cross-user and expiry', () => {
  const token = issueApprovalToken({ userId: 17, args: { title: 'Git', content: 'reflog' }, secret, now: () => 1000 })
  const [encoded, signature] = token.split('.')
  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString())
  for (const changed of [
    { ...payload, canonicalArgs: '{"title":"evil","content":"reflog"}' },
    { ...payload, canonicalArgs: '{"title":"Git","content":"evil"}' },
    { ...payload, toolName: 'echo_research_topic' },
    { ...payload, userId: 18 },
    { ...payload, expiresAt: payload.expiresAt + approvalTtlMs },
    { ...payload, nonce: 'A'.repeat(32) },
  ]) {
    const tampered = `${Buffer.from(JSON.stringify(changed)).toString('base64url')}.${signature}`
    assert.throws(() => verifyApprovalToken({ token: tampered, userId: 17, secret, now: () => 1001 }))
  }
  assert.throws(() => verifyApprovalToken({ token: `${encoded}.${'A'.repeat(43)}`, userId: 17, secret, now: () => 1001 }))
  assert.throws(() => verifyApprovalToken({ token, userId: 18, secret, now: () => 1001 }))
  assert.throws(() => verifyApprovalToken({ token, userId: 17, secret, now: () => 1000 + approvalTtlMs }))
})
