import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const source=process.env.HARNESS_SOURCE_CACHE!,mode=process.argv[2];
if(mode==='parse'){const {parseDshArgs}=await import(pathToFileURL(resolve(source,'apps/cli/src/args.ts')).href);console.log(JSON.stringify(parseDshArgs(process.argv.slice(3),'0.2.2-alpha.2')));}
else if(mode==='cli'){process.argv.splice(2,1);const {runCli}=await import(pathToFileURL(resolve(source,'apps/cli/src/bin.ts')).href);await runCli();}
else throw Error('parse or cli required');
