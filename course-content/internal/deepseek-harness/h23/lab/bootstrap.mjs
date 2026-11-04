// 依赖锚点均由作者 runner 按固定上游 lock 完整核验。
import fs from 'node:fs';
import {resolve} from 'node:path';
import {registerHooks, createRequire, syncBuiltinESMExports} from 'node:module';
import {pathToFileURL} from 'node:url';
const dep=createRequire(pathToFileURL(process.env.H23_DEPS_ANCHOR));
const zod=createRequire(pathToFileURL(process.env.H23_ZOD_ANCHOR));
const native=createRequire(pathToFileURL(process.env.H23_NATIVE_ANCHOR));
const limit=createRequire(pathToFileURL(process.env.H23_LIMIT_ANCHOR));
const ptc=createRequire(pathToFileURL(process.env.H23_PTC_ANCHOR));
const wire=createRequire(pathToFileURL(process.env.H23_WIRE_ANCHOR));
const entries=new Map(['commander','js-yaml','@eslint-community/regexpp','ajv','node-addon-require-builtin','resolve.exports','semver']
 .map(name=>[name,pathToFileURL(dep.resolve(name)).href]));
entries.set('eventsource-parser/stream',pathToFileURL(wire.resolve('eventsource-parser/stream')).href);
entries.set('mime-types',pathToFileURL(wire.resolve('mime-types')).href);
entries.set('ws',pathToFileURL(resolve(process.env.H23_WIRE_ANCHOR,'../wrapper.mjs')).href);
entries.set('zod',pathToFileURL(zod.resolve('zod')).href);
entries.set('koffi',pathToFileURL(native.resolve('koffi')).href);
entries.set('yaml',pathToFileURL(native.resolve('yaml')).href);
entries.set('chokidar',pathToFileURL(native.resolve('chokidar')).href);
entries.set('p-limit',pathToFileURL(limit.resolve('p-limit')).href);
entries.set('@js-temporal/polyfill',pathToFileURL(limit.resolve('@js-temporal/polyfill')).href);
for(const name of ['acorn','acorn-walk','birpc'])entries.set(name,pathToFileURL(ptc.resolve(name)).href);
for(const [name,file] of [['@deepseek-ai/dsh-api-gateway/client','packages/api/gateway/src/client/index.ts'],['@deepseek-ai/dsh-client-connection/client','packages/client/connection/src/client/index.ts'],['@deepseek-ai/dsh-client-connection/src/client/rpc.ts','packages/client/connection/src/client/rpc.ts']])entries.set(name,pathToFileURL(resolve(process.env.HARNESS_SOURCE_CACHE,file)).href);
registerHooks({resolve(specifier,context,next){return next(entries.get(specifier)??specifier,context);}});
// 用户禁止批量/递归删除；包括上游异常清理路径也不准执行递归 rm。
const rm=fs.promises.rm;
const rmSync=fs.rmSync;
fs.rmSync=(path,options)=>{if(options?.recursive)throw Error('H23 safety guard: recursive removal forbidden');return rmSync(path,options);};
fs.promises.rm=async(path,options)=>{
 if(options?.recursive)throw Error('H23 safety guard: recursive removal forbidden');
 return rm(path,options);
};
syncBuiltinESMExports();
