import assert from 'node:assert/strict'
import test from 'node:test'
import { agentActionKey } from './common/lib/agent-idempotency.ts'
import { issueApprovalV2, verifyApprovalV2, approvalV2TtlMs } from './common/lib/agent-approval-v2.ts'
import { canonicalizeSaveResearchNoteArgs } from './common/lib/agent-approval.ts'

const secret = 'test-only-approval-secret-0123456789-abcdefghijklmnop'
const canonicalArgs = canonicalizeSaveResearchNoteArgs({ title: 'Git 恢复', content: 'reflog 可查引用。' })

test('action key is stable and each binding component changes it', () => {
  const key = agentActionKey('run-1', 'step-1', 'save_research_note', canonicalArgs)
  assert.match(key, /^[a-f0-9]{64}$/)
  assert.equal(key, agentActionKey('run-1', 'step-1', 'save_research_note', canonicalArgs))
  assert.notEqual(key, agentActionKey('run-2', 'step-1', 'save_research_note', canonicalArgs))
  assert.notEqual(key, agentActionKey('run-1', 'step-2', 'save_research_note', canonicalArgs))
  assert.notEqual(key, agentActionKey('run-1', 'step-1', 'save_research_note',
    canonicalizeSaveResearchNoteArgs({ title: 'Git 恢复', content: '其他内容' })))
})

test('V2 token binds user, run, action, tool, exact canonical args and expiry', () => {
  const now = 1000
  const token = issueApprovalV2({ userId: 17, runId: 'run-1', actionId: 'action-1', canonicalArgs, secret,
    now: () => now })
  const verified = verifyApprovalV2({ token, userId: 17, secret, now: () => now + 1 })
  assert.equal(verified.v, 2); assert.equal(verified.runId, 'run-1')
  assert.equal(verified.actionId, 'action-1'); assert.equal(verified.canonicalArgs, canonicalArgs)
  assert.throws(() => verifyApprovalV2({ token, userId: 18, secret, now: () => now + 1 }))
  assert.throws(() => verifyApprovalV2({ token, userId: 17, secret, now: () => now + approvalV2TtlMs }))
  const [encoded, signature] = token.split('.')
  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString())
  for (const change of [{ runId: 'run-2' }, { actionId: 'action-2' }, { toolName: 'other' },
    { canonicalArgs: canonicalizeSaveResearchNoteArgs({ title: 'evil', content: 'x' }) },
    { expiresAt: payload.expiresAt + 60000 }]) {
    const tampered = Buffer.from(JSON.stringify({ ...payload, ...change })).toString('base64url')
    assert.throws(() => verifyApprovalV2({ token: `${tampered}.${signature}`, userId: 17,
      secret, now: () => now + 1 }))
  }
})
