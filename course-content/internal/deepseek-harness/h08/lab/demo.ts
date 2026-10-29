import { compose } from './compose.mjs';
import { reconfigure, anonymousComparison } from './reconfigure.ts';
import { diagnosis } from './harness.ts';
console.log(JSON.stringify({ A: compose(), B: await reconfigure(),
  stable: await anonymousComparison(true), anonymous: await anonymousComparison(false), C: await diagnosis() }, null, 2));
