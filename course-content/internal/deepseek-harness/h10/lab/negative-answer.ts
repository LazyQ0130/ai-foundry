import { execution } from './execution.ts';
import { verifyTrace } from './trace-answer.ts';
const actual = await execution('retry');
// 故意错误：把两次模型尝试写成两个Step。应非零，不能改正确轨迹求绿。
verifyTrace(actual, { turns: [1], steps: [[1, 1], [1, 2]], attempts: 2, toolCalls: 0, toolPositions: [], ends: ['completed'] });
