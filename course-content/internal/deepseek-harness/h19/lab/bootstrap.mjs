// 依赖锚点均由作者 runner 按固定上游 lock 完整核验。
import fs from 'node:fs';
import {registerHooks, createRequire, syncBuiltinESMExports} from 'node:module';
import {pathToFileURL} from 'node:url';
const dep=createRequire(pathToFileURL(process.env.H19_DEPS_ANCHOR));
const zod=createRequire(pathToFileURL(process.env.H19_ZOD_ANCHOR));
const native=createRequire(pathToFileURL(process.env.H19_NATIVE_ANCHOR));
const limit=createRequire(pathToFileURL(process.env.H19_LIMIT_ANCHOR));
const entries=new Map(['js-yaml','@eslint-community/regexpp','ajv','node-addon-require-builtin','resolve.exports','semver']
 .map(name=>[name,pathToFileURL(dep.resolve(name)).href]));
entries.set('zod',pathToFileURL(zod.resolve('zod')).href);
entries.set('koffi',pathToFileURL(native.resolve('koffi')).href);
entries.set('p-limit',pathToFileURL(limit.resolve('p-limit')).href);
entries.set('@js-temporal/polyfill',pathToFileURL(limit.resolve('@js-temporal/polyfill')).href);
for(const file of ['region','config','summarizer'])entries.set('@deepseek-ai/dsh-compaction-basic/src/'+file+'.ts',pathToFileURL(process.env.HARNESS_SOURCE_CACHE+'/packages/compaction/compaction-basic/src/'+file+'.ts').href);
entries.set('@deepseek-ai/dsh-compaction-image-offload/src/image-offload.ts',pathToFileURL(process.env.HARNESS_SOURCE_CACHE+'/packages/compaction/compaction-image-offload/src/image-offload.ts').href);
registerHooks({resolve(specifier,context,next){return next(entries.get(specifier)??specifier,context);}});
// 用户禁止批量/递归删除；包括上游异常清理路径也不准执行递归 rm。
const rm=fs.promises.rm;
fs.promises.rm=async(path,options)=>{
 if(options?.recursive)throw Error('H19 safety guard: recursive removal forbidden');
 return rm(path,options);
};
syncBuiltinESMExports();
