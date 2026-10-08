import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { currentSession, rejectCrossOriginWrite, unauthorized, unavailable } from '@/lib/auth'
import { fileKind, uploadInput } from '@/lib/knowledge-core'
import { prisma } from '@/lib/prisma'
import { signedPut } from '@/lib/storage'
import { workspaceForUser } from '@/lib/workspace'

export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  const rejected = rejectCrossOriginWrite(request)
  if (rejected) return rejected
  try {
    const session = await currentSession(request)
    if (!session) return unauthorized()
    const parsed = uploadInput.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: '请提供 10 MB 内的 PDF、MD 或 TXT 文件。' }, { status: 400 })
    const input = parsed.data
    try { fileKind(input.originalName, input.mimeType) }
    catch { return NextResponse.json({ error: '只支持 PDF、Markdown 和 TXT 文件。' }, { status: 400 }) }
    const workspace = await workspaceForUser(session.userId)
    if (!workspace) return unavailable()
    const id = randomUUID()
    const objectKey = `workspaces/${workspace.id}/documents/${id}/${randomUUID()}`
    const uploadUrl = await signedPut(objectKey, input.mimeType)
    await prisma.knowledgeDocument.create({ data: { id, workspaceId: workspace.id, title: input.title,
      originalName: input.originalName, mimeType: input.mimeType, byteSize: input.byteSize, objectKey } })
    return NextResponse.json({ id, uploadUrl, expiresIn: 300 }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('上传初始化失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}
