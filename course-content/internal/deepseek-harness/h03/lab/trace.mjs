// 教学简化：选用官方事件名称，数据结构不是官方序列化格式。
// 不加载 Harness，不读文件、环境变量或凭据，不发网络请求，不执行命令。
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

export const scenarios = ['direct', 'tool', 'multi', 'reject', 'tool-failure', 'cancel', 'model-error', 'timeout', 'prepare-error'];
const README = 'Foundry Demo：整理项目资料。使用方法见 USAGE.md。';
const USAGE = '先选择资料，再生成摘要；写入前需要人工确认。';

export function runScenario(name, options = {}) {
  assert.ok(scenarios.includes(name), `未知场景：${name}`);
  const trace = [], facts = [], live = [], requests = [], history = [];
  let step = 0, tools = 0, reason = 'completed', headerWritten = false;
  const record = (channel, type, data = {}) => {
    const event = { order: trace.length, channel, type, data: structuredClone(data) };
    if (channel === 'fact') { event.seq = facts.length; facts.push(event); }
    if (channel === 'live') live.push(event);
    trace.push(event); return event;
  };
  const fact = (type, data) => record('fact', type, data);
  const checkpoint = (type, data) => record('checkpoint', type, data);
  const stream = (frame) => record('live', 'agent/assistant-stream', frame);
  const settle = (type, data) => {
    const event = fact(type, { turn: 1, step, ...data });
    stream({ type: 'end', outcome: { kind: 'committed', eventType: type, seq: event.seq } });
    return event;
  };
  // Mock 根据收到的历史作决定，不从事实日志偷偷取工具结果。
  const decide = (messages) => {
    const results = messages.filter(m => m.role === 'tool');
    if (results.some(m => m.isError)) return { text: '读取失败，不能声称已经概括了文件。' };
    const needed = name === 'multi' ? 2 : name === 'direct' ? 0 : 1;
    if (results.length < needed) return { call: { id: `c${results.length + 1}`, name: 'read_fixture', path: results.length ? 'USAGE.md' : 'README.md' } };
    const input = results.length ? results.map(m => m.content).join('；') : messages.find(m => m.role === 'user').content;
    return { text: `依据已收到的资料：${input}` };
  };
  const execute = (call) => {
    // 教学策略只允许精确的两个 fixture 名字，绝不把模型参数作为本机路径。
    if (call.name !== 'read_fixture' || !['README.md', 'USAGE.md'].includes(call.path)) return { isError: true, content: '工具或参数不允许' };
    tools++;
    if (name === 'tool-failure') return { isError: true, content: 'READ_FAILED：fixture 不可读' };
    return { isError: false, content: call.path === 'README.md' ? (options.readme ?? README) : USAGE };
  };
  const input = name === 'direct' ? `请概括以下 README 正文：${options.readme ?? README}` : '请读取 README.md，概括主要功能。';
  fact('agent/inbox/spliced', { demoOperation: 'insert', input });
  record('live', 'agent/status', { status: 'running' });
  fact('turn/start', { turn: 1 });
  fact('agent/inbox/spliced', { demoOperation: 'claim' });
  record('live', 'agent/inbox/claimed', { turn: 1 });
  try {
    while (step < 6) { // 教学保险上限；不是官方循环的默认配置。
      checkpoint('prepare-input', { model: 'mock', tools: ['read_fixture'], prompt: '只根据收到的资料回答' });
      checkpoint('agent/pre-step', { proposedStep: step + 1, decision: name === 'reject' ? 'reject' : 'enter' });
      if (name === 'reject') { reason = 'blocked'; break; }
      step++;
      fact('step/start', { turn: 1, step });
      try {
        checkpoint('llm.prepareCall', { provider: 'mock', model: 'mock' });
        if (name === 'prepare-error') throw Object.assign(new Error('没有可用模型适配器'), { code: 'NO_ADAPTER' });
        if (step === 1) {
          fact('system/message', { role: 'system', content: '只根据收到的资料回答' });
          history.push({ role: 'system', content: '只根据收到的资料回答' });
          fact('user/message', { role: 'user', content: input });
          history.push({ role: 'user', content: input });
        }
        if (!headerWritten) {
          fact('request/header', { demoConfig: { provider: 'mock', model: 'mock' }, reason: 'initial' });
          headerWritten = true;
        }
        const snapshot = structuredClone(history);
        requests.push(snapshot);
        checkpoint('model/request', { step, messages: snapshot });
        stream({ type: 'start', step });
        if (['model-error', 'timeout'].includes(name)) {
          settle('assistant/attempt', { demoFailure: name });
          throw Object.assign(new Error(name), { code: name === 'timeout' ? 'TIMEOUT' : 'SERVER' });
        }
        if (name === 'cancel') {
          stream({ type: 'chunk', text: '我先' });
          settle('assistant/message', { role: 'assistant', content: '我先', interrupted: true });
          throw Object.assign(new Error('用户取消'), { code: 'ABORTED' });
        }
        const response = decide(snapshot);
        stream({ type: 'chunk', demoResponse: response });
        settle('assistant/message', { role: 'assistant', demoResponse: response });
        history.push({ role: 'assistant', ...response });
        if (!response.call) break;
        fact('tool/call', { turn: 1, step, ...response.call });
        checkpoint('tools/validate-and-prepare', { callId: response.call.id });
        const result = execute(response.call);
        fact('tool/result', { turn: 1, step, callId: response.call.id, ...result });
        history.push({ role: 'tool', callId: response.call.id, ...result });
      } finally {
        fact('step/end', { turn: 1, step });
      }
      // 普通工具结果（包含 isError）需要后续模型步骤；不实现 concludeTurn。
    }
    if (step === 6) throw Object.assign(new Error('教学步数上限'), { code: 'DEMO_LIMIT' });
  } catch (error) {
    reason = error.code === 'ABORTED' ? 'aborted' : 'error';
    if (reason === 'error') record('live', 'agent/error', { code: error.code });
  } finally {
    fact('turn/end', { turn: 1, reason: { kind: reason } });
    record('live', 'agent/status', { status: 'idle' });
  }
  return { name, trace, facts, live, requests, summary: { steps: step, modelRequests: requests.length, tools, end: reason } };
}

