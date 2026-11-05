import {httpReview} from './D.ts';
import {assert,fixed,record} from './support.ts';
export async function integrated(){
 const result=await httpReview();const {parseSessionLog}=await import('@deepseek-ai/dsh-llm-replay');const restored=parseSessionLog(result.log);
 const calls=restored.filter(e=>e.type==='tool/call'),answers=restored.filter(e=>e.type==='tool/result');assert.equal(calls.length,1);assert.equal(answers.length,1);assert.equal((calls[0] as any).data.callId,(answers[0] as any).data.message.toolCallId);
 // Read a new detached Session after the writer process exited. Never run its tools again.
 const {Session,SessionId,SessionLogOffset}=await import('@deepseek-ai/dsh-session');const header=JSON.parse(result.log.split('\n')[0]);
 const {currentSessionMessageProjections}=await import(fixed('packages/session/session-format-catalog/src/message-projections.ts'));
 const session=Session.fromRestore(SessionId(header.id),restored,header,SessionLogOffset(0),'detached',currentSessionMessageProjections);
 const messages=session.deriveMessages(),lastRequest=result.runtime.requests.at(-1).messages;
 assert.deepEqual(messages.slice(0,lastRequest.length),lastRequest);assert.equal(messages.length,lastRequest.length+1);assert.equal(messages.at(-1)?.role,'assistant');
 const report={requirements:['SDK accepted input','real YAML Loader core','429→retry→tool→next model request','safe external file read independently','full JSONL reopened through fixed catalog and new detached Session','reconstructed message prefix equals actual last model input','shutdown exit0 with official test exit hook and loopback port released'],highestGrade:'D',keyless:true,realProvider:false,realBrowser:false,builtProduct:false,remaining:['default SDK exit Windows native assertion','shipped Profile and lib-mode product','Web product/credential security','all faults/platforms','performance/cost/learners/external review'],evidence:{pid:result.wire.pid,root:result.world.root,requests:result.requests.length,toolCallId:(calls[0] as any).data.callId,events:restored.length,reconstructedMessages:messages.length},counting:'reuses D1, no extra TAP count'};await record('X',{report,reconstructedMessages:messages,...result});return report;
}
