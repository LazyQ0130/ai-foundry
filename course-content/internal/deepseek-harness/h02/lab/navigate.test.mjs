import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { reference, cards, checkAnswer, graphLines } from './navigate.mjs';

test('参考定位与六条关系全部符合；输出保留每条边的语义', () => {
  assert.equal(checkAnswer(reference).ok, true);
  assert.equal(graphLines(reference).length, 6);
  assert.ok(graphLines(reference).includes('[runtime-call] ToolsService.execute -> NativeToolExecutor.execute'));
});
test('旧单层路径、猜测的包名与错误接口都拒绝', () => {
  for (const key of ['packageName','implementation','contract','symbol','consumer','test','testCase']) {
    const answer = structuredClone(reference); answer.locate[key] = 'guessed';
    assert.deepEqual(checkAnswer(answer).errors, [`A.${key}`]);
  }
});
test('运行时反向调用不能改写成静态依赖', () => {
  const answer = structuredClone(reference);
  answer.edges.find(e => e.id === 'R4').kind = 'static-value';
  assert.ok(checkAnswer(answer).errors.includes('B.R4.kind'));
});
test('Project Reference 不是调用；type import 不是运行时注册', () => {
  for (const [id, kind] of [['R3','runtime-call'], ['R1','runtime-registration']]) {
    const answer = structuredClone(reference); answer.edges.find(e => e.id === id).kind = kind;
    assert.equal(checkAnswer(answer).ok, false);
  }
});
test('方向错误、遗漏、重复与未知边均拒绝', () => {
  const reversed = structuredClone(reference);
  [reversed.edges[3].from,reversed.edges[3].to] = [reversed.edges[3].to,reversed.edges[3].from];
  assert.equal(checkAnswer(reversed).ok, false);
  for (const edges of [reference.edges.slice(1), [...reference.edges, reference.edges[0]], reference.edges.map((e,i) => i ? e : {...e,id:'unknown'})]) {
    assert.equal(checkAnswer({...reference,edges}).ok, false);
  }
});
test('空输入受控失败；答案顺序不影响关系含义', () => {
  for (const input of [null,{}, {edges:[]}]) assert.equal(checkAnswer(input).ok, false);
  assert.equal(checkAnswer({...reference,edges:[...reference.edges].reverse()}).ok, true);
  assert.throws(() => graphLines({}), /先修正/);
});
test('固定卡片全部带源码文件、行号、证据；只存六个精选关系', () => {
  assert.equal(cards.length, 6);
  for (const c of cards) assert.ok(c.file && c.line > 0 && c.evidence && c.kind);
});
test('CLI 实际退出码：正确答案 0，错误分类/缺失文件非零', async () => {
  // 保留新建临时夹具，不做递归删除，遵守工作区文件政策。
  const cwd = await mkdtemp(resolve(tmpdir(),'aifoundry-h02-test-'));
  const cli = fileURLToPath(new URL('./navigate.mjs', import.meta.url));
  const run = () => spawnSync(process.execPath,[cli],{cwd,encoding:'utf8'});
  assert.notEqual(run().status,0);
  await writeFile(resolve(cwd,'answer.json'),JSON.stringify(reference));
  assert.equal(run().status,0);
  await writeFile(resolve(cwd,'answer.json'),JSON.stringify({...reference,edges:[]}));
  assert.notEqual(run().status,0);
});
