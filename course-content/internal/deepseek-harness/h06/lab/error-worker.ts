// 独立子进程：验证 emit/bail 不收集异步拒绝；失败是预期证据。
import { Context } from '@deepseek-ai/cordis';
import type {} from './support.ts';
const ctx = new Context();
ctx.on('course/notice', async () => { throw Error('LISTENER_ASYNC_FAILURE'); });
const mode = process.argv[2] === 'bail' ? 'bail' : 'emit';
if (mode === 'bail') ctx.bail('course/notice'); // 故意把异步回调放进同步判断。
else ctx.emit('course/notice');
console.log(`${mode} 已返回`);
await ctx.fiber.dispose();
