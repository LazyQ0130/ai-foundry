import { registryExample } from './registry.ts';
import { ownershipExample } from './ownership.ts';
import { failureExample, type FailureCase } from './failures.ts';
console.log('A', JSON.stringify(await registryExample()));
console.log('B', JSON.stringify(await ownershipExample()));
for (const kind of ['setup', 'commit', 'session-listener', 'agent-listener', 'cancel', 'normal'] as FailureCase[]) {
  console.log('C', JSON.stringify(await failureExample(kind)));
}
