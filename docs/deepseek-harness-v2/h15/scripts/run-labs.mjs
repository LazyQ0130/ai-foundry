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
const scratch = await mkdtemp(resolve(tmpdir(), 'aifoundry-h15-lab-'));
const lab = resolve(repo, 'course-content/internal/deepseek-harness/h15/lab');
for (const f of await readdir(lab)) await copyFile(resolve(lab, f), resolve(scratch, f));
await writeFile(resolve(scratch, 'package.json'), '{"private":true,"type":"module"}\n');
// 上游 tsconfig 含注释时由 tsx 读取原文件；使用 extends，不解析重写上游。
await writeFile(resolve(scratch, 'tsconfig.json'), JSON.stringify({ extends: resolve(source, 'tsconfig.base.json') }));
const dependency = JSON.parse(await readFile(resolve(repo, 'docs/deepseek-harness-v2/h04/evidence/probe-dependencies.json'), 'utf8'));
const anchor = process.env.H15_DEPS_ANCHOR ?? 'C:/Users/QYF/.codex/research/h04-probe-deps/node_modules/commander/index.js';
const installed = JSON.parse(await readFile(resolve(anchor, '../../../package-lock.json'), 'utf8'));
for (const p of dependency.packages) { assert.equal(installed.packages[`node_modules/${p.name}`]?.version, p.version); assert.equal(installed.packages[`node_modules/${p.name}`]?.integrity, p.integrity); }
const zodAnchor = process.env.H15_ZOD_ANCHOR ?? 'C:/Users/QYF/.codex/research/h09-probe-deps/node_modules/zod/index.js';
assert.equal(JSON.parse(await readFile(resolve(zodAnchor, '../package.json'), 'utf8')).version, '4.4.3');
const zodLock = JSON.parse(await readFile(resolve(zodAnchor, '../../../package-lock.json'), 'utf8'));
const zodPackage = zodLock.packages['node_modules/zod'];
assert.ok((await readFile(resolve(source,'pnpm-lock.yaml'),'utf8')).includes(zodPackage.integrity));
await writeFile(resolve(root,'evidence/zod-dependency.json'), JSON.stringify(zodPackage,null,2)+'\n');
const fsAnchor=process.env.H15_FS_DEPS_ANCHOR??'C:/Users/QYF/.codex/research/h15-probe-deps/node_modules/chokidar/index.js';
const fsLock=JSON.parse(await readFile(resolve(fsAnchor,'../../../package-lock.json'),'utf8'));
const upstreamLock=await readFile(resolve(source,'pnpm-lock.yaml'),'utf8');
for(const [name,version] of [['chokidar','5.0.0'],['koffi','3.1.1'],['yaml','2.9.0']]){
 const pkg=fsLock.packages['node_modules/'+name];assert.equal(pkg.version,version);assert.ok(upstreamLock.includes(pkg.integrity),name);
}
await writeFile(resolve(root,'evidence/fs-dependencies.json'),JSON.stringify(fsLock,null,2)+'\n');
const env = Object.fromEntries(['SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'PATH', 'PATHEXT'].filter(k => process.env[k] !== undefined).map(k => [k, process.env[k]]));
Object.assign(env, { HARNESS_SOURCE_CACHE: source, H15_DEPS_ANCHOR: anchor, H15_ZOD_ANCHOR: zodAnchor, H15_FS_DEPS_ANCHOR:fsAnchor, DSH_HOME: resolve(scratch, 'fixture-home'),
  H15_FIXTURE_ONLY: 'true' });
const run = args => spawnSync(process.execPath, [resolve(repo, 'node_modules/tsx/dist/cli.mjs'), '--tsconfig', resolve(scratch, 'tsconfig.json'),
  '--import', pathToFileURL(resolve(scratch, 'bootstrap.mjs')).href, ...args], { cwd: scratch, env, encoding: 'utf8', timeout: 60000 });
// 仅规范化行尾空白；JSON结果仍保存原始stdout/stderr、退出值和诊断。
const cleanEvidence = value => value.replaceAll('\r\n', '\n').replace(/[ \t]+$/gm, '').trimEnd() + '\n';
const results = {};
const programHashes = await Promise.all((await readdir(lab)).map(async name => ({ name, sha256: createHash('sha256').update(await readFile(resolve(lab,name))).digest('hex') })));
for (const [name, args] of [['tests', ['--test', '--test-reporter=tap', 'safety.test.ts']], ['demo', ['demo.ts']]]) {
  const r = run(args); results[name] = { exit: r.status, stdout: r.stdout, stderr: r.stderr };
  await writeFile(resolve(root, `evidence/lab-${name}.txt`), cleanEvidence(r.stdout + r.stderr));
  await writeFile(resolve(root, `evidence/run-${Date.now()}-${name}.json`), JSON.stringify({args, scratch, programs: programHashes, ...results[name]},null,2)+'\n');
  assert.equal(r.status, 0, `${name}: see evidence/lab-${name}.txt and timestamp raw run JSON`);
}
const output = Object.fromEntries(results.demo.stdout.trim().split('\n').map(line => {const i=line.indexOf(' '); return [line.slice(0,i),JSON.parse(line.slice(i+1))];}));
await writeFile(resolve(root,'evidence/practice-output.json'),JSON.stringify(output,null,2)+'\n');
// 错误答案声称批准可绕过guard，必须非零；不修改官方实现。
const wrong = run(['negative-answer.ts']);
await writeFile(resolve(root, 'evidence/lab-mutation.txt'), cleanEvidence(wrong.stdout + wrong.stderr));
await writeFile(resolve(root,`evidence/run-${Date.now()}-mutation.json`),JSON.stringify({args:['negative-answer.ts'],scratch,programs:programHashes,exit:wrong.status,stdout:wrong.stdout,stderr:wrong.stderr},null,2)+'\n');
assert.notEqual(wrong.status, 0);
const count = Number(/# tests (\d+)/.exec(results.tests.stdout)?.[1]);
assert.equal(count,31); assert.match(results.tests.stdout, /# fail 0/);
const report = { status: 'PASS', commit: lock.commit, node: process.version, scratch, sourceFilesChecked: lock.files.length,
  tests: count, mutation: { exit: wrong.status, status: 'EXPECTED_FAILURE' }, results,
  levels: { A: 'NOT_RUN standalone; controlled answerers are explicit test doubles', B: 'NOT_RUN standalone; real Cordis dependency not double-counted', C: '18 actual ApprovalService component tests with real Session/projections; structural Agent carrier', D: '13 local combination tests: 11 Tools/Native/Pipeline/Approval/Session + 1 Policy/Approval/Session/provider-selection + 1 fs-sandbox/local/observation/Session; provider probes simulated', E: 'NOT_RUN; no full app or native process runner' },
  isolation: 'New OS fixture directories only; allowlisted env; no model/network/private Home/Shell; explicit single-file cleanup, empty dirs retained; native Windows file publication is not native ACL process sandbox',
  dependencies: { anchor, packages: dependency.packages },
  programs: await Promise.all((await readdir(lab)).map(async name => ({ name, sha256: createHash('sha256').update(await readFile(resolve(lab, name))).digest('hex') }))) };
await writeFile(resolve(root, 'evidence/lab-results.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: 'PASS', tests: count, mutation: 'EXPECTED_FAILURE', scratch }));
