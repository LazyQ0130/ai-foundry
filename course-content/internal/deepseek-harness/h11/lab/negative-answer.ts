import assert from 'node:assert/strict';
import { sectionsPractice } from './sections.ts';
const actual = await sectionsPractice();
// 错误断言：把assemble当成已经完成变量插值。应非零，不能改官方输出求绿。
assert.equal(actual.assembly.sections.find(s => s.name === 'Alpha')!.text, 'A：用简洁语言回答');
