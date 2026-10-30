import { ScriptedAdapter, textChunks, toolChunks, harness, send, registerRead, sequence, gate, LlmError, type StreamChunk } from './support.ts';
export type Scenario = 'success' | 'failure' | 'throw' | 'cancel-empty' | 'cancel-partial' | 'cancel-reasoning' | 'cancel-tools' | 'max-tokens' | 'write-failure' | 'attempt-write-failure' | 'assembly-failure' | 'middleware-failure' | 'retry' | 'in-band-aborted' | 'tool-chain';
export async function settlementPractice(kind: Scenario) {
  const reached = gate(), release = gate();
  const failure: StreamChunk[] = [{ type: 'text-delta', index: 0, text: '未成功的草稿' }, { type: 'finish', reason: { kind: 'error', failure: { code: 'SERVER', message: '夹具失败' } } }];
  let responses: any[] = [textChunks()];
  if (kind === 'failure' || kind === 'attempt-write-failure') responses = [failure];
  if (kind === 'throw') responses = [async function* () { yield { type: 'text-delta', index: 0, text: '网络前缀' }; throw new LlmError('夹具断流', 'TRANSPORT'); }];
  if (kind.startsWith('cancel-')) responses = [async function* (options: any) {
    if (kind === 'cancel-partial') yield { type: 'text-delta', index: 0, text: '已交付的半句' };
    if (kind === 'cancel-reasoning') yield { type: 'reasoning-delta', index: 0, text: '正在分析' };
    if (kind === 'cancel-tools') yield* sequence(toolChunks().slice(0, 4));
    reached.resolve(); await release.promise; options.signal.throwIfAborted();
  }];
  if (kind === 'max-tokens') responses = [[{ type: 'text-delta', index: 9, text: '只完成一部分' }, ...toolChunks().slice(0, 4), { type: 'finish', reason: { kind: 'max-tokens' } }]];
  if (kind === 'assembly-failure') responses = [[{ type: 'block-start', index: 0, blockType: 'unknown-fixture' }, { type: 'finish', reason: { kind: 'stop' } }]];
  if (kind === 'retry') responses = [failure, textChunks('恢复后的回答')];
  if (kind === 'in-band-aborted') responses = [[{ type: 'text-delta', index: 0, text: '提供方草稿' }, { type: 'finish', reason: { kind: 'aborted', failure: { code: 'ABORTED', message: '提供方中断；本地信号未取消' } } }]];
  if (kind === 'tool-chain') responses = [toolChunks(), textChunks('README说明：这是固定演示项目。')];
  const adapter = new ScriptedAdapter(responses), h = await harness(adapter);
  try {
    const agent = await h.create('h12-' + kind); registerRead(h.ctx, h.trace);
    if (kind === 'retry') h.ctx.on('agent/request-error', async () => ({ kind: 'retry' as const }));
    if (kind === 'middleware-failure') h.ctx.on('llm/stream', async function* () { throw new Error('夹具中间件失败'); });
    const append = agent.session.append.bind(agent.session);
    const rejected = kind === 'write-failure' ? 'assistant/message' : kind === 'attempt-write-failure' ? 'assistant/attempt' : undefined;
    if (rejected) Object.defineProperty(agent.session, 'append', { configurable: true, value: (...args: any[]) => {
      if (args[0] === rejected) throw new Error('夹具拒绝结算：' + rejected);
      return Reflect.apply(append, agent.session, args);
    } });
    const work = send(agent);
    if (kind.startsWith('cancel-')) { await reached.promise; agent.cancel({ kind: 'user' }); release.resolve(); }
    await work;
    return { kind, events: agent.session.snapshotEvents(), messages: agent.session.deriveMessages(), trace: structuredClone(h.trace),
      requests: adapter.requests.map(r => ({ ...structuredClone({ ...r, signal: undefined }), signalAborted: r.signal?.aborted, frozen: Object.isFrozen(r) && Object.isFrozen(r.messages) })) };
  } finally { release.resolve(); await h.close(); }
}
