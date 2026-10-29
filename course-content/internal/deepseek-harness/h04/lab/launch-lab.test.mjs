import test from 'node:test';
import assert from 'node:assert/strict';
import { profiles, reference, fixture, parseLauncher, profileDir, selectEnv, compose, traceLaunch, checkAnswer } from './launch-lab.mjs';
test('五 Profile 的固定组合、通信和生命周期；minimal 不含 base', () => {
  assert.deepEqual(Object.keys(profiles), ['web', 'headless', 'sdk', 'sdk-minimal', 'acp']);
  assert.deepEqual(profiles['sdk-minimal'].bundles, ['@deepseek-ai/dsh-sdk-minimal']);
  assert.equal(profiles.sdk.transport, 'sdk-jsonrpc-stdio'); assert.equal(profiles.acp.transport, 'acp-jsonrpc-stdio');
  assert.equal(profiles.headless.lifetime, 'one-shot'); assert.equal(profiles.web.hmr, true);
  for (const p of ['headless', 'sdk', 'sdk-minimal', 'acp']) assert.equal(profiles[p].hmr, false);
});
test('启动器只解析应用参数之前的 flag', () => {
  const before = parseLauncher(['web', '--patch', 'a.yml', '--port', '8080']);
  const after = parseLauncher(['web', '--port', '8080', '--patch', 'a.yml']);
  assert.deepEqual(before.patches, ['a.yml']); assert.deepEqual(before.appArgs, ['--port', '8080']);
  assert.deepEqual(after.patches, []); assert.deepEqual(after.appArgs, ['--port', '8080', '--patch', 'a.yml']);
});
test('重复、缺失、保留名称和 dump 组合明确拒绝', () => {
  for (const args of [[], ['--profile'], ['--profile','web','--profile','sdk'], ['desktop'], ['web','--dump-config','--port','8080'], ['web','--dump-config','--dump-default-config'], ['web','--dump-default-config','--patch','a.yml']]) assert.throws(() => parseLauncher(args));
});
test('名称与目录独立于命令解析；缺失自定义 Profile 不静默改为 web', () => {
  for (const name of ['..', '.', '', 'node_modules', 'a/b', 'a\\b']) assert.throws(() => profileDir('/fixture/home', name));
  const f = fixture(); f.argv = ['course-web']; assert.equal(parseLauncher(f.argv).profile, 'course-web'); assert.throws(() => traceLaunch(f), /未安装/);
});
test('一般环境优先级是 process > project > home，空值由所有者判断', () => {
  const r = selectEnv({ COURSE_THEME: 'night', COURSE_EMPTY: '' }, { COURSE_THEME: 'day', COURSE_EMPTY: 'fallback', COURSE_PROJECT: 'p' }, { COURSE_THEME: 'mint', COURSE_HOME: 'h' });
  assert.deepEqual(r.COURSE_THEME, { value: 'night', source: 'process' });
  assert.equal(r.COURSE_EMPTY.value, ''); assert.equal(r.COURSE_PROJECT.source, 'project-env'); assert.equal(r.COURSE_HOME.source, 'user-env');
});
test('两文件先验证；受限制变量即使被继承值遮住仍拒绝，输入不被物化', () => {
  const processLayer = { DSH_HOME: '/fixture/home' }, copy = structuredClone(processLayer);
  assert.throws(() => selectEnv(processLayer, { COURSE_SAFE: 'x' }, { NODE_OPTIONS: 'forbidden' }), /禁止设置/);
  assert.deepEqual(processLayer, copy);
  assert.throws(() => selectEnv(processLayer, { DSH_HOME: '/other' }, {}), /DSH_HOME/);
});
test('代理只在 Home 文件有例外，CA/TLS/DSH 开关不是这个例外', () => {
  assert.throws(() => selectEnv({ HTTPS_PROXY: 'http://fixture.invalid' }, { HTTPS_PROXY: 'http://project.invalid' }, {}), /project-env/);
  assert.equal(selectEnv({}, {}, { HTTPS_PROXY: 'http://home.invalid' }).HTTPS_PROXY.source, 'user-env');
  assert.throws(() => selectEnv({}, {}, { NODE_TLS_REJECT_UNAUTHORIZED: 'forbidden' }));
});
test('标准配置追踪与参考答案一致；保持 CLI 表达式才由应用 flag 选择端口', () => {
  assert.deepEqual(traceLaunch(), reference.B);
  const f = fixture(); f.argv = ['web', '--patch', './extra.yml']; assert.equal(traceLaunch(f).port, 4300);
  const literal = fixture(); literal.layers.at(-1).patches[0].config.port = 9090;
  assert.equal(traceLaunch(literal).port, 9090);
});
test('config 整体替换不是深度合并；overlay 顺序改变结果', () => {
  const layers = [{ label:'a',patches:[{insert:[{id:'x',config:{a:1,b:2}}]}] }, {label:'b',patches:[{id:'x',config:{b:3}}]}];
  assert.deepEqual(compose(layers).rows[0].config, { b:3 });
  const f = fixture(); [f.layers[2], f.layers[3]] = [f.layers[3], f.layers[2]]; f.argv = ['web'];
  assert.equal(traceLaunch(f).port, 4100);
});
test('dump 不解析应用参数、不启动、不读项目 env；默认 dump 仅保留组合包', () => {
  const f = fixture(); f.argv = ['web','--dump-config']; f.projectEnv.DSH_HOME = '/bad';
  assert.equal(traceLaunch(f).appStarted, false); assert.match(traceLaunch(f).unevaluatedPort, /^!!js /);
  f.argv = ['web','--dump-default-config']; assert.deepEqual(traceLaunch(f).layerOrder, ['bundle:base','bundle:web-app']);
});
test('Web 参数错误与缺少应用配置行有明确边界，任意表达式不会执行', () => {
  const f = fixture(); f.argv = ['web','--port','wrong']; assert.throws(() => traceLaunch(f), /数字/);
  f.argv = ['web']; f.layers[3].patches[0].config.port = 'process.exit()'; assert.throws(() => traceLaunch(f), /不执行任意表达式/);
  f.layers = f.layers.slice(0,1); assert.throws(() => traceLaunch(f), /缺少必需/);
});
test('答案核对拒绝错误事实而不修改参考；脚本不评分解释文字', () => {
  assert.equal(checkAnswer(structuredClone(reference)), true);
  const wrong = structuredClone(reference); wrong.A.explicitMinimal.bundles.unshift('@deepseek-ai/dsh-base');
  assert.throws(() => checkAnswer(wrong)); assert.equal(reference.A.explicitMinimal.bundles.length, 1);
});
