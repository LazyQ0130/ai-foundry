import { defineTool, parameterSchemaSpecToJsonSchema, validateArgs } from '@deepseek-ai/dsh-tools';
import { executeToolFixture } from '@deepseek-ai/dsh-tool-testkit';
import { components, ToolCallId } from './support.ts';
export async function progressivePractice() {
  // 1 声明给模型看的名称和说明；此时只是普通对象，不是完整工具。
  const identity = { name: 'calculate_sum', description: '计算两个数字之和。' };
  // 2 参数是属性映射，required 属于每个属性。
  const parameters = { a: { type: 'number', required: true }, b: { type: 'number', required: true } } as const;
  const compiled = parameterSchemaSpecToJsonSchema(parameters);
  // 3 helper 返回诊断列表；不会自动抛 ToolArgsError。
  const missing = validateArgs(parameters, { a: 7 });
  // 4 defineTool 编译输入与输出；回调中的 args.a / args.b 被推断为 number。
  const definition = defineTool({ ...identity, parameters,
    output: { schema: { type: 'number' }, render: (_args, value) => [{ type: 'text', text: `总和 ${value}` }] },
    async execute(args) {
      // 5 业务上限由业务代码检查，DSL 不支持 minimum/maximum。
      if (Math.abs(args.a) > 1_000_000 || Math.abs(args.b) > 1_000_000) throw new Error('单项绝对值超出业务上限');
      return args.a + args.b;
    } });
  const canonical = await definition.execute({ a: 7, b: 5 }, {} as any);
  const rendered = definition.output.render({ a: 7, b: 5 }, canonical);
  // 6 用真实组件流水线校验输出；直接调用 execute 不包含这一层。
  const h = await components();
  try {
    const stop = h.ctx.tools.register(definition);
    const invoke = (args: unknown) => executeToolFixture(h.ctx, { name: identity.name, arguments: args,
      callId: ToolCallId('progressive'), signal: new AbortController().signal });
    const good = await invoke({ a: 7, b: 5 }), bad = await invoke({ a: '7', b: 5 });
    const business = await invoke({ a: 2_000_000, b: 5 });
    // 7 释放本次注册；不靠修改同进程借用的 definition 实现热替换。
    stop(); return { identity, compiled, missing, canonical, rendered, good, bad, business,
      registeredAfter: !!h.ctx.tools.get(identity.name) };
  } finally { await h.close(); }
}
