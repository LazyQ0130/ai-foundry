// H04 教学简化：只模拟指定参数、完整 config 替换和固定表达式。
// 不加载 Harness、不读真实 Home/.env/凭据、不启动服务器、工具、模型或子进程。
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const BASE = '@deepseek-ai/dsh-base';
export const profiles = {
  web: { bundles: [BASE, '@deepseek-ai/dsh-web-app'], app: 'packages/bundle/web-app/src/startup.ts', transport: 'browser-http', lifetime: 'service', hmr: true },
  headless: { bundles: [BASE, '@deepseek-ai/dsh-headless'], app: 'packages/bundle/headless/src/startup.ts', transport: 'task-stdout', lifetime: 'one-shot', hmr: false },
  sdk: { bundles: [BASE, '@deepseek-ai/dsh-sdk-app'], app: 'packages/bundle/sdk-app/src/index.ts', transport: 'sdk-jsonrpc-stdio', lifetime: 'client', hmr: false },
  'sdk-minimal': { bundles: ['@deepseek-ai/dsh-sdk-minimal'], app: 'packages/bundle/sdk-app/src/index.ts', transport: 'sdk-jsonrpc-stdio', lifetime: 'client', hmr: false },
  acp: { bundles: [BASE, '@deepseek-ai/dsh-acp-app'], app: 'packages/bundle/acp-app/src/index.ts', transport: 'acp-jsonrpc-stdio', lifetime: 'client', hmr: false }
};
export const casesA = { browser: 'web', once: 'headless', python: 'sdk', editor: 'acp', explicitMinimal: 'sdk-minimal' };
const fail = message => { throw new Error(message); };

