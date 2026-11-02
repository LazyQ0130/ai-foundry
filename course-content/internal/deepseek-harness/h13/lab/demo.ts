import { definitionsPractice } from './definitions.ts';
import { scopesPractice } from './scopes.ts';
import { admissionPractice } from './admission.ts';
import { requestsPractice } from './requests.ts';
import { progressivePractice } from './progressive.ts';
for (const [name, run] of [['P', progressivePractice], ['A', definitionsPractice], ['B', scopesPractice], ['C', admissionPractice],
  ['D', () => requestsPractice('success')], ['D_retry', () => requestsPractice('retry')],
  ['D_false', () => requestsPractice('false')], ['D_remove', () => requestsPractice('remove')],
  ['D_replace', () => requestsPractice('replace')], ['D_restrict', () => requestsPractice('restrict')]] as const)
  console.log(name + ' ' + JSON.stringify(await run()));
