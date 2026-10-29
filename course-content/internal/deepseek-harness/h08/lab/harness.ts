// 真实 App Boot / Profile helper；所有写入仅在新 OS 临时目录。
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, copyFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { boot, recomposeProfile, loadProfileDirectory, readProfilePatches, composeEntries } from '@deepseek-ai/dsh-app-boot';
import { PROFILE_TEMPLATES } from '@deepseek-ai/dsh-official-bundles';

export async function fixture() {
  const dir = await mkdtemp(join(tmpdir(), 'aifoundry-h08-boot-'));
  const root = join(dir, 'cordis.yml'); await writeFile(root, '[]\n');
  const plugin = join(dir, 'probe.mjs');
  await writeFile(plugin, `export function apply(ctx, config) {
    if (config?.fail) throw Error('COURSE_APPLY_FAILURE');
    ctx.provide('h08Value', config?.value ?? 'unset');
  }\n`);
  const needs = join(dir, 'needs.mjs');
  await writeFile(needs, "export const inject=['h08Missing']; export function apply(ctx) { ctx.provide('h08Consumer', true); }\n");
  return { dir, root, plugin: pathToFileURL(plugin).href, needs: pathToFileURL(needs).href };
}
export const entryById = (ctx: any, id: string) => [...ctx.loader.entries()].find((entry: any) => entry.options.id === id) as any;

export async function diagnosis() {
  const f = await fixture();
  const patches = [{ insert: [{ id: 'good', name: f.plugin, config: { value: 'v1' } }, { id: 'optional-needs', name: f.needs }] }];
  const ctx = await boot('h08', f.root, patches);
  try {
    const pending = entryById(ctx, 'optional-needs');
    assert.equal(pending.fiber.state, 0); assert.equal(ctx.get('h08Consumer'), undefined);
    assert.equal(entryById(ctx, 'good').fiber.state, 2);
    const before = entryById(ctx, 'good').fiber;
    await assert.rejects(recomposeProfile(ctx, [{ insert: [
      { id: 'good', name: f.plugin, config: { value: 'v2', fail: true } },
      { id: 'optional-needs', name: f.needs }
    ] }], 'h08'), /COURSE_APPLY_FAILURE/);
    assert.deepEqual(entryById(ctx, 'good').options.config, { value: 'v2', fail: true });
    assert.equal(entryById(ctx, 'good').fiber.state, 3);
    assert.equal(ctx.get('h08Value'), undefined, '应用后的失败没有自动恢复 v1 服务');
    await recomposeProfile(ctx, patches, 'h08');
    assert.equal(ctx.get('h08Value'), 'v1');
    return { directory: f.dir, missingService: 'PENDING, sibling ACTIVE',
      applyFailure: 'FAILED; new config retained; old service absent',
      recovered: ctx.get('h08Value'), priorFiberReusedForOrdinaryUpdate: entryById(ctx, 'good').fiber === before };
  } finally { await ctx.fiber.dispose(); }
}

export async function officialProfiles(source: string) {
  const dir = await mkdtemp(join(tmpdir(), 'aifoundry-h08-profiles-'));
  const install = join(dir, 'installation'), home = join(dir, 'home');
  await mkdir(install); await mkdir(home);
  const anchor = join(install, 'package.json'); await writeFile(anchor, '{"name":"course-installation","version":"1.0.0"}');
  // 只复制官方 manifest 和 YAML 字节；不安装或激活其中的业务插件。
  for (const bundle of ['base', 'web-app', 'headless', 'sdk-app', 'sdk-minimal', 'acp-app']) {
    const from = join(source, 'packages/bundle', bundle);
    const meta = JSON.parse(await readFile(join(from, 'package.json'), 'utf8'));
    const to = join(install, 'node_modules', meta.name);
    for (const relative of await readdir(from, { recursive: true })) {
      if (relative !== 'package.json' && !/\.ya?ml$/.test(relative)) continue;
      const target = join(to, relative); await mkdir(dirname(target), { recursive: true });
      await copyFile(join(from, relative), target);
    }
  }
  const results: any = {};
  for (const [name, template] of Object.entries(PROFILE_TEMPLATES)) {
    const profileDir = join(home, 'profiles', name); await mkdir(profileDir, { recursive: true });
    await writeFile(join(profileDir, 'package.json'), JSON.stringify({ dsh: { profile: template } }));
    await writeFile(join(profileDir, 'cordis.patch.yml'), '[]\n');
    const profile = loadProfileDirectory('h08', profileDir, anchor);
    assert.equal(profile.skippedBundles.length, 0);
    const patches = readProfilePatches('h08', { name, dir: profileDir, patchPath: profile.patchPath,
      installAnchor: anchor, cwd: dir, home, startedBundles: template.bundles, overlays: [], telemetryDisabledEnv: undefined }, profile);
    const warnings: string[] = [], rows = composeEntries([patches], message => warnings.push(message));
    assert.equal(warnings.length, 0);
    results[name] = { bundles: [...template.bundles], patchFiles: profile.layers.flatMap(layer => layer.patchPaths), rows };
  }
  const headless = results.headless.rows;
  assert.equal(headless.find((r: any) => r.id === 'hmr').disabled, true);
  assert.ok(headless.some((r: any) => r.id === 'headless-runner'));
  assert.ok(!headless.some((r: any) => r.id === 'webserver'));
  assert.deepEqual(results['sdk-minimal'].bundles, ['@deepseek-ai/dsh-sdk-minimal']);
  assert.ok(!results['sdk-minimal'].rows.some((r: any) => r.id === 'hmr'));
  const userLayers = [
    ...loadProfileDirectory('h08', join(home, 'profiles/headless'), anchor).layers.map(layer => layer.patches),
    [{ id: 'session-title', config: { maxTitleBytes: 120 } }]
  ];
  const patched = composeEntries(userLayers as any).find(r => r.id === 'session-title');
  assert.deepEqual(patched!.config, { maxTitleBytes: 120 });
  // 缺包与版本不兼容：读取层记录跳过，不能谎报为同一种插件 apply 错误。
  const badBundle = join(install, 'node_modules/course-incompatible'); await mkdir(badBundle, { recursive: true });
  await writeFile(join(badBundle, 'package.json'), JSON.stringify({ name: 'course-incompatible', version: '1.0.0', engines: { dsh: '>=99.0.0' }, dsh: { bundle: { patch: './cordis.patch.yml' } } }));
  const broken = join(home, 'profiles/broken'); await mkdir(broken);
  await writeFile(join(broken, 'package.json'), JSON.stringify({ dsh: { profile: { bundles: ['course-missing', 'course-incompatible'] } } }));
  const failed = loadProfileDirectory('h08', broken, anchor);
  assert.equal(failed.layers.length, 0); assert.equal(failed.skippedBundles.length, 2);
  assert.match(failed.skippedBundles[0].reason, /cannot resolve profile bundle/);
  assert.match(failed.skippedBundles[1].reason, /incompatible/);
  return { dir, profiles: results, skippedBundles: failed.skippedBundles, userPatchedTitle: patched };
}
