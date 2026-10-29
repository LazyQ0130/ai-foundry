import { emitExample, parallelExample, serialExample, bailExample, waterfallExample } from './modes.ts';
import { runRequest, type Case } from './request.ts';
for (const run of [emitExample, parallelExample, serialExample, bailExample, waterfallExample]) {
  console.log(run.name, JSON.stringify(await run()));
}
for (const kind of ['allow', 'deny', 'lost-next', 'lost-return'] as Case[]) {
  console.log(kind, JSON.stringify(await runRequest(kind)));
}
