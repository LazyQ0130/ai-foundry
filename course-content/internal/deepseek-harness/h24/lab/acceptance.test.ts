import {test} from 'node:test';
import {cases as P} from './boundaries.ts';
import {cases as D} from './D.ts';
import {cases as C} from './C.ts';
import {cases as A} from './A.ts';
import {cases as B} from './B.ts';
for(const [name,run] of [...A,...B,...C,...D,...P])test(name,{concurrency:false},run);
