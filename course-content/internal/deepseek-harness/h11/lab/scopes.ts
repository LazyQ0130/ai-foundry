import { capture, harness, send, registerTextTool, MockAdapter, textResponse, PERSONA_PREFIX_SECTION, renderPrompt } from './support.ts';
export async function scopesPractice() {
  const adapter = new MockAdapter([textResponse('A answer'), textResponse('B answer'), textResponse('A restored')]);
  const h = await harness(adapter, { personaPrefix: '全局助手：{{language}}', toolOrder: ['read_fixture', '<unlisted-tools>'] });
  try {
    h.ctx.systemPrompt.variable('language', () => '默认语言');
    h.ctx.systemPrompt.section({ name: 'shared', order: 10, text: '只依据收到的资料回答' });
    registerTextTool(h.ctx, 'read_fixture'); registerTextTool(h.ctx, 'audit_fixture');
    const a = await h.create('h11-A'), b = await h.create('h11-B');
    const sectionA = a.ctx.systemPrompt.section({ name: PERSONA_PREFIX_SECTION, order: 0, text: '助手A：{{language}}' });
    const variableA = a.ctx.systemPrompt.variable('language', () => '中文');
    b.ctx.systemPrompt.section({ name: PERSONA_PREFIX_SECTION, order: 0, text: 'Assistant B: {{language}}' });
    b.ctx.systemPrompt.variable('language', () => 'English');
    a.ctx.tools.restrict({ deny: ['audit_fixture'] });
    const seen = { A: 0, B: 0 };
    a.ctx.on('system-prompt/assemble', async (_v: any, _c: any, next: any) => { seen.A++; return next(); });
    b.ctx.on('system-prompt/assemble', async (_v: any, _c: any, next: any) => { seen.B++; return next(); });
    await send(a, '同一个任务'); await send(b, 'the same task');
    const beforeDisposal = { A: capture(a, adapter, h.trace), B: capture(b, adapter, h.trace), seen: { ...seen } };
    sectionA(); variableA(); await send(a, '恢复全局默认');
    const global = renderPrompt(await h.ctx.systemPrompt.assemble());
    return { beforeDisposal, afterDisposal: capture(a, adapter, h.trace), global };
  } finally { await h.close(); }
}
