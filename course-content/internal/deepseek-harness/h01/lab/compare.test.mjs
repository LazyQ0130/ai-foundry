import test from 'node:test';
import assert from 'node:assert/strict';
import { minimal, controlled, makeWorld, mockModel, PUBLIC_TEXT } from './compare.mjs';

test('同一 Mock：A 直接写，B 等待；检查真实工具计数和内存结果', async () => {
  const a = makeWorld(), b = makeWorld();
  assert.equal((await minimal(a)).status, 'completed');
  assert.deepEqual(a.notes, [`部署笔记：${PUBLIC_TEXT}`]);
  const result = await controlled(b);
  assert.equal(result.status, 'waiting_approval');
  assert.deepEqual(b.calls, ['read_public']);
  assert.deepEqual(b.notes, []);
  assert.deepEqual(result.log.map(x => x.type), [
    'started', 'proposed', 'tool_started', 'tool_succeeded', 'proposed', 'waiting_approval',
  ]);
  assert.deepEqual(result.log.map(x => x.seq), [0, 1, 2, 3, 4, 5]);
});

test('宿主批准才执行相同参数；改变读取结果也改变笔记', async () => {
  const world = makeWorld({ text: '虚构版本乙：先检查迁移。' });
  let seen;
  const result = await controlled(world, { approve: call => { seen = call; return 'allow'; } });
  assert.equal(result.status, 'completed');
  assert.equal(seen.args.text, '部署笔记：虚构版本乙：先检查迁移。');
  assert.deepEqual(world.notes, [seen.args.text]);
  assert.ok(result.log.findIndex(e => e.type === 'approved') < result.log.findIndex(e => e.type === 'tool_started' && e.tool === 'save_note'));
  assert.throws(() => { seen.args.text = '偷换内容'; }, TypeError);
});

test('拒绝或未知审批值都不能执行写工具', async () => {
  for (const decision of ['reject', undefined, 'approved-by-model']) {
    const world = makeWorld();
    assert.equal((await controlled(world, { approve: () => decision })).status, 'denied');
    assert.deepEqual(world.calls, ['read_public']);
    assert.equal(world.notes.length, 0);
  }
});

test('读取失败：A 抛错；B 明确失败，后续模型和写工具不启动', async () => {
  await assert.rejects(minimal(makeWorld({ readFails: true })), /READ_FAILED/);
  const world = makeWorld({ readFails: true });
  let models = 0;
  const result = await controlled(world, { model: h => { models++; return mockModel(h); } });
  assert.equal(result.status, 'failed');
  assert.equal(result.error, 'READ_FAILED');
  assert.equal(models, 1);
  assert.deepEqual(world.calls, ['read_public']);
  assert.equal(world.notes.length, 0);
  assert.equal(result.log.at(-1).type, 'failed');
  assert.ok(!result.log.some(e => e.type === 'completed'));
});

test('写入后响应丢失：failed 不能证明副作用为零，也不会自动重试', async () => {
  const world = makeWorld({ failAfterWrite: true });
  const result = await controlled(world, { approve: () => 'allow' });
  assert.equal(result.status, 'failed');
  assert.equal(world.notes.length, 1);
  assert.deepEqual(world.calls, ['read_public', 'save_note']);
  assert.ok(!result.log.some(e => e.type === 'tool_succeeded' && e.tool === 'save_note'));
});

test('未知工具、坏参数及模型自报批准：正文执行次数为零', async () => {
  for (const proposal of [
    { tool: 'shell', args: {} },
    { tool: 'read_public', args: { approved: true } },
    { tool: 'save_note', args: { text: 42 } },
    { tool: 'save_note', args: { text: '笔记', approved: true } },
  ]) {
    const world = makeWorld();
    assert.equal((await controlled(world, { model: () => proposal })).status, 'failed');
    assert.deepEqual(world.calls, []);
    assert.equal(world.notes.length, 0);
  }
  const world = makeWorld();
  const result = await controlled(world, { model: () => ({ tool: 'save_note', args: { text: '笔记' }, approved: true }) });
  assert.equal(result.status, 'waiting_approval');
  assert.equal(world.notes.length, 0);
});

test('两种循环都有限次；直接结束不启动工具', async () => {
  for (const run of [minimal, controlled]) {
    const world = makeWorld();
    assert.equal((await run(world, ...(run === minimal ? [() => ({ done: true })] : [{ model: () => ({ done: true }) }]))).status, 'completed');
    assert.equal(world.calls.length, 0);
    const repeat = () => ({ tool: 'read_public', args: {} });
    assert.equal((await run(world, ...(run === minimal ? [repeat] : [{ model: repeat }]))).status, 'limit');
    assert.equal(world.calls.length, 4);
  }
});
