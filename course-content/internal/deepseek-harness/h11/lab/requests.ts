import { capture, harness, send, registerTextTool, gate, MockAdapter, textResponse, LlmError } from './support.ts';
export type RequestCase = 'plain' | 'in-history' | 'series' | 'tools' | 'refresh' | 'suppress' | 'render-error' | 'context-error' | 'cancel-prepare' | 'cancel-assemble' | 'retry' | 'tool-order-error' | 'context-change' | 'initial-empty';
export async function requestsPractice(kind: RequestCase) {
  const adapter = new MockAdapter(kind === 'retry' ? [() => { throw new LlmError('busy', 'RATE_LIMIT'); }, textResponse('ok')] : Array.from({ length: 6 }, () => textResponse('ok')));
  if (kind === 'in-history' || kind === 'series') adapter.systemPromptUpdate = 'in-history';
  const h = await harness(adapter, kind === 'tool-order-error' ? { toolOrder: ['typo', '<unlisted-tools>'] } : {}), agent = await h.create('h11-' + kind), entered = gate(), release = gate();
  let prompt = kind === 'initial-empty' ? '' : '指令第一版', current = '/fixture/initial', startSeries = false;
  const counts = { section: 0, variable: 0, assemble: 0, context: 0, request: 0 };
  try {
    h.ctx.systemPrompt.section({ name: 'role', order: 1, text: () => { counts.section++; return kind === 'render-error' ? '{{cwd}}' : prompt + (kind === 'refresh' || kind === 'retry' ? '：{{fixed}}' : ''); } });
    h.ctx.systemPrompt.variable('fixed', () => { counts.variable++; return current; });
    if (['refresh', 'suppress', 'retry', 'context-error', 'context-change'].includes(kind)) {
      h.ctx.systemPrompt.context({ name: 'directory', order: 100, required: true, interpolate: false, text: () => { counts.context++; return current; } });
      if (kind !== 'context-change') h.ctx.systemPrompt.context({ name: 'optional', order: 200, text: kind === 'context-error' ? '{{not_registered}}' : 'optional fact' });
    }
    h.ctx.on('system-prompt/assemble', async (_a: any, _c: any, next: any) => { counts.assemble++; if (kind === 'cancel-assemble') { entered.resolve(); await release.promise; } return next(); });
    h.ctx.on('agent/pre-step', async (_p: any, next: any) => { const d = await next(); return d.kind === 'enter' && startSeries ? { ...d, startsRequestSeries: true } : d; });
    h.ctx.on('agent/request', async (_p: any, next: any) => {
      counts.request++;
      if (kind === 'refresh' || (kind === 'retry' && counts.request === 2)) current = '/fixture/updated';
      if (kind === 'suppress') agent.ctx.systemPrompt.suppressRuntimeContext();
      if (kind === 'cancel-prepare') { entered.resolve(); await release.promise; }
      return next();
    });
    if (kind === 'retry') h.ctx.on('agent/request-error', async () => ({ kind: 'retry' }));
    if (kind === 'tools') {
      registerTextTool(h.ctx, 'read_fixture');
      h.ctx.systemPrompt.section({ name: 'read-guide', order: 2, text: ({ scope, toolSet }: any) => h.ctx.tools.get('read_fixture', scope, toolSet) ? '读取指导：read_fixture' : '' });
    }
    if (kind.startsWith('cancel-')) {
      const work = send(agent, '准备时取消'); await entered.promise; agent.cancel({ kind: 'user' }); release.resolve(); await work;
    } else {
      await send(agent, '任务一');
      if (['plain', 'in-history', 'series'].includes(kind)) {
        prompt = '指令第二版'; await send(agent, '任务二'); startSeries = kind === 'series'; await send(agent, '指令不变');
        prompt = kind === 'series' ? '指令第三版' : ''; await send(agent, '任务四');
        if (kind !== 'series') await send(agent, '仍为空');
      }
      if (kind === 'tools') {
        registerTextTool(h.ctx, 'audit_fixture'); await send(agent, '增加工具后');
        agent.ctx.tools.restrict({ deny: ['read_fixture'] }); await send(agent, '隐藏读取工具后');
      }
      if (kind === 'context-change') {
        current = '/fixture/updated'; await send(agent, '环境已变'); current = ''; await send(agent, '没有动态事实'); await send(agent, '仍无动态事实');
      }
      if (kind === 'initial-empty') { await send(agent, '仍为空'); prompt = '指令第一版'; await send(agent, '现在有指令'); }
    }
    return { ...capture(agent, adapter, h.trace), kind, counts };
  } finally { release.resolve(); await h.close(); }
}
