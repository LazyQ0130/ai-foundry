// 教学子集：平面条目、root insert、id/config/disabled；不是官方 Patch 实现。
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const layers = [
  { source: 'bundle:core', patches: [{ insert: [
    { id: 'model', name: 'course-model', config: { model: 'base', temperature: 0.2, retry: { attempts: 2 } } },
    { id: 'audit', name: 'course-audit', disabled: false }
  ] }] },
  { source: 'bundle:surface', patches: [{ id: 'model', config: { model: 'surface', temperature: 0.4 } }] },
  { source: 'profile', patches: [{ id: 'model', config: { model: 'profile', temperature: 0.6 } }] },
  { source: 'home', patches: [{ id: 'model', config: { model: 'home', timeout: 30 } }, { id: 'audit', disabled: true }] },
  { source: 'cli:extra.yml', patches: [{ id: 'model', config: { model: 'cli' } }, { id: 'audit', disabled: false }] }
];

export function compose(input = layers) {
  const rows = [], trace = [], warnings = [];
  for (const layer of input) {
    for (const patch of layer.patches) {
      if (patch.insert) { rows.push(...structuredClone(patch.insert)); continue; }
      const target = rows.find(row => row.id === patch.id);
      if (!target) { warnings.push(`missing:${patch.id}`); continue; }
      if ('config' in patch) target.config = structuredClone(patch.config);
      if ('disabled' in patch) target.disabled = patch.disabled;
    }
    trace.push({ source: layer.source, rows: structuredClone(rows) });
  }
  return { rows, trace, warnings };
}

// 独立写出的答案：不调用 compose 来生成预期。
export const reference = {
  order: ['bundle:core', 'bundle:surface', 'profile', 'home', 'cli:extra.yml'],
  configs: [
    { model: 'base', temperature: 0.2, retry: { attempts: 2 } },
    { model: 'surface', temperature: 0.4 },
    { model: 'profile', temperature: 0.6 },
    { model: 'home', timeout: 30 },
    { model: 'cli' }
  ],
  final: [
    { id: 'model', name: 'course-model', config: { model: 'cli' } },
    { id: 'audit', name: 'course-audit', disabled: false }
  ]
};
export function checkAnswer(answer) {
  assert.deepEqual(answer, reference, '按每一层重算；config 不是深度合并');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === '--trace') console.log(JSON.stringify(compose(), null, 2));
  else { checkAnswer(JSON.parse(await readFile(process.argv[2] ?? 'answer.json', 'utf8'))); console.log('PASS A：确定性答案；理由需另解释'); }
}
