// 故意错误答案：旧 set 遇到注销并重新注册同一对象后仍有效。
import assert from 'node:assert/strict';
import { admissionPractice } from './admission.ts';
assert.deepEqual((await admissionPractice()).replacement, ['conditional'], '旧准入不是永久许可证');
