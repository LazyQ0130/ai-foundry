import { registerHooks,createRequire } from 'node:module';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const base=createRequire(pathToFileURL(process.env.H16_DEPS_ANCHOR));
const fsDeps=createRequire(pathToFileURL(process.env.H16_FS_DEPS_ANCHOR));
const extra=createRequire(pathToFileURL(process.env.H16_ECO_DEPS_ANCHOR));
const names=new Map(['js-yaml','@eslint-community/regexpp','ajv','node-addon-require-builtin','resolve.exports','semver'].map(n=>[n,pathToFileURL(base.resolve(n)).href]));
for(const n of ['chokidar','koffi','yaml'])names.set(n,pathToFileURL(fsDeps.resolve(n)).href);
for(const n of ['zod','turndown','@joplin/turndown-plugin-gfm','diff'])names.set(n,pathToFileURL(extra.resolve(n)).href);
for(const n of ['@modelcontextprotocol/client','@modelcontextprotocol/client/stdio','@modelcontextprotocol/server','@modelcontextprotocol/server/stdio'])names.set(n,pathToFileURL(extra.resolve(n)).href);
for(const [name,path] of [['@deepseek-ai/dsh-web-fetch-http/src/policy.ts','packages/web/web-fetch-http/src/policy.ts'],['@deepseek-ai/dsh-tool-fs/src/read.ts','packages/fs/tool-fs/src/read.ts'],['@deepseek-ai/dsh-mcp-client/src/tools.ts','packages/mcp/mcp-client/src/tools.ts']])names.set(name,pathToFileURL(resolve(process.env.HARNESS_SOURCE_CACHE,path)).href);
registerHooks({resolve(s,c,next){
 return next(names.get(s)??s,c);
}});
