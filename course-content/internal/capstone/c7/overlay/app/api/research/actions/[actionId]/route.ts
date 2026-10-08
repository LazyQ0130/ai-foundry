import { NextRequest, NextResponse } from 'next/server'
import { writeIdentity, strictBody, safeWriteError, privateHeaders, actionIdSchema } from '@/lib/knowledge-write-http'
export const dynamic = 'force-dynamic'
import { editActionInput } from '@/lib/knowledge-note-contract'
import { readKnowledgeAction, editKnowledgeAction } from '@/lib/knowledge-write-service'
export async function GET(request: NextRequest, context: { params: Promise<{ actionId: string }> }) {
  try {
    const identity = await writeIdentity(request)
    if (identity instanceof NextResponse) return identity
    const id = actionIdSchema.parse((await context.params).actionId)
    return NextResponse.json({ action: await readKnowledgeAction(id, identity) }, { headers: privateHeaders })
  } catch (error) { return safeWriteError(error) }
}
export async function PATCH(request: NextRequest, context: { params: Promise<{ actionId: string }> }) {
  try {
    const identity = await writeIdentity(request, true)
    if (identity instanceof NextResponse) return identity
    const id = actionIdSchema.parse((await context.params).actionId)
    const { title, content, expectedVersion } = await strictBody(request, editActionInput)
    return NextResponse.json({ action: await editKnowledgeAction(id, identity, expectedVersion, { title, content }) }, { headers: privateHeaders })
  } catch (error) { return safeWriteError(error) }
}
