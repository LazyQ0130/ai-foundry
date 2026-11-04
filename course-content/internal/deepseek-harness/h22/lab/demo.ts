import {cases as A} from './A.ts';
import {cases as B} from './B.ts';
import {cases as C} from './C.ts';
import {cases as D} from './D.ts';
import {cases as boundaries} from './boundaries.ts';
import {integrated} from './X.ts';
const choice=process.argv[2],groups:any={A,B,C,D,boundaries};
if(choice==='X'){await integrated();console.log('PASS X (same scenario as D1, not an additional counted test)');}
else{if(!groups[choice])throw Error('Choose A, B, C, D, X or boundaries');for(const [name,run] of groups[choice]){await run();console.log('PASS '+name);}}
