import { defineContentToolFixture } from '@deepseek-ai/dsh-tool-testkit';
import { harness, message, snapshot, MockAdapter, textResponse, toolCallResponse, maxTokensResponse, LlmError } from './support.ts';
export type Case = 'direct' | 'one-tool' | 'multi' | 'two-tools' | 'reject' | 'empty' | 'retry' | 'terminal' | 'tool-error' | 'max-tokens';
export async function execution(kind: Case) {
  const readme = 'README夹具：整理项目资料；相关测试见 summary.test.ts。';
  const tests = '测试夹具：空输入不产生摘要，正常输入保留资料来源。';
  const call = (id: string, part: string) => toolCallResponse(id, 'read_fixture', { part });
  const scripts: Record<Case, any[]> = {
    direct: [textResponse('已提供正文，直接概括。')],
    'one-tool': [call('read-1', 'README'), textResponse('根据README作答。')],
    multi: [call('read-1', 'README'), call('read-2', 'TEST'), textResponse('已比较README和测试。')],
    'two-tools': [[...call('batch-1', 'README').filter(c => c.type !== 'finish'),
      ...call('batch-2', 'TEST').map(c => 'index' in c ? { ...c, index: c.index + 1 } : c)], textResponse('一批两个工具后作答。')],
    reject: [], empty: [],
    retry: [() => { throw new LlmError('fixture busy', 'RATE_LIMIT'); }, textResponse('重试后回答。')],
    terminal: [() => { throw new LlmError('fixture failed', 'SERVER'); }],
    'tool-error': [call('read-fail', 'README'), textResponse('工具失败，不能声称读到内容。')],
    'max-tokens': [maxTokensResponse('截断的答复')],
  };
  const adapter = new MockAdapter(scripts[kind]), h = await harness(adapter, 'h10-' + kind);
  try {
    h.ctx.tools.register(defineContentToolFixture({ name: 'read_fixture', description: '只读取两段代码内固定文本，不读取磁盘',
      parameters: { part: { type: 'string' } }, async execute({ part }: any) {
        if (kind === 'tool-error') throw Error('FIXTURE_READ_FAILED');
        if (!['README', 'TEST'].includes(part)) throw Error('FIXTURE_NAME_DENIED');
        return [{ type: 'text', text: part === 'README' ? readme : tests }];
      } }));
    if (kind === 'reject') h.ctx.on('agent/pre-step', async () => ({ kind: 'reject' }));
    if (kind === 'empty') h.ctx.on('agent/pre-step', async () => ({ kind: 'enter', messages: [] }));
    if (kind === 'retry') h.ctx.on('agent/request-error', async () => ({ kind: 'retry' }));
    h.agent.followup(message('请读取README，概括项目功能，并检查相关测试文件。'));
    await h.agent.whenIdle();
    return snapshot(h, adapter);
  } finally { await h.close(); }
}
