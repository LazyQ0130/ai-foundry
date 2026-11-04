import {webReview} from './B.ts';
import {sdkReview} from './C.ts';
import {assert,record} from './support.ts';
export async function integrated(){const web=await webReview(),sdk=await sdkReview();assert.ok(JSON.stringify(web.events).includes('modules=3'));assert.match(sdk.result.finalResponse,/modules=3/);const result={web,sdk,sameInput:'fictional modules=3 and covered=2/3',shared:'AgentLoop/Tools/LlmRuntime/Session core behavior',different:'Web Remote controlled carrier vs SDK JSON-RPC real stdio child; separate sessions/writers',counting:'reuses B1 and C1, no additional independent TAP count'};await record('X',result);return result;}
