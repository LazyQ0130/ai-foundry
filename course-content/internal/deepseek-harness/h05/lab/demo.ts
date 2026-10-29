// 库级教学装配：使用真实 Cordis；不经过 Harness Profile 或 Loader。
import assert from 'node:assert/strict';
import { Context, FiberState } from '@deepseek-ai/cordis';
import * as greeter from './greeter.ts';
import * as consumer from './consumer.ts';

const ctx = new Context();
try {
  const waiting = ctx.plugin(consumer);
  await waiting;
  assert.equal(waiting.state, FiberState.PENDING);
  assert.equal(ctx.get('greeter'), undefined);
  console.log('缺失依赖：PENDING；尚未调用 greet');
  if (process.argv[2] !== '--missing') {
    await ctx.plugin(greeter);
    // 外层提供方还挂载了子类插件；显式等待子插件与消费者稳定。
    for (const fiber of ctx.registry.get(greeter.GreeterService)!.fibers) await fiber.await();
    await waiting;
    assert.equal(waiting.state, FiberState.ACTIVE);
    console.log('依赖满足：ACTIVE');
  }
} finally { await ctx.fiber.dispose(); }
