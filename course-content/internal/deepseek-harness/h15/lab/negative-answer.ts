import assert from 'node:assert/strict';
import {pipelinePractice} from './pipeline.ts';
// 故意错误的预测：批准以后可以越过守卫。这个程序必须非零退出。
assert.equal((await pipelinePractice('approved-guard')).bodies,1,'错误答案应被拒绝：批准不能绕过所有者守卫');
