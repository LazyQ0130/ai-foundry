import assert from 'node:assert/strict';
import {schedulingPractice} from './scheduling.ts';
const r=await schedulingPractice('parallel');
// 故意错误：按主体完成顺序提交结果。真实模型顺序仍是 A、B、C。
assert.deepEqual(r.facts.filter(e=>e.type==='tool/result').map(e=>e.data.message.toolCallId),['B','A','C']);