export function parseLauncher(argv) {
  // 仅覆盖本课语法；不实现 Commander、plugin、reset、schema dump 或所有 -- 规则。
  const tokens = [...argv];
  if (tokens[0] && !tokens[0].startsWith('-')) tokens.unshift('--profile');
  let profile, mode = 'profile'; const patches = [];
  const value = flag => {
    const v = tokens.shift();
    if (!v || v.startsWith('--')) fail(`${flag} 缺少值`);
    return v;
  };
  while (tokens.length) {
    const t = tokens[0];
    if (t === '--profile') { tokens.shift(); if (profile !== undefined) fail('重复 Profile'); profile = value(t); }
    else if (t === '--patch') { tokens.shift(); patches.push(value(t)); }
    else if (t === '--dump-config' || t === '--dump-default-config') {
      tokens.shift(); if (mode !== 'profile') fail('dump 互斥'); mode = t.slice(2);
    } else break;
  }
  if (!profile) fail('缺少 Profile');
  if (profile.toLowerCase() === 'desktop') fail('desktop 由 Electron 管理');
  if (mode !== 'profile' && tokens.length) fail('dump 不接受应用参数');
  if (mode === 'dump-default-config' && patches.length) fail('默认 dump 不接受 --patch');
  return { profile, mode, patches, appArgs: tokens };
}
export function profileDir(home, name) {
  if (['', '.', '..', 'node_modules'].includes(name) || /[\\/]/.test(name)) fail('非法 Profile 名称');
  return `${home}/profiles/${name}`; // 虚拟 POSIX 路径，不访问磁盘。
}
export function selectEnv(processLayer, project, home) {
  // 只实现本课示例名；完整 bootstrap 清单与平台大小写差异见官方源码。
  for (const [source, layer] of [['project-env', project], ['user-env', home]]) {
    for (const key of Object.keys(layer)) {
      const upper = key.toUpperCase();
      const proxy = ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY'].includes(upper);
      const restricted = /^(DSH_|XDG_|DYLD_|BASH_FUNC_)/.test(upper) || ['PATH', 'HOME', 'NODE_OPTIONS', 'DEEPSEEK_BASE_URL', 'NODE_TLS_REJECT_UNAUTHORIZED'].includes(upper) || proxy;
      if (restricted && !(source === 'user-env' && proxy)) fail(`${source} 禁止设置 ${key}`);
    }
  }
  const result = {};
  for (const [source, layer] of [['process', processLayer], ['project-env', project], ['user-env', home]]) {
    for (const [key, value] of Object.entries(layer)) if (!(key in result)) result[key] = { value, source };
  }
  return result;
}
const expression = port => `!!js ctx.webStartup.port ?? ${port}`;
const webConfig = port => ({ host: '127.0.0.1', port: expression(port) });
export function fixture() {
  return {
    argv: ['--profile', 'web', '--patch', './extra.yml', '--port', '8080'],
    process: { DSH_HOME: '/fixture/home', COURSE_THEME: 'night' },
    projectEnv: { COURSE_THEME: 'day' }, homeEnv: { COURSE_THEME: 'mint' },
    layers: [
      { label: 'bundle:base', patches: [{ insert: [{ id: 'shared', name: 'course-shared' }] }] },
      { label: 'bundle:web-app', patches: [{ insert: [{ id: 'webserver', name: 'course-webserver', config: webConfig(3080) }] }] },
      { label: 'profile', patches: [{ id: 'webserver', config: webConfig(4100) }] },
      { label: 'home', patches: [{ id: 'webserver', config: webConfig(4200) }] },
      { label: './extra.yml', patches: [{ id: 'webserver', config: webConfig(4300) }] }
    ]
  };
}
export function compose(layers) {
  const rows = [], warnings = [];
  for (const layer of layers) for (const patch of layer.patches) {
    if (patch.insert) { for (const row of patch.insert) rows.push(structuredClone(row)); continue; }
    const row = rows.find(r => r.id === patch.id);
    if (!row) { warnings.push(`缺少目标 ${patch.id}`); continue; }
    // 这里仅模拟匹配 id 的 config 整体替换，不是通用 Patch 实现。
    if (patch.config !== undefined) row.config = structuredClone(patch.config);
  }
  return { rows, warnings };
}
export function traceLaunch(input = fixture()) {
  const invocation = parseLauncher(input.argv);
  const home = input.process.DSH_HOME?.trim() || '/fixture/default-home';
  const dir = profileDir(home, invocation.profile);
  // 正常启动先加载环境；dump 分支不调用 loadLayeredEnv，也不解析应用参数。
  const env = invocation.mode === 'profile' ? selectEnv(input.process, input.projectEnv, input.homeEnv) : undefined;
  if (!profiles[invocation.profile]) fail('未安装的自定义 Profile');
  if (invocation.profile !== 'web') fail('追踪夹具只模拟 Web；A 的其他 Profile 用事实表定位');
  const chosen = input.layers.filter(l => l.label.startsWith('bundle:') || (invocation.mode !== 'dump-default-config' && (['profile', 'home'].includes(l.label) || invocation.patches.includes(l.label))));
  const result = compose(chosen), server = result.rows.find(r => r.id === 'webserver');
  if (!server) fail('缺少必需的 Web 配置行');
  if (invocation.mode !== 'profile') return { mode: invocation.mode, profileDir: dir, layerOrder: chosen.map(l => l.label), unevaluatedPort: server.config.port, appStarted: false };
  let appPort;
  for (let i = 0; i < invocation.appArgs.length; i++) {
    if (invocation.appArgs[i] !== '--port') fail(`Web 不认识 ${invocation.appArgs[i]}`);
    const port = invocation.appArgs[++i];
    if (!port || !/^\d+$/.test(port)) fail('Web 端口必须是数字');
    appPort = Number(port);
  }
  const p = server.config.port, match = typeof p === 'string' ? /^!!js ctx\.webStartup\.port \?\? (\d+)$/.exec(p) : null;
  if (typeof p !== 'number' && !match) fail('夹具不执行任意表达式');
  const port = match ? (appPort ?? Number(match[1])) : p;
  return { selectedProfile: invocation.profile, profileDir: dir, launcherPatches: invocation.patches, appArgs: invocation.appArgs, themeSource: env.COURSE_THEME?.source, port, layerOrder: chosen.map(l => l.label) };
}
export const reference = {
  A: Object.fromEntries(Object.entries(casesA).map(([id, name]) => [id, { profile: name, entry: 'apps/cli/src/bin.ts', app: profiles[name].app, bundles: profiles[name].bundles }])),
  B: { selectedProfile: 'web', profileDir: '/fixture/home/profiles/web', launcherPatches: ['./extra.yml'], appArgs: ['--port', '8080'], themeSource: 'process', port: 8080, layerOrder: ['bundle:base', 'bundle:web-app', 'profile', 'home', './extra.yml'] }
};
export function checkAnswer(answer) { assert.deepEqual(answer, reference, '请逐字段对照 A 事实与 B 追踪；理由需要自己解释'); return true; }
export function selfTest() {
  assert.deepEqual(traceLaunch(), reference.B);
  const late = fixture(); late.argv = ['web', '--port', '8080', '--patch', './extra.yml'];
  assert.deepEqual(parseLauncher(late.argv).patches, []); assert.throws(() => traceLaunch(late), /Web 不认识/);
  const bad = fixture(); bad.projectEnv.DSH_HOME = '/fixture/other'; assert.throws(() => traceLaunch(bad), /禁止设置/);
  assert.equal(profiles['sdk-minimal'].bundles.includes(BASE), false);
  console.log('PASS：Profile 定位与启动规则教学自检；不是完整 Harness 启动');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === '--self-test') selfTest();
  else if (process.argv[2] === '--trace') console.log(JSON.stringify(traceLaunch(), null, 2));
  else { checkAnswer(JSON.parse(await readFile('answer.json', 'utf8'))); console.log('PASS：A 五场景事实 + B 配置追踪；请另行解释理由'); }
}
