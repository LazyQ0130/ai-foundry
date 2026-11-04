import {test} from 'node:test';
import {cases as A} from './A.ts';
import {cases as B} from './B.ts';
import {cases as C} from './C.ts';
import {cases as D} from './D.ts';
for(const [name,run] of [...A,...B,...C,...D])test(name,{concurrency:false},run);
