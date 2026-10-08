import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeIdentity, safeWriteError, privateHeaders, actionIdSchema } from '@/lib/knowledge-write-http'
import { publicNoteSelect } from '@/lib/knowledge-write-service'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const identity = await writeIdentity(request)
    if (identity instanceof NextResponse) return identity
    const id = actionIdSchema.parse((await context.params).id)
    const note = await prisma.knowledgeNote.findFirst({ where: { id, workspaceId: identity.workspaceId }, select: publicNoteSelect })
    if (!note) return NextResponse.json({ error: 'NOTE_NOT_FOUND' }, { status: 404, headers: privateHeaders })
    return NextResponse.json({ note }, { headers: privateHeaders })
  } catch (error) { return safeWriteError(error) }
}
