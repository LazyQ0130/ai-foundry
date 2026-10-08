import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { currentSession, unauthorized, rejectCrossOriginWrite } from './auth'
import { workspaceForUser } from './workspace'
import { KnowledgeWriteError } from './knowledge-write-service'

export const privateHeaders = { 'Cache-Control': 'no-store' }
export async function writeIdentity(request: NextRequest, write = false) {
  if (write) { const rejected = rejectCrossOriginWrite(request); if (rejected) return rejected }
  const session = await currentSession(request)
  if (!session) return unauthorized()
  const workspace = await workspaceForUser(session.userId)
  if (!workspace) throw new KnowledgeWriteError('WORKSPACE_UNAVAILABLE', 503)
  return { userId: session.userId, workspaceId: workspace.id }
}
export async function strictBody<T>(request: NextRequest, schema: z.ZodType<T>): Promise<T> {
  const raw = await request.text()
  if (raw.length > 12_000) throw new KnowledgeWriteError('INVALID_INPUT', 400)
  let body: unknown
  try { body = JSON.parse(raw) } catch { throw new KnowledgeWriteError('INVALID_INPUT', 400) }
  const parsed = schema.safeParse(body)
  if (!parsed.success) throw new KnowledgeWriteError('INVALID_INPUT', 400)
  return parsed.data
}
export function safeWriteError(error: unknown) {
  if (error instanceof z.ZodError) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400, headers: privateHeaders })
  const known = error instanceof KnowledgeWriteError
  return NextResponse.json({ error: known ? error.code : 'KNOWLEDGE_WRITE_UNAVAILABLE' },
    { status: known ? error.status : 503, headers: privateHeaders })
}
export const runIdSchema = z.coerce.number().int().positive()
export const actionIdSchema = z.string().uuid()
