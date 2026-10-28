// 教学简化：不是 DeepSeek Harness API。只操作虚构资料和内存数组。
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

export const PUBLIC_TEXT = '公开部署说明：先检查构建，再检查健康状态。';

// 同一个 Mock 根据工具结果决定下一步；不调用模型服务。
export function mockModel(history) {
  if (!history.length) return { tool: 'read_public', args: {} };
  const last = history.at(-1);
  if (last.tool === 'read_public') {
    return { tool: 'save_note', args: { text: `部署笔记：${last.result}` } };
  }
  return { done: true };
}

export function makeWorld({ readFails = false, failAfterWrite = false, text = PUBLIC_TEXT } = {}) {
  const notes = [];
  const calls = [];
  return {
    notes, calls,
    tools: {
      read_public() {
        calls.push('read_public');
        if (readFails) throw new Error('READ_FAILED');
        return text;
      },
      save_note(args) {
        calls.push('save_note');
        notes.push(args.text);
        if (failAfterWrite) throw new Error('RESPONSE_LOST_AFTER_WRITE');
        return 'SAVED';
      },
    },
  };
}

// A 故意删去校验、审批和运行日志；保留次数上限，避免教学代码无限运行。
export async function minimal(world, model = mockModel) {
  const history = [];
  for (let n = 0; n < 4; n++) {
    const proposal = await model(history);
    if (proposal.done) return { status: 'completed' };
    const result = await world.tools[proposal.tool](proposal.args);
    history.push({ tool: proposal.tool, result });
  }
  return { status: 'limit' };
}

function checked(proposal) {
  if (!proposal || !['read_public', 'save_note'].includes(proposal.tool)) {
    throw new Error('UNKNOWN_TOOL');
  }
  const args = proposal.args;
  if (!args || typeof args !== 'object' || Array.isArray(args)) throw new Error('BAD_ARGS');
  const valid = proposal.tool === 'read_public'
    ? Object.keys(args).length === 0
    : Object.keys(args).length === 1 && typeof args.text === 'string'
      && args.text.trim().length > 0 && args.text.length <= 200;
  if (!valid) throw new Error('BAD_ARGS');
  return Object.freeze({ tool: proposal.tool, args: Object.freeze({ ...args }) });
}

// B 的审批输入来自宿主测试代码，不来自模型。每次运行都是新实验，不实现恢复。
export async function controlled(world, { approve = () => 'wait', model = mockModel } = {}) {
  const history = [];
  const log = [];
  const record = (type, tool) => log.push({ seq: log.length, type, ...(tool ? { tool } : {}) });
  const finish = (status) => { record(status); return { status, log }; };
  record('started');
  try {
    for (let n = 0; n < 4; n++) {
      const proposal = await model(history);
      if (proposal?.done === true) return finish('completed');
      const call = checked(proposal);
      record('proposed', call.tool);
      if (call.tool === 'save_note') {
        const decision = await approve(call);
        if (decision === 'wait') return finish('waiting_approval');
        if (decision !== 'allow') return finish('denied');
        record('approved', call.tool);
      }
      record('tool_started', call.tool);
      const result = await world.tools[call.tool](call.args);
      record('tool_succeeded', call.tool);
      history.push({ tool: call.tool, result });
    }
    return finish('limit');
  } catch (error) {
    record('failed');
    // 本例工具只抛固定错误码；不把真实外部错误原文写入日志。
    return { status: 'failed', error: error.message, log };
  }
}

export async function demo() {
  const cases = [
    ['A 最小循环', minimal, {}, 'completed', 1, 2],
    ['B 等待审批', controlled, {}, 'waiting_approval', 0, 1],
    ['B 宿主批准', w => controlled(w, { approve: () => 'allow' }), {}, 'completed', 1, 2],
    ['B 读取失败', controlled, { readFails: true }, 'failed', 0, 1],
    ['B 写后报错', w => controlled(w, { approve: () => 'allow' }), { failAfterWrite: true }, 'failed', 1, 2],
  ];
  for (const [name, run, options, status, notes, calls] of cases) {
    const world = makeWorld(options);
    const result = await run(world);
    console.log(`${name} | ${result.status} | 笔记=${world.notes.length} | 工具=${world.calls.join(',')}`);
    if (name === 'B 等待审批') console.log(result.log.map(e => `${e.seq}:${e.type}`).join(' → '));
    assert.equal(result.status, status);
    assert.equal(world.notes.length, notes);
    assert.equal(world.calls.length, calls);
  }
  console.log('PASS：5 组状态与实际效果检查');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await demo();
