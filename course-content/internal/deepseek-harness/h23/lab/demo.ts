import {cases as A} from './A.ts';
import {cases as B} from './B.ts';
import {cases as C} from './C.ts';
import {cases as D} from './D.ts';
import {integrated} from './X.ts';
const choice=process.argv[2],groups:any={A,B,C,D,probe:[C[0]],web:[B.find(([name])=>name.startsWith('D B1'))]};
if(choice==='X'){await integrated();console.log('PASS X (reuses B1 and C1; no additional counted test)');}
else{if(!groups[choice])throw Error('Choose A, B, C, D or X');for(const [name,run] of groups[choice]){await run();console.log('PASS '+name);}}
