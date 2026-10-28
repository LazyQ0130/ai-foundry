// 教学练习：固定源码定位与图分类，不加载或运行 Harness。
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

export const COMMIT = 'f3803c96974ad4a94195fb97e5c637e9c2a3afe3';
const native = 'packages/core/tool-executor-native';
const tools = 'packages/core/tools';
export const cards = [
  { id: 'R1', file: `${native}/src/index.ts`, line: 4,
    evidence: 'import type { ToolDefinition, ToolExecutor, ToolModelInput, ToolBatchInput, ToolBatchResult } from',
    kind: 'static-type', from: 'native-package', to: 'tools-package' },
  { id: 'R2', file: `${native}/src/index.ts`, line: 3,
    evidence: 'import { projectToolSchema } from',
    kind: 'static-value', from: 'native-package', to: 'tools-package' },
  { id: 'R3', file: `${native}/tsconfig.json`, line: 15,
    evidence: '"path": "../tools"',
    kind: 'build-reference', from: 'native-project', to: 'tools-project' },
  { id: 'R4', file: `${tools}/src/index.ts`, line: 376,
    evidence: 'return this.selectExecutor(input.agent).execute(input)',
    kind: 'runtime-call', from: 'ToolsService.execute', to: 'NativeToolExecutor.execute' },
  { id: 'R5', file: `${native}/src/index.ts`, line: 34,
    evidence: 'ctx.tools.setExecutor(new NativeToolExecutor(ctx))',
    kind: 'runtime-registration', from: 'native.apply', to: 'ToolsService.setExecutor' },
  { id: 'R6', file: `${native}/src/index.ts`, line: 20,
    evidence: 'return executeToolBatch(input, this.pipeline, this.maxParallel)',
    kind: 'runtime-call', from: 'NativeToolExecutor.execute', to: 'executeToolBatch' },
];

// R4 的目标以原生执行器已被选中为前提，不能推广到任意配置。
export const reference = {
  locate: {
    packageName: '@deepseek-ai/dsh-tool-executor-native',
    implementation: `${native}/src/index.ts`,
    contract: `${tools}/src/executor.ts`,
    symbol: 'ToolExecutor',
    consumer: 'packages/core/agent-loop/src/agent.ts',
    test: 'packages/core/agent-loop/tests/tool-executors.spec.ts',
    testCase: 'shares the registry and selects an independent executor through the preset scope chain',
  },
  edges: cards.map(({ id, kind, from, to }) => ({ id, kind, from, to })),
};

export function checkAnswer(answer) {
  const errors = [];
  for (const [key, value] of Object.entries(reference.locate)) {
    if (answer?.locate?.[key] !== value) errors.push(`A.${key}`);
  }
  if (!Array.isArray(answer?.edges)) return { ok: false, errors: [...errors, 'B.edges'] };
  const ids = answer.edges.map(e => e?.id);
  if (ids.length !== cards.length || new Set(ids).size !== cards.length) errors.push('B.ids');
  for (const expected of cards) {
    const actual = answer.edges.find(e => e?.id === expected.id);
    for (const key of ['kind', 'from', 'to']) {
      if (actual?.[key] !== expected[key]) errors.push(`B.${expected.id}.${key}`);
    }
  }
  return { ok: errors.length === 0, errors };
}

export function graphLines(answer) {
  assert.equal(checkAnswer(answer).ok, true, '先修正定位与分类，再画图');
  return answer.edges.map(e => `[${e.kind}] ${e.from} -> ${e.to}`);
}

export function selfTest() {
  assert.equal(checkAnswer(reference).ok, true);
  const wrong = structuredClone(reference);
  wrong.edges.find(e => e.id === 'R4').kind = 'static-value';
  assert.equal(checkAnswer(wrong).ok, false);
  const moved = structuredClone(reference);
  moved.locate.implementation = 'packages/tool-executor-native/src/index.ts';
  assert.equal(checkAnswer(moved).ok, false);
  console.log('PASS：校验器自检 3 项；尚不表示你的答案通过');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === '--self-test') selfTest();
  else {
    try {
      // 只读当前练习目录中这一个明确文件，不扫描机器或运行任何工具。
      const answer = JSON.parse(await readFile('answer.json', 'utf8'));
      const result = checkAnswer(answer);
      if (!result.ok) { console.error('FAIL：' + result.errors.join(', ')); process.exitCode = 1; }
      else { console.log('PASS：A 定位事实 + B 六条关系'); console.log(graphLines(answer).join('\n')); }
    } catch {
      console.error('FAIL：在当前练习目录创建有效的 answer.json，再运行。');
      process.exitCode = 1;
    }
  }
}
