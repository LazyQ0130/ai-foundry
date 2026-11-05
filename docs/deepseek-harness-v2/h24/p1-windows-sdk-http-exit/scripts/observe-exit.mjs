// Observation only: does not override process.exit, suppress stderr or delay exit.
import {writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
process.on('exit',code=>{
 const root=process.env.H24_WORLD;if(!root)return;
 const report=process.report.getReport();
 writeFileSync(resolve(root,'p1-exit-observation.json'),JSON.stringify({pid:process.pid,code,node:process.version,phase:'synchronous exit event; SDK built-in exit remains unchanged',javascriptStack:new Error('exit observation').stack,libuv:report.libuv,fixtureDisposeTraceExists:existsSync(resolve(root,'runtime-trace.json')),nativeStack:'No native debugger available; this JavaScript report is not the assertion native stack'},null,2)+'\n');
});
