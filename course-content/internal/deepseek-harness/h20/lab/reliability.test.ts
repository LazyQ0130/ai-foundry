import {test} from 'node:test';
import {practiceA,A_CASES,policyBoundary} from './A.ts';import {practiceB,B_CASES} from './B.ts';import {practiceC} from './C.ts';import {practiceD,D_CASES} from './D.ts';import {integrated} from './X.ts';import {record} from './support.ts';
test('C policy: resolved defaults and rejected configurations',()=>record('policy',policyBoundary()));
for(const k of A_CASES)test('D A: '+k,async()=>record('A-'+k,await practiceA(k)));
for(const k of B_CASES)test('D B: '+k,async()=>record('B-'+k,await practiceB(k)));
for(const k of ['recovered','cancelled'])test('D C: '+k,async()=>record('C-'+k,await practiceC(k)));
for(const k of D_CASES)test('C D: '+k,async()=>record('D-'+k,await practiceD(k)));
test('D X: retry, tool effect, cancel, exact prefix copy and real JSONL resume',async()=>record('X',await integrated()));
