// Node 24；隔离依赖完整树由 run-labs.mjs 在运行前核对固定上游 lock。
import { registerHooks, createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const dep = createRequire(pathToFileURL(process.env.H17_DEPS_ANCHOR));
const zod = createRequire(pathToFileURL(process.env.H17_ZOD_ANCHOR));
const entries = new Map(['js-yaml','@eslint-community/regexpp','ajv','node-addon-require-builtin','resolve.exports','semver']
  .map(name => [name,pathToFileURL(dep.resolve(name)).href]));
entries.set('zod',pathToFileURL(zod.resolve('zod')).href);
registerHooks({resolve(specifier,context,next){return next(entries.get(specifier)??specifier,context);}});