export const expected = {
  direct: { steps: 1, modelRequests: 1, tools: 0, end: 'completed' },
  tool: { steps: 2, modelRequests: 2, tools: 1, end: 'completed' },
  multi: { steps: 3, modelRequests: 3, tools: 2, end: 'completed' },
  reject: { steps: 0, modelRequests: 0, tools: 0, end: 'blocked' },
  'tool-failure': { steps: 2, modelRequests: 2, tools: 1, end: 'completed' },
  cancel: { steps: 1, modelRequests: 1, tools: 0, end: 'aborted' },
  'model-error': { steps: 1, modelRequests: 1, tools: 0, end: 'error' },
  timeout: { steps: 1, modelRequests: 1, tools: 0, end: 'error' },
  'prepare-error': { steps: 1, modelRequests: 0, tools: 0, end: 'error' }
};
export function selfTest() {
  for (const name of scenarios) assert.deepEqual(runScenario(name).summary, expected[name]);
  console.log('PASS：九种教学路径；不是官方 Harness 测试');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === '--self-test') selfTest();
  else if (process.argv[2] === '--all') for (const name of scenarios) console.log(name, JSON.stringify(runScenario(name).summary));
  else {
    const result = runScenario(process.argv[2] ?? 'tool');
    for (const e of result.trace) console.log(`${e.order} [${e.channel}${e.seq === undefined ? '' : ` #${e.seq}`}] ${e.type} ${JSON.stringify(e.data)}`);
    console.log('SUMMARY', JSON.stringify(result.summary));
  }
}
