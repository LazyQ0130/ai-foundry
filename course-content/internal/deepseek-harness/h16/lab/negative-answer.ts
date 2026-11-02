import assert from 'node:assert/strict';
import {webPractice} from './web.ts';
// 错误预测：缺提供方会卸载已启用Web工具。必须非零退出。
assert.deepEqual((await webPractice('none')).schemas,[],'工具注册与后端可用性不是同一个状态');
