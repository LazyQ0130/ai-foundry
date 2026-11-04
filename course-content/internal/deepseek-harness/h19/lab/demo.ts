import {writeFile} from 'node:fs/promises';
import {practiceA} from './A.ts';import {practiceB} from './B.ts';import {practiceC} from './C.ts';import {practiceD} from './D.ts';import {integrated} from './X.ts';
const [which='X',variant]=process.argv.slice(2);const result=which==='A'?await practiceA():which==='B'?await practiceB():which==='C'?await practiceC(variant):which==='D'?await practiceD(variant):which==='X'?await integrated():(()=>{throw Error('choose A/B/C/D/X')})();
console.log(JSON.stringify(result,null,2));
