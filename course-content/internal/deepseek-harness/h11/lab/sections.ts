import { component, renderPrompt, schema } from './support.ts';
export async function sectionsPractice() {
  return component(async ctx => {
    let tone = '简洁', variables = 0;
    ctx.systemPrompt.variable('tone', () => { variables++; return tone; });
    ctx.systemPrompt.section({ name: 'zeta', order: 20, text: 'Z：补充说明' });
    ctx.systemPrompt.section({ name: 'Alpha', order: 20, text: () => 'A：用{{tone}}语言回答' });
    ctx.systemPrompt.section({ name: 'first', order: -10, text: '你是代码助手' });
    ctx.systemPrompt.section({ name: 'empty', order: 30, text: '' });
    const assembly = await ctx.systemPrompt.assemble(); tone = '详细';
    const rendered = renderPrompt(assembly); // 仍用组装时已求值的“简洁”。
    const nextRendered = renderPrompt(await ctx.systemPrompt.assemble());
    const errors: Record<string, string> = {};
    for (const [name, text, missing] of [['unknown', '{{cwd}}', false], ['missing', '{{absent}}', true], ['malformed', '{{ tone }}', false]] as const) {
      const disposeVar = missing ? ctx.systemPrompt.variable('absent', () => undefined) : undefined;
      const dispose = ctx.systemPrompt.section({ name, order: 40, text });
      try { renderPrompt(await ctx.systemPrompt.assemble()); } catch (e) { errors[name] = String(e); }
      dispose(); disposeVar?.();
    }
    const literal = ctx.systemPrompt.section({ name: 'literal', order: 40, text: '{{cwd}}', interpolate: false });
    const literalRendered = renderPrompt(await ctx.systemPrompt.assemble()); literal();
    ctx.systemPrompt.tools(() => ({ schemas: [schema('read_fixture')] }));
    const listener = ctx.on('system-prompt/assemble', async (_a, _c, next) => {
      const a = await next(); return { ...a, sections: [{ name: 'waterfall', text: '被替换的展示文本' }], variables: { ...a.variables, tone: '确定' } };
    });
    const complete = ctx.systemPrompt.section({ name: 'whole', order: 99, text: '完整指令：{{tone}}', complete: true });
    const completeAssembly = await ctx.systemPrompt.assemble();
    const duplicate = ctx.systemPrompt.section({ name: 'whole-2', order: 100, text: '冲突', complete: true });
    try { await ctx.systemPrompt.assemble(); } catch (e) { errors.complete = String(e); }
    duplicate(); complete(); listener();
    return { assembly, rendered, nextRendered, variables, errors, literalRendered, completeAssembly, completeRendered: renderPrompt(completeAssembly) };
  });
}
