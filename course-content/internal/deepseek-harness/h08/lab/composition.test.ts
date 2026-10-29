import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compose, layers, reference, checkAnswer } from './compose.mjs';
import { reconfigure, anonymousComparison } from './reconfigure.ts';
import { fixture, entryById, diagnosis, officialProfiles } from './harness.ts';
import { applyEntryPatches } from '@deepseek-ai/cordis-plugin-include';
import { boot, recomposeProfile, composeEntries, loadOverlayPatches, loadOptionalPatches, loadProfileDirectory, readProfilePatches } from '@deepseek-ai/dsh-app-boot';

test('A 教学模拟器：五层计算符合独立答案，输入不变', () => {
  const original = structuredClone(layers), result = compose();
  assert.deepEqual(result.rows, reference.final);
  assert.deepEqual(result.trace.map(t => t.rows[0].config), reference.configs);
  assert.deepEqual(layers, original); checkAnswer(reference);
});
test('A 错误答案：深合并保留 temperature 必须拒绝', () => {
  const wrong = structuredClone(reference); wrong.final[0].config.temperature = 0.6;
  assert.throws(() => checkAnswer(wrong), /config 不是深度合并/);
});
test('A 官方 Patch 对照：manifest顺序及五个YAML文件与教学输入一致', async () => {
  const profile=JSON.parse(await readFile('a-profile.json','utf8'));
  const bundles=JSON.parse(await readFile('a-bundles.json','utf8'));
  assert.deepEqual(profile.dsh.profile.bundles,['course-core','course-surface']);
  assert.deepEqual(profile.dsh.profile.bundles.map((name: string)=>bundles[name].dsh.bundle.patch),['./core.patch.yml','./surface.patch.yml']);
  const lists = ['core.patch.yml','surface.patch.yml','profile.patch.yml','home.patch.yml','extra.yml']
    .map(name => loadOverlayPatches('h08', join(process.cwd(), name)));
  assert.deepEqual(lists, layers.map(l => l.patches));
  const result = composeEntries(lists);
  assert.deepEqual(result, reference.final);
});
test('官方 Patch：同一列表先 insert 再按 ID 覆盖，name 是保护条件', () => {
  const warnings: string[] = [];
  const rows = applyEntryPatches([], [{ insert: [{ id: 'x', name: 'correct', config: { a: 1, b: 2 } }] },
    { id: 'x', config: { b: 3 } }, { id: 'x', name: 'wrong', config: { a: 9 } }], m => warnings.push(m));
  assert.deepEqual(rows[0], { id: 'x', name: 'correct', config: { b: 3 } });
  assert.match(warnings.join(), /name mismatch/);
});
test('官方 Patch：组内插入、disable/enable与缺目标警告', () => {
  const warnings: string[] = [];
  const rows = applyEntryPatches([{ id: 'g', name: 'cordis:group', group: true, config: [] }], [
    { id: 'g', insert: [{ id: 'x', name: 'noop' }] }, { id: 'x', disabled: true }, { id: 'x', disabled: false },
    { id: 'missing', config: {} }, { id: 'x', insert: [] }, { config: {} }
  ], m => warnings.push(m));
  assert.equal(rows[0].config[0].disabled, false); assert.equal(warnings.length, 3);
});
test('官方 Patch：不会进入嵌套 Include 文件，带 group 的配置才递归索引', () => {
  const warnings: string[] = [];
  const rows = applyEntryPatches([{ id: 'file', name: 'cordis:include', config: { path: './child.yml' } }],
    [{ id: 'child', disabled: true }], m => warnings.push(m));
  assert.equal(warnings.length, 1); assert.deepEqual(rows[0].config, { path: './child.yml' });
});
test('B 真实 Cordis/Loader：两插件、稳定ID、配置更新、禁用和重新启用', async () => {
  const r = await reconfigure();
  assert.equal(r.runs, 3); assert.equal(r.cleanups, 2); assert.equal(r.stableUpdateSameFiber, true);
  assert.deepEqual(r.disabled, { providerState: 4, consumerState: 0, configPresent: true });
  assert.equal(r.reenableNewFiber, true); assert.equal(r.consumerSameFiber, true);
});
test('B 真实 Loader：稳定 ID 未改变条目不重挂', async () => {
  assert.deepEqual(await anonymousComparison(true), { stable: true, runs: 1, cleanups: 0, sameEntry: true, sameUid: true });
});
test('B 真实 Loader：缺失 ID 且重新解析新对象导致删除/新增', async () => {
  assert.deepEqual(await anonymousComparison(false), { stable: false, runs: 2, cleanups: 1, sameEntry: false, sameUid: false });
});
test('C 真实 App Boot：缺服务为 PENDING，应用后失败不自动恢复旧服务', async () => { await diagnosis(); });
test('C 真实 App Boot：必需 webserver 等待服务导致启动审查失败', async () => {
  const f = await fixture();
  await assert.rejects(boot('h08', f.root, [{ insert: [{ id: 'webserver', name: f.needs }] }]), /startup failed[\s\S]*h08Missing/);
});
test('C 真实 App Boot：可选模块缺失与缺服务分开报告，好兄弟仍运行', async () => {
  const f = await fixture(), ctx = await boot('h08', f.root, [{ insert: [
    { id: 'good', name: f.plugin, config: { value: 'ok' } }, { id: 'missing', name: './absent-course.mjs' }
  ] }]);
  try { assert.equal(ctx.get('h08Value'), 'ok'); assert.equal(entryById(ctx, 'missing').fiber, undefined); }
  finally { await ctx.fiber.dispose(); }
});
test('C 真实 Include：坏 YAML、空文件保留旧树；下次合法编辑生效', async () => {
  const f = await fixture(); await writeFile(f.root, JSON.stringify([{ id: 'good', name: f.plugin, config: { value: 'one' } }]));
  const ctx = await boot('h08', f.root), include = entryById(ctx, 'include').subtree;
  try {
    const before = entryById(ctx, 'good').fiber;
    for (const bad of ['invalid: [unclosed', '']) { await writeFile(f.root, bad); await include.refresh(); assert.equal(ctx.get('h08Value'), 'one'); assert.equal(entryById(ctx, 'good').fiber, before); }
    await writeFile(f.root, JSON.stringify([{ id: 'good', name: f.plugin, config: { value: 'two' } }]));
    await include.refresh(); await ctx.loader.await(); assert.equal(ctx.get('h08Value'), 'two');
  } finally { await ctx.fiber.dispose(); }
});
test('C 真实配置解析：可选文件不存在无层；显式 overlay 不存在抛错；非数组拒绝', async () => {
  const f = await fixture(); assert.equal(loadOptionalPatches('h08', join(f.dir, 'absent.yml')), undefined);
  assert.throws(() => loadOverlayPatches('h08', join(f.dir, 'absent.yml')), /failed to read overlay/);
  await writeFile(join(f.dir, 'bad.yml'), 'config: invalid');
  assert.throws(() => loadOptionalPatches('h08', join(f.dir, 'bad.yml')), /top-level YAML array/);
});
test('C 真实 Profile：五个官方模板完整解析，只读树；缺/不兼容 Bundle 被跳过', async () => {
  const report = await officialProfiles(process.env.HARNESS_SOURCE_CACHE!);
  await writeFile(process.env.H08_PROFILE_REPORT!, JSON.stringify(report, null, 2));
});
test('C 真实 Profile 四层与遥测硬禁用：CLI值胜出，0字符串也禁遥测', async () => {
  const f = await fixture(), home = join(f.dir, 'home'), dir = join(home, 'profiles/test');
  await mkdir(dir, { recursive: true }); await writeFile(join(dir, 'package.json'), '{"dsh":{"profile":{"bundles":[]}}}');
  const row = { id: 'x', name: f.plugin, config: { value: 'bundle' } };
  const initial = loadProfileDirectory('h08', dir, join(f.dir, 'installation.json'));
  initial.layers = [{ packageName: 'course-bundle', packageDir: dir, patchPaths: [], patches: [{ insert: [row, { id: 'session-telemetry-otel', name: 'noop', disabled: false }] }] }];
  initial.patches = [{ id: 'x', config: { value: 'profile' } }];
  await writeFile(join(home, 'cordis.patch.yml'), '- id: x\n  config: { value: home }\n');
  const patches = readProfilePatches('h08', { name: 'test', dir, patchPath: initial.patchPath, home, cwd: f.dir,
    installAnchor: join(f.dir, 'installation.json'), startedBundles: [], overlays: [{ id: 'x', config: { value: 'cli' } },
      { id: 'session-telemetry-otel', disabled: false }], telemetryDisabledEnv: '0' }, initial);
  const rows = composeEntries([patches]); assert.deepEqual(rows.find(r => r.id === 'x')!.config, { value: 'cli' });
  assert.equal(rows.find(r => r.id === 'session-telemetry-otel')!.disabled, true);
});
test('C 磁盘 Profile→有序 Bundle 文件→用户层→Home→overlay→真实 boot', async () => {
  const f = await fixture(), dir = join(f.dir, 'profiles/course'), bundle = join(f.dir, 'node_modules/course-bundle');
  await mkdir(dir, { recursive: true }); await mkdir(bundle, { recursive: true });
  const anchor = join(f.dir, 'package.json'); await writeFile(anchor, '{"name":"course-installation"}');
  await writeFile(join(bundle, 'package.json'), JSON.stringify({ name: 'course-bundle', dsh: { bundle: { patch: ['./one.yml', './two.yml'] } } }));
  await writeFile(join(bundle, 'one.yml'), JSON.stringify([{ insert: [{ id: 'good', name: f.plugin, config: { value: 'base', lost: 1 } }] }]));
  await writeFile(join(bundle, 'two.yml'), '- id: good\n  config: { value: bundle-second }\n');
  await writeFile(join(dir, 'package.json'), '{"dsh":{"profile":{"bundles":["course-bundle"]}}}');
  await writeFile(join(dir, 'cordis.patch.yml'), '- id: good\n  config: { value: profile }\n');
  await writeFile(join(f.dir, 'cordis.patch.yml'), '- id: good\n  config: { value: home }\n');
  const context = { name: 'course', dir, patchPath: join(dir, 'cordis.patch.yml'), home: f.dir, cwd: f.dir,
    installAnchor: anchor, startedBundles: ['course-bundle'], overlays: [{ id: 'good', config: { value: 'cli' } }], telemetryDisabledEnv: undefined };
  const profile = loadProfileDirectory('h08', dir, anchor); assert.equal(profile.layers.length, 1);
  assert.equal(profile.layers[0].patchPaths.length, 2);
  const patches = readProfilePatches('h08', context, profile), ctx = await boot('h08', f.root, patches);
  try {
    assert.deepEqual(entryById(ctx, 'good').options.config, { value: 'cli' }); assert.equal(ctx.get('h08Value'), 'cli');
    await writeFile(context.patchPath, '- id: good\n  config: { value: edited-profile }\n');
    await recomposeProfile(ctx, readProfilePatches('h08', { ...context, overlays: [], home: join(f.dir, 'empty-home') }), 'h08');
    assert.equal(ctx.get('h08Value'), 'edited-profile');
  } finally { await ctx.fiber.dispose(); }
});
test('C 错误 Profile patch 抛错；错误 Bundle patch 记入跳过', async () => {
  const f = await fixture(), bundle = join(f.dir, 'node_modules/course-bundle');
  await mkdir(bundle, { recursive: true });
  await writeFile(join(f.dir, 'package.json'), '{"dsh":{"profile":{"bundles":["course-bundle"]}}}');
  await writeFile(join(bundle, 'package.json'), '{"dsh":{"bundle":{"patch":"./bad.yml"}}}');
  await writeFile(join(bundle, 'bad.yml'), 'not: a-list');
  assert.equal(loadProfileDirectory('h08', f.dir, join(f.dir, 'anchor.json')).skippedBundles.length, 1);
  await writeFile(join(f.dir, 'cordis.patch.yml'), 'not: a-list');
  assert.throws(() => loadProfileDirectory('h08', f.dir, join(f.dir, 'anchor.json')), /top-level YAML array/);
});
test('C Schema 拒绝：raw 配置已变，运行 effective 配置仍为旧值', async () => {
  const f = await fixture();
  const schema = join(f.dir, 'schema.mjs');
  await writeFile(schema, `export const Config={'~standard':{version:1,vendor:'course',validate(c){
    return typeof c.value==='number'?{value:c}:{issues:[{message:'expected number'}]};
  }}}; export function apply(ctx,c){ctx.provide('h08Value',c.value);}`);
  const rows = (value: any) => [{ insert: [{ id: 'good', name: pathToFileURL(schema).href, config: { value } }] }];
  const ctx = await boot('h08', f.root, rows(1));
  try {
    await recomposeProfile(ctx, rows('invalid'), 'h08');
    const e = entryById(ctx, 'good'); assert.deepEqual(e.options.config, { value: 'invalid' });
    assert.deepEqual(e.fiber.effectiveConfig, { value: 1 }); assert.equal(ctx.get('h08Value'), 1);
  } finally { await ctx.fiber.dispose(); }
});
test('C recompose 显式 requiredIds 将新 PENDING 视为失败；应用后条目保留', async () => {
  const f = await fixture(), ctx = await boot('h08', f.root);
  try {
    await assert.rejects(recomposeProfile(ctx, [{ insert: [{ id: 'needs', name: f.needs }] }], 'h08', { requiredIds: ['needs'] }), /h08Missing/);
    assert.equal(entryById(ctx, 'needs').fiber.state, 0);
  } finally { await ctx.fiber.dispose(); }
});
