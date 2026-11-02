import {assert} from './support.ts';
import {tracePractice} from './trace.ts';
const x=tracePractice();
// 故意把所有事实当模型消息；必须非零退出，检验关键错误答案会被拦住。
assert.equal(x.messages.length,x.sourceEventCount,'错误：每条日志都是一条模型消息');
