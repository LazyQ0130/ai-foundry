import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeIdentity, safeWriteError, privateHeaders } from '@/lib/knowledge-write-http'
import { publicNoteSelect } from '@/lib/knowledge-write-service'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const identity = await writeIdentity(request)
    if (identity instanceof NextResponse) return identity
    const notes = await prisma.knowledgeNote.findMany({ where: { workspaceId: identity.workspaceId },
      select: publicNoteSelect, orderBy: { createdAt: 'desc' }, take: 100 })
    return NextResponse.json({ notes }, { headers: privateHeaders })
  } catch (error) { return safeWriteError(error) }
}
