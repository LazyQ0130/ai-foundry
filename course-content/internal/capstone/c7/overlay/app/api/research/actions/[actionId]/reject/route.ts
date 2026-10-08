import { NextRequest, NextResponse } from 'next/server'
import { writeIdentity, strictBody, safeWriteError, privateHeaders, actionIdSchema } from '@/lib/knowledge-write-http'
export const dynamic = 'force-dynamic'
import { rejectActionInput } from '@/lib/knowledge-note-contract'
import { rejectKnowledgeAction } from '@/lib/knowledge-write-service'
export async function POST(request: NextRequest, context: { params: Promise<{ actionId: string }> }) {
  try {
    const identity = await writeIdentity(request, true)
    if (identity instanceof NextResponse) return identity
    const id = actionIdSchema.parse((await context.params).actionId)
    const body = await strictBody(request, rejectActionInput)
    const result = await rejectKnowledgeAction(id, identity, body.expectedVersion)
    return NextResponse.json({ action: result }, { headers: privateHeaders })
  } catch (error) { return safeWriteError(error) }
}
