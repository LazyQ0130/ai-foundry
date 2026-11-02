import { components, sumTool, ToolCallId, textOf } from './support.ts';
import { executeToolFixture } from '@deepseek-ai/dsh-tool-testkit';
export async function definitionsPractice() {
  const h = await components(); let bodies = 0;
  try {
    const definition = sumTool('calculate_sum', () => bodies++);
    const stop = h.ctx.tools.register(definition);
    const invoke = (args: unknown, name = 'calculate_sum') => executeToolFixture(h.ctx,
      { name, arguments: args, callId: ToolCallId('A'), signal: new AbortController().signal });
    const valid = await invoke({ data: { values: [2, 4, 6] } });
    const missing = await invoke({}), wrong = await invoke({ data: { values: [2, '4'] } });
    const nestedExtra = await invoke({ data: { values: [1], surprise: true } });
    const rootExtra = await invoke({ data: { values: [1] }, note: '根默认开放' });
    const business = await invoke({ data: { values: [] } });
    // 教学故障注入：绕开 TS 返回类型，证明流水线仍检查输出。不要在产品代码这样写。
    h.ctx.tools.register({ ...sumTool('bad_output'), execute: async () => ({ total: '12', count: 3 }) as any });
    const invalidOutput = await invoke({ data: { values: [2, 4, 6] } }, 'bad_output');
    const projection = h.ctx.tools.schemas().find(s => s.name === 'calculate_sum')!;
    const before = !!h.ctx.tools.get('calculate_sum'); stop(); const after = !!h.ctx.tools.get('calculate_sum');
    return { valid, rendered: textOf(valid), missing, wrong, nestedExtra, rootExtra, business,
      invalidOutput, bodies, projection, registered: [before, after] };
  } finally { await h.close(); }
}
