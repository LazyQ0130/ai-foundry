import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
// 输入来自真实Loop的观察结果；本模块只核学生标注，不模拟执行器。
export function verifyTrace(result: any, answer: any) {
  const { turns, steps, attempts, toolCalls, ends } = result.summary;
  const toolPositions = result.events.filter((e: any) => e.type === 'tool/call').map((e: any) => [e.data.callId, e.data.turn, e.data.step]);
  assert.deepEqual(answer, { turns, steps, attempts, toolCalls, toolPositions, ends });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  assert.ok(process.argv[2], '请提供明确的答案JSON文件路径');
  const answer = JSON.parse(await readFile(process.argv[2], 'utf8'));
  const { execution } = await import('./execution.ts');
  const scenario = process.argv[3] ?? 'retry';
  assert.ok(scenario === 'retry' || scenario === 'multi', '场景只能为retry或multi');
  verifyTrace(await execution(scenario), answer);
  console.log('PASS: ' + scenario + '轨迹标注正确（真实Loop重跑）');
}
