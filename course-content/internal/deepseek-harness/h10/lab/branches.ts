import { harness, message, snapshot, gate, MockAdapter, textResponse } from './support.ts';
export type CancelCase = 'pre-step' | 'request' | 'stream' | 'keep-inbox' | 'drop-inbox';
export async function cancellation(kind: CancelCase) {
  const entered = gate(), release = gate();
  const adapter = new MockAdapter(kind === 'stream' ? ['hang'] : [textResponse('不应分派')]);
  const h = await harness(adapter, 'h10-cancel-' + kind);
  try {
    const hook = async (_event: any, next: any) => { entered.resolve(); await release.promise; return next(); };
    if (kind === 'pre-step') h.ctx.on('agent/pre-step', hook);
    else if (kind !== 'stream') h.ctx.on('agent/request', hook);
    else h.ctx.on('agent/assistant-stream', ({ frame }) => { if (frame.type === 'chunk' && frame.chunk.type === 'text-delta') entered.resolve(); });
    h.agent.followup(message('正在处理')); await entered.promise;
    if (kind === 'keep-inbox' || kind === 'drop-inbox') {
      h.agent.followup(message('后续普通输入')); h.agent.inject(message('待处理上下文'));
    }
    h.agent.cancel({ kind: 'user' }, { keepInbox: kind === 'keep-inbox' });
    const afterCancel = { nextTurn: h.agent.inbox.nextTurn.length, nextStep: h.agent.inbox.nextStep.length };
    release.resolve(); await h.agent.whenIdle();
    return { afterCancel, ...snapshot(h, adapter) };
  } finally { release.resolve(); await h.close(); }
}
