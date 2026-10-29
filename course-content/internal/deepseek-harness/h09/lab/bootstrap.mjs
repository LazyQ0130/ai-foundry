// Node 24 同步解析 hook：只复用已隔离安装的锁定上游依赖。
import { registerHooks, createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(pathToFileURL(process.env.H09_DEPS_ANCHOR));
const names = ['js-yaml', '@eslint-community/regexpp', 'ajv', 'node-addon-require-builtin', 'resolve.exports', 'semver'];
const zodRequire = createRequire(pathToFileURL(process.env.H09_ZOD_ANCHOR));
const entries = new Map(names.map(name => [name, pathToFileURL(require.resolve(name)).href]));
entries.set('zod', pathToFileURL(zodRequire.resolve('zod')).href);
registerHooks({ resolve(specifier, context, next) { return next(entries.get(specifier) ?? specifier, context); } });
