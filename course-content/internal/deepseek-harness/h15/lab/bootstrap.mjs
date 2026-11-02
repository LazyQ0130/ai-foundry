// Node 24：解析到隔离安装、与固定上游锁文件核对过的依赖。
import { registerHooks, createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const req = createRequire(pathToFileURL(process.env.H15_DEPS_ANCHOR));
const extra = createRequire(pathToFileURL(process.env.H15_FS_DEPS_ANCHOR));
const zod = createRequire(pathToFileURL(process.env.H15_ZOD_ANCHOR));
const names=['js-yaml','@eslint-community/regexpp','ajv','node-addon-require-builtin','resolve.exports','semver'];
const entries=new Map(names.map(n=>[n,pathToFileURL(req.resolve(n)).href]));
for(const n of ['chokidar','koffi','yaml'])entries.set(n,pathToFileURL(extra.resolve(n)).href);
entries.set('zod',pathToFileURL(zod.resolve('zod')).href);
registerHooks({resolve(s,c,next){return next(entries.get(s)??s,c);}});
