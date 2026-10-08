import { NextRequest, NextResponse } from 'next/server'
import { writeIdentity, strictBody, safeWriteError, privateHeaders, actionIdSchema } from '@/lib/knowledge-write-http'
export const dynamic = 'force-dynamic'
import { approveActionInput } from '@/lib/knowledge-note-contract'
import { approveKnowledgeAction } from '@/lib/knowledge-write-service'
export async function POST(request: NextRequest, context: { params: Promise<{ actionId: string }> }) {
  try {
    const identity = await writeIdentity(request, true)
    if (identity instanceof NextResponse) return identity
    const id = actionIdSchema.parse((await context.params).actionId)
    const body = await strictBody(request, approveActionInput)
    const result = await approveKnowledgeAction(id, identity, body.approvalToken)
    return NextResponse.json(result, { headers: privateHeaders })
  } catch (error) { return safeWriteError(error) }
}
