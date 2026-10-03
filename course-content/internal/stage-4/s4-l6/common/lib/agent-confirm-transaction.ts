import { prisma } from "./prisma";
import { saveResearchNoteSchema } from "./agent-tools";
import { verifyApprovalV2 } from "./agent-approval-v2";

// Kept separate from Provider work so the same transaction can be exercised directly.
export async function confirmPersistedAction(input: { token: string; ownerId: number; secret: string;
  afterResourceCreate?: () => void }) {
  const payload = verifyApprovalV2({ token: input.token, userId: input.ownerId, secret: input.secret });
  return prisma.$transaction(async tx => {
    const locked = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "AgentAction" WHERE "id" = ${payload.actionId} FOR UPDATE`;
    if (locked.length !== 1) throw new Error("ACTION_NOT_FOUND");
    await tx.$queryRaw`SELECT "id" FROM "AgentRun" WHERE "id" = ${payload.runId} FOR UPDATE`;
    const action = await tx.agentAction.findUnique({ where: { id: payload.actionId } });
    const run = await tx.agentRun.findFirst({ where: { id: payload.runId, ownerId: input.ownerId } });
    if (!action || !run || action.runId !== run.id || action.toolName !== payload.toolName ||
        action.canonicalArgs !== payload.canonicalArgs) throw new Error("ACTION_NOT_FOUND");
    if (action.status === "executed") {
      const existing = await tx.resource.findUnique({ where: { agentActionKey: action.idempotencyKey },
        select: { id: true, title: true, desc: true, tag: true } });
      if (!existing || run.status !== "completed") throw new Error("INVALID_PERSISTED_STATE");
      return { saved: existing, replayed: true };
    }
    if (run.status !== "waiting_approval" || action.status !== "proposed") throw new Error("ACTION_NOT_PROPOSED");
    const args = saveResearchNoteSchema.parse(JSON.parse(action.canonicalArgs));
    const saved = await tx.resource.create({ data: { title: args.title, desc: args.content,
      tag: "文章", ownerId: input.ownerId, agentActionKey: action.idempotencyKey },
      select: { id: true, title: true, desc: true, tag: true } });
    input.afterResourceCreate?.(); // Direct integration tests only. Routes never pass this hook.
    const now = new Date();
    await tx.agentAction.update({ where: { id: action.id }, data: { status: "executed", approvedAt: now, executedAt: now } });
    await tx.agentStep.update({ where: { id: action.stepId }, data: { status: "completed", outputSummary: "用户已确认精确提议" } });
    await tx.agentStep.create({ data: { runId: run.id, position: run.currentStep + 1, kind: "write",
      toolName: "save_research_note", status: "completed", inputSummary: "执行已批准 Action",
      outputSummary: "保存 1 条 Resource" } });
    await tx.agentStep.create({ data: { runId: run.id, position: run.currentStep + 2, kind: "final",
      status: "completed", outputSummary: "研究笔记已保存" } });
    await tx.agentRun.update({ where: { id: run.id }, data: { status: "completed", currentStep: run.currentStep + 2 } });
    return { saved, replayed: false };
  }, { timeout: 15_000 });
}
