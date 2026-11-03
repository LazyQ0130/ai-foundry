import {integratedPractice} from './agent.ts';
import {assert} from './support.ts';
const x=await integratedPractice();
assert.equal(x.replayedToolExecutions,1,'错误答案：Fork 会重跑工具');
