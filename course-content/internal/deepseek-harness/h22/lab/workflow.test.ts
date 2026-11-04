import {test} from 'node:test';
import {cases as A} from './A.ts';
import {cases as B} from './B.ts';
import {cases as C} from './C.ts';
import {cases as D} from './D.ts';
import {cases as boundaries} from './boundaries.ts';
for(const [name,run] of [...A,...B,...C,...D,...boundaries])test(name,{concurrency:false},run);
