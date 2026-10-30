import { component, renderPrompt, renderContextSections, schema } from './support.ts';
export async function contextsPractice() {
  return component(async ctx => {
    let current = '/fixture/project-a';
    const calls = { section: 0, variable: 0, tools: 0, waterfall: 0, context: 0 };
    ctx.systemPrompt.section({ name: 'role', order: 1, text: () => { calls.section++; return '固定指令：{{fixed}}'; } });
    ctx.systemPrompt.variable('fixed', () => { calls.variable++; return current; });
    ctx.systemPrompt.tools(() => { calls.tools++; return { schemas: [schema('read_fixture')] }; });
    ctx.systemPrompt.context({ name: 'directory', order: 100, required: true, interpolate: false, text: () => { calls.context++; return 'Directory: ' + current; } });
    ctx.systemPrompt.context({ name: 'optional', order: 200, text: () => '环境标签：' + current });
    ctx.on('system-prompt/assemble', async (_a, _c, next) => {
      calls.waterfall++; const a = await next(); return { ...a, contexts: [...a.contexts, { name: 'expert', text: '仅本次接纳的额外说明' }] };
    });
    const accepted = await ctx.systemPrompt.assemble(); current = '/fixture/project-b';
    const refreshed = ctx.systemPrompt.refreshContext(accepted), afterRefresh = { ...calls };
    const dispose1 = ctx.systemPrompt.suppressRuntimeContext(), dispose2 = ctx.systemPrompt.suppressRuntimeContext();
    const suppressed = ctx.systemPrompt.refreshContext(accepted); dispose1();
    const stillSuppressed = ctx.systemPrompt.refreshContext(accepted); dispose2();
    const restored = ctx.systemPrompt.refreshContext(accepted);
    const fromSuppressed = ctx.systemPrompt.refreshContext(suppressed); // 被剔除的optional不凭空重新加入。
    ctx.systemPrompt.context({ name: 'late-optional', order: 300, text: '新可选项' });
    ctx.systemPrompt.context({ name: 'late-required', order: 50, required: true, text: '新必需项' });
    const late = ctx.systemPrompt.refreshContext(accepted);
    return { accepted, refreshed, afterRefresh, renderedPrompt: renderPrompt(refreshed), renderedContexts: renderContextSections(refreshed), suppressed, stillSuppressed, restored, fromSuppressed, late };
  });
}
