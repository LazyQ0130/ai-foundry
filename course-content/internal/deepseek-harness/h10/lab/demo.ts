import { execution, type Case } from './execution.ts';
import { routing, duringRun } from './routing.ts';
import { cancellation, type CancelCase } from './branches.ts';
for (const name of ['direct', 'one-tool', 'multi', 'two-tools', 'reject', 'empty', 'retry', 'terminal', 'tool-error', 'max-tokens'] as Case[]) {
  const r = await execution(name); console.log(name, JSON.stringify(r.summary));
  if (name === 'multi' || name === 'retry') console.log(name + '-TRACE', JSON.stringify(r));
}
console.log('routing', JSON.stringify(await routing()));
for (const kind of ['steer', 'followup', 'inject'] as const) console.log('during-' + kind, JSON.stringify((await duringRun(kind)).summary));
for (const kind of ['pre-step', 'request', 'stream', 'keep-inbox', 'drop-inbox'] as CancelCase[]) console.log('cancel-' + kind, JSON.stringify(await cancellation(kind)));
