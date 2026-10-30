import { harness, message, snapshot, gate, MockAdapter, textResponse } from './support.ts';
export async function routing() {
  const adapter = new MockAdapter([textResponse('第一轮'), textResponse('第二轮')]);
  const h = await harness(adapter, 'h10-routing'), release = gate(), entered = gate();
  try {
    const maintenance = h.agent.runMaintenance(async () => { entered.resolve(); await release.promise; });
    await entered.promise;
    h.agent.inject(message('I：只补上下文'));
    const beforeWake = { status: h.agent.status, phase: (h.agent as any).phase.kind, requests: adapter.requests.length };
    h.agent.followup(message('F1：普通任务')); h.agent.followup(message('F2：下一轮任务')); h.agent.steer(message('S：调整方向'));
    const queued = { nextStep: h.agent.inbox.nextStep.map(m => m.content), nextTurn: h.agent.inbox.nextTurn.map(m => m.content) };
    release.resolve(); await maintenance; await h.agent.whenIdle();
    return { beforeWake, queued, ...snapshot(h, adapter) };
  } finally { release.resolve(); await h.close(); }
}
export async function duringRun(kind: 'steer' | 'followup' | 'inject') {
  const entered = gate(), release = gate();
  const adapter = new MockAdapter([() => { entered.resolve(); return textResponse('第一答'); }, textResponse('调整后的答复')]);
  const h = await harness(adapter, 'h10-during-' + kind);
  try {
    h.ctx.on('llm/stream', async function* (_request: any, next: any) {
      for await (const chunk of next()) { yield chunk; if (chunk.type === 'finish') await release.promise; }
    });
    h.agent.followup(message('原任务')); await entered.promise;
    h.agent[kind](message('运行中新输入')); release.resolve(); await h.agent.whenIdle();
    return snapshot(h, adapter);
  } finally { release.resolve(); await h.close(); }
}
