import {appendPractice} from './append.ts';
import {surfacePractice} from './surface.ts';
import {projectionPractice} from './projection.ts';
import {agentPractice} from './agent.ts';
import {traceRegistryPractice} from './trace.ts';
for(const [key,run] of Object.entries({A:appendPractice,B:surfacePractice,C:projectionPractice,D:()=>agentPractice(),D_failure:()=>agentPractice('failure'),D_rejected:()=>agentPractice('rejected-settlement'),X:traceRegistryPractice}))
 if(!process.argv[2]||process.argv[2]===key)console.log(key+' '+JSON.stringify(await run()));
