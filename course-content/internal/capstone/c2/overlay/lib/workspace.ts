import { prisma } from '@/lib/prisma'

// Every product query starts from the server session's user, never a browser-supplied workspace ID.
export async function workspaceForUser(userId: number) {
  return prisma.workspace.findUnique({ where: { ownerId: userId } })
}
