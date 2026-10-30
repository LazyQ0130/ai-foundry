import assert from 'node:assert/strict';
import { assemblyPractice } from './assembly.ts';
// 错误答案：max-tokens中已block-end的工具仍能留下。正确实现必须拒绝此断言。
assert.ok(assemblyPractice('max-tokens').blocks.some(b => b.type === 'tool-call'));
