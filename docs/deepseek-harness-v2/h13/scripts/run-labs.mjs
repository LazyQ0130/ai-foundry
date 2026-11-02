import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, readdir, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url)), repo = resolve(root, '../../..');
const lock = JSON.parse(await readFile(resolve(root, 'evidence/source-lock.json'), 'utf8'));
const source = process.env.HARNESS_SOURCE_CACHE ?? lock.sourceCache;
for (const f of lock.files) assert.equal(createHash('sha256').update(await readFile(resolve(source, f.path))).digest('hex'), f.sha256, f.path);
const scratch = await mkdtemp(resolve(tmpdir(), 'aifoundry-h13-lab-'));
const lab = resolve(repo, 'course-content/internal/deepseek-harness/h13/lab');
for (const f of await readdir(lab)) await copyFile(resolve(lab, f), resolve(scratch, f));
await writeFile(resolve(scratch, 'package.json'), '{"private":true,"type":"module"}\n');
// 上游 tsconfig 含注释时由 tsx 读取原文件；使用 extends，不解析重写上游。
await writeFile(resolve(scratch, 'tsconfig.json'), JSON.stringify({ extends: resolve(source, 'tsconfig.base.json') }));
const dependency = JSON.parse(await readFile(resolve(repo, 'docs/deepseek-harness-v2/h04/evidence/probe-dependencies.json'), 'utf8'));
const anchor = process.env.H13_DEPS_ANCHOR ?? 'C:/Users/QYF/.codex/research/h04-probe-deps/node_modules/commander/index.js';
const installed = JSON.parse(await readFile(resolve(anchor, '../../../package-lock.json'), 'utf8'));
for (const p of dependency.packages) { assert.equal(installed.packages[`node_modules/${p.name}`]?.version, p.version); assert.equal(installed.packages[`node_modules/${p.name}`]?.integrity, p.integrity); }
const zodAnchor = process.env.H13_ZOD_ANCHOR ?? 'C:/Users/QYF/.codex/research/h09-probe-deps/node_modules/zod/index.js';
assert.equal(JSON.parse(await readFile(resolve(zodAnchor, '../package.json'), 'utf8')).version, '4.4.3');
const zodLock = JSON.parse(await readFile(resolve(zodAnchor, '../../../package-lock.json'), 'utf8'));
const zodPackage = zodLock.packages['node_modules/zod'];
assert.ok((await readFile(resolve(source,'pnpm-lock.yaml'),'utf8')).includes(zodPackage.integrity));
await writeFile(resolve(root,'evidence/zod-dependency.json'), JSON.stringify(zodPackage,null,2)+'\n');
const env = Object.fromEntries(['SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'PATH', 'PATHEXT'].filter(k => process.env[k] !== undefined).map(k => [k, process.env[k]]));
Object.assign(env, { HARNESS_SOURCE_CACHE: source, H13_DEPS_ANCHOR: anchor, H13_ZOD_ANCHOR: zodAnchor, DSH_HOME: resolve(scratch, 'fixture-home'),
  H13_FIXTURE_ONLY: 'true' });
const run = args => spawnSync(process.execPath, [resolve(repo, 'node_modules/tsx/dist/cli.mjs'), '--tsconfig', resolve(scratch, 'tsconfig.json'),
  '--import', pathToFileURL(resolve(scratch, 'bootstrap.mjs')).href, ...args], { cwd: scratch, env, encoding: 'utf8', timeout: 60000 });
// 仅规范化行尾空白；JSON结果仍保存原始stdout/stderr、退出值和诊断。
const cleanEvidence = value => value.replaceAll('\r\n', '\n').replace(/[ \t]+$/gm, '').trimEnd() + '\n';
const results = {};
const programHashes = await Promise.all((await readdir(lab)).map(async name => ({ name, sha256: createHash('sha256').update(await readFile(resolve(lab,name))).digest('hex') })));
for (const [name, args] of [['tests', ['--test', '--test-reporter=tap', 'registry.test.ts']], ['demo', ['demo.ts']]]) {
  const r = run(args); results[name] = { exit: r.status, stdout: r.stdout, stderr: r.stderr };
  await writeFile(resolve(root, `evidence/lab-${name}.txt`), cleanEvidence(r.stdout + r.stderr));
  await writeFile(resolve(root, `evidence/run-${Date.now()}-${name}.json`), JSON.stringify({args, scratch, programs: programHashes, ...results[name]},null,2)+'\n');
  assert.equal(r.status, 0, `${name}: see evidence/lab-${name}.txt and timestamp raw run JSON`);
}
const output = Object.fromEntries(results.demo.stdout.trim().split('\n').map(line => {const i=line.indexOf(' '); return [line.slice(0,i),JSON.parse(line.slice(i+1))];}));
await writeFile(resolve(root,'evidence/practice-output.json'),JSON.stringify(output,null,2)+'\n');
// 错误答案把旧准入当永久许可，必须非零；不修改官方实现。
const wrong = run(['negative-answer.ts']);
await writeFile(resolve(root, 'evidence/lab-mutation.txt'), cleanEvidence(wrong.stdout + wrong.stderr));
await writeFile(resolve(root,`evidence/run-${Date.now()}-mutation.json`),JSON.stringify({args:['negative-answer.ts'],scratch,programs:programHashes,exit:wrong.status,stdout:wrong.stdout,stderr:wrong.stderr},null,2)+'\n');
assert.notEqual(wrong.status, 0);
const count = Number(/# tests (\d+)/.exec(results.tests.stdout)?.[1]);
assert.equal(count,37); assert.match(results.tests.stdout, /# fail 0/);
const report = { status: 'PASS', commit: lock.commit, node: process.version, scratch, sourceFilesChecked: lock.files.length,
  tests: count, mutation: { exit: wrong.status, status: 'EXPECTED_FAILURE' }, results,
  levels: { A: 'NOT_RUN standalone; controlled models and arithmetic bodies are fixtures in C/D', B: 'NOT_RUN standalone; real Cordis inside C/D, not counted twice', C: '31 tests C01–C31; actual ToolsService/defineTool/Scope/Native pipeline components', D: '6 tests D01–D06; real ToolsService + SystemPrompt + AgentLoop + in-memory Session + Mock Adapter + Native executor', E: 'NOT_RUN' },
  isolation: 'Only new OS fixture directories, allowlisted environment, no model/network/private Home; retained without cleanup',
  dependencies: { anchor, packages: dependency.packages },
  programs: await Promise.all((await readdir(lab)).map(async name => ({ name, sha256: createHash('sha256').update(await readFile(resolve(lab, name))).digest('hex') }))) };
await writeFile(resolve(root, 'evidence/lab-results.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: 'PASS', tests: count, mutation: 'EXPECTED_FAILURE', scratch }));
