import {integrated} from './X.ts';
import {cases as P} from './boundaries.ts';
import {cases as D} from './D.ts';
import {cases as C} from './C.ts';
import {cases as A} from './A.ts';
import {cases as B,seedCandidate} from './B.ts';
const groups:any={A,B,C,D,P};const choice=process.argv[2];if(choice==='X'){console.log(JSON.stringify(await integrated()));}else if(choice==='seed'){await seedCandidate();}else{if(!groups[choice])throw Error('Choose A, B, C, D, P or X');for(const [name,run] of groups[choice]){await run();console.log('PASS '+name);}}
