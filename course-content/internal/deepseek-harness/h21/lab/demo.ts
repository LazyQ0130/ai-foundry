import {practiceA} from './A.ts';
import {practiceB} from './B.ts';
import {practiceC} from './C.ts';
import {practiceD} from './D.ts';
import {integrated} from './X.ts';
import {record} from './support.ts';
const [name='X',mode]=process.argv.slice(2);
const result=name==='A'?await practiceA(mode??'caller'):name==='B'?await practiceB(mode??'spawn'):name==='C'?await practiceC(mode==='empty'):name==='D'?await practiceD(mode??'messages'):await integrated();
await record(name+'-'+(mode??'default'),result);console.log(JSON.stringify(result,null,2));
