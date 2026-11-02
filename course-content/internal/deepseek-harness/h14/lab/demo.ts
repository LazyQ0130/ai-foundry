import {flowPractice,type FlowCase} from './flow.ts';
import {schedulingPractice,type ScheduleCase} from './scheduling.ts';
import {failuresPractice,type FailureCase} from './failures.ts';
import {requestsPractice,type LoopCase} from './requests.ts';
for(const kind of ['normal','deny','guard','ask','cancel','content','value','block','pre-throw','around-throw','project-throw','post-throw','final-throw','output-bad','observer-throw'] as FlowCase[])
 console.log('A_'+kind+' '+JSON.stringify(await flowPractice(kind)));
for(const kind of ['parallel','limit-one','body-error','rolling','reclassify'] as ScheduleCase[])
 console.log('B_'+kind+' '+JSON.stringify(await schedulingPractice(kind)));
for(const kind of ['unknown','parse','args','deny','pre-abort','body-throw','output','post-throw','post-abort','pending-abort','pre-pending-abort','scheduler','signal-replace','snapshot'] as FailureCase[])
 console.log('C_'+kind+' '+JSON.stringify(await failuresPractice(kind)));
for(const kind of ['success','deny','body-error','cancel','conclude','conclude-context','block-conclude','internal'] as LoopCase[])
 console.log('D_'+kind+' '+JSON.stringify(await requestsPractice(kind)));
