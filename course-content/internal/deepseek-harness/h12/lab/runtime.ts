import { runtime, ScriptedAdapter, textChunks, collect, LlmError, ReasoningEffortId } from './support.ts';
export async function runtimePractice() {
  return runtime(async ctx => {
    class Adapter extends ScriptedAdapter {
      override async resolveModel(provider: string, model: string) {
        return { ...await super.resolveModel(provider, model), reasoning: { efforts: [{ id: ReasoningEffortId('low'), name: '低' }], defaultEffort: ReasoningEffortId('low') } };
      }
    }
    const adapter = new Adapter([textChunks('本地响应'), () => { throw new LlmError('夹具限流', 'RATE_LIMIT', { status: 429, providerRetryAfterMs: 250 }); }]);
    ctx.llm.registerAdapter(['fixture'], adapter);
    const order: string[] = [];
    ctx.on('llm/stream', async function* (_options, next) { order.push('before'); yield* next(); order.push('after'); });
    const prepared = await ctx.llm.prepareCall({ provider: 'fixture', model: 'not-in-catalog' });
    const chunks = await collect(prepared.stream({ ...prepared.config, messages: [{ role: 'user', content: [{ type: 'text', text: '你好' }] }] }));
    let reuse = ''; try { prepared.stream({ ...prepared.config, messages: [] }); } catch (e) { reuse = String(e); }
    let invalid = ''; try { await ctx.llm.prepareCall({ provider: 'fixture', model: 'any', reasoningEffort: ReasoningEffortId('typo') }); } catch (e) { invalid = String(e); }
    const failed = await collect(ctx.llm.stream({ provider: 'fixture', model: 'any', messages: [] }));
    const missing = await collect(ctx.llm.stream({ provider: 'absent', model: 'any', messages: [] }));
    return { providers: ctx.llm.listProviders(), catalog: await ctx.llm.listModels('fixture'), config: prepared.config, defaults: prepared.adapterDefaults, chunks, order, reuse, invalid, failed, missing, calls: adapter.requests.length };
  });
}
