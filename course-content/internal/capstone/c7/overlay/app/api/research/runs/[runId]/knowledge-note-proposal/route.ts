import { NextRequest, NextResponse } from 'next/server'
import { writeIdentity, strictBody, safeWriteError, privateHeaders, runIdSchema } from '@/lib/knowledge-write-http'
import { emptyProposalInput } from '@/lib/knowledge-note-contract'
import { proposalForRun } from '@/lib/knowledge-write-service'
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest, context: { params: Promise<{ runId: string }> }) {
  try {
    const identity = await writeIdentity(request, true)
    if (identity instanceof NextResponse) return identity
    await strictBody(request, emptyProposalInput)
    const runId = runIdSchema.parse((await context.params).runId)
    return NextResponse.json({ action: await proposalForRun(runId, identity) }, { headers: privateHeaders })
  } catch (error) { return safeWriteError(error) }
}
