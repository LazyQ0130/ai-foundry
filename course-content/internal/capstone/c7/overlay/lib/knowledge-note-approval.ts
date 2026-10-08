import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { argsHash } from './knowledge-note-contract'

export const APPROVAL_TTL_MS = 5 * 60 * 1000
const bindingSchema = z.object({
  userId: z.number().int().positive(), workspaceId: z.number().int().positive(),
  runId: z.number().int().positive(), actionId: z.string().uuid(), actionVersion: z.number().int().positive(),
  canonicalArgsHash: z.string().regex(/^[a-f0-9]{64}$/),
}).strict()
const payloadSchema = bindingSchema.extend({
  v: z.literal(1), aud: z.literal('capstone-knowledge-write'),
  toolName: z.literal('SAVE_KNOWLEDGE_NOTE'), expiresAt: z.number().int().positive(),
  nonce: z.string().regex(/^[A-Za-z0-9_-]{22,64}$/),
}).strict()
export type ApprovalBinding = z.infer<typeof bindingSchema>
const key = (secret: string) => {
  if (Buffer.byteLength(secret, 'utf8') < 32) throw new Error('APPROVAL_NOT_CONFIGURED')
  return Buffer.from(secret, 'utf8')
}
export const assertApprovalConfigured = (secret: string) => { key(secret) }
export function actionBinding(action: { id: string; runId: number; version: number; canonicalArgs: string }, userId: number, workspaceId: number): ApprovalBinding {
  return { userId, workspaceId, runId: action.runId, actionId: action.id,
    actionVersion: action.version, canonicalArgsHash: argsHash(action.canonicalArgs) }
}
export function issueKnowledgeApproval(binding: ApprovalBinding, secret: string, now: () => number = Date.now) {
  const payload = payloadSchema.parse({ ...binding, v: 1, aud: 'capstone-knowledge-write', toolName: 'SAVE_KNOWLEDGE_NOTE',
    expiresAt: now() + APPROVAL_TTL_MS, nonce: randomBytes(24).toString('base64url') })
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encoded}.${createHmac('sha256', key(secret)).update(encoded).digest('base64url')}`
}
export function verifyKnowledgeApproval(token: string, expected: ApprovalBinding, secret: string, now: () => number = Date.now) {
  const secretKey = key(secret)
  if (typeof token !== 'string' || token.length > 4096 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) throw new Error('INVALID_APPROVAL_TOKEN')
  const [encoded, signature] = token.split('.')
  const supplied = Buffer.from(signature, 'base64url')
  const actual = createHmac('sha256', secretKey).update(encoded).digest()
  if (supplied.length !== actual.length || !timingSafeEqual(actual, supplied)) throw new Error('INVALID_APPROVAL_TOKEN')
  let raw: unknown
  try { raw = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) } catch { throw new Error('INVALID_APPROVAL_TOKEN') }
  const parsed = payloadSchema.safeParse(raw)
  if (!parsed.success || parsed.data.expiresAt <= now() || parsed.data.expiresAt > now() + APPROVAL_TTL_MS)
    throw new Error('INVALID_APPROVAL_TOKEN')
  for (const field of Object.keys(bindingSchema.shape) as (keyof ApprovalBinding)[])
    if (parsed.data[field] !== expected[field]) throw new Error('INVALID_APPROVAL_TOKEN')
  return parsed.data
}
