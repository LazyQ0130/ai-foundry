import { statesExample } from './states.ts';
import { resourcesExample, asyncOrderExample } from './resources.ts';
import { dependenciesExample } from './dependencies.ts';
for (const run of [statesExample, resourcesExample, asyncOrderExample, dependenciesExample]) {
  console.log(run.name, JSON.stringify(await run()));
}
