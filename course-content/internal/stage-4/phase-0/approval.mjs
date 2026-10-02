import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

const writeArgs = z.strictObject({ title: z.string().trim().min(1).max(120), content: z.string().trim().min(1).max(4000) })
const payloadSchema = z.strictObject({ userId: z.string().min(1), toolName: z.literal('save_research_note'),
  canonicalArgs: z.string(), expiresAt: z.number().int(), nonce: z.string().length(32) })
const encoded = value => Buffer.from(value).toString('base64url')
export function canonicalArgs(args) { const parsed = writeArgs.parse(args); return JSON.stringify({ title: parsed.title, content: parsed.content }) }
export function signProposal({ userId, toolName = 'save_research_note', args, expiresAt, secret }) {
  if (!secret || secret.length < 32) throw new Error('APPROVAL_SECRET_WEAK')
  const payload = payloadSchema.parse({ userId, toolName, canonicalArgs: canonicalArgs(args), expiresAt,
    nonce: randomBytes(16).toString('hex') })
  const body = encoded(JSON.stringify(payload))
  const signature = createHmac('sha256', secret).update(body).digest('base64url')
  return { proposal: { toolName, args: JSON.parse(payload.canonicalArgs) }, token: `${body}.${signature}` }
}
export function verifyProposal({ token, userId, toolName, args, secret, now = Date.now() }) {
  if (typeof token !== 'string' || token.length > 10000 || !secret) throw new Error('INVALID_APPROVAL')
  const [body, signature, extra] = token.split('.')
  if (!body || !signature || extra) throw new Error('INVALID_APPROVAL')
  const expected = createHmac('sha256', secret).update(body).digest()
  let actual
  try { actual = Buffer.from(signature, 'base64url') } catch { throw new Error('INVALID_APPROVAL') }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error('INVALID_APPROVAL')
  let payload
  try { payload = payloadSchema.parse(JSON.parse(Buffer.from(body, 'base64url').toString())) }
  catch { throw new Error('INVALID_APPROVAL') }
  if (payload.userId !== userId || payload.toolName !== toolName || payload.expiresAt <= now ||
    payload.canonicalArgs !== canonicalArgs(args)) throw new Error('INVALID_APPROVAL')
  return { args: JSON.parse(payload.canonicalArgs), nonce: payload.nonce }
}
