import {approvalPractice,approvalCases,approvalPolicyPractice} from './approval.ts';
import {pipelinePractice,pipelineCases} from './pipeline.ts';
import {sandboxPractice} from './sandbox.ts';
import {filesystemPractice} from './filesystem.ts';
for(const kind of approvalCases)console.log('A_'+kind,JSON.stringify(await approvalPractice(kind)));
console.log('A_policy',JSON.stringify(await approvalPolicyPractice()));
for(const kind of pipelineCases)console.log('B_'+kind,JSON.stringify(await pipelinePractice(kind)));
console.log('C_policy',JSON.stringify(await sandboxPractice()));
console.log('D_files',JSON.stringify(await filesystemPractice()));
