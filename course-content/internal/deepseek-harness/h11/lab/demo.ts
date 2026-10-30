import { sectionsPractice } from './sections.ts';
import { contextsPractice } from './contexts.ts';
import { scopesPractice } from './scopes.ts';
import { requestsPractice, type RequestCase } from './requests.ts';
console.log('A', JSON.stringify(await sectionsPractice()));
console.log('B', JSON.stringify(await contextsPractice()));
console.log('C', JSON.stringify(await scopesPractice()));
for (const kind of ['plain','in-history','series','tools','refresh','suppress','render-error','context-error','cancel-prepare','cancel-assemble','retry','tool-order-error','context-change','initial-empty'] as RequestCase[]) {
  console.log('D-' + kind, JSON.stringify(await requestsPractice(kind)));
}
