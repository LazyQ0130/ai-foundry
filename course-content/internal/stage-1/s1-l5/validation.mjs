// Internal course experiment only. Never runs Git in the author repository or Starter.
// Temporary projects and their histories are deliberately retained; no cleanup deletes.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, cpSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { unzipSync } from 'fflate'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '../../../..')
const hash = value => createHash('sha256').update(value).digest('hex')
const marker = 'aifoundry-s1-l5-temporary-validation'
function personalizeB(root) {
  const path = join(root, 'b/app/page.tsx')
  writeFileSync(path, readFileSync(path, 'utf8')
    .replace(/(<h1[^>]*>\s*)个人知识工作台/, '$1我的学习资料库')
    .replace('把我平时收集的资料整理在这里，需要的时候一键找到。', '把课堂笔记和有用的链接收在一起。'))
}
function context(root) {
  const record = JSON.parse(readFileSync(join(root, 'evidence.json'), 'utf8'))
  assert.equal(record.marker, marker)
  assert.ok(resolve(root).startsWith(resolve(tmpdir()) + (process.platform === 'win32' ? '\\' : '/')))
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^(GIT_|EMAIL$)/i.test(key)))
  Object.assign(env, { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: join(root, 'empty.config'), GIT_TERMINAL_PROMPT: '0', LC_ALL: 'C' })
  const git = (variant, args, expected = 0) => {
    const result = spawnSync('git', args, { cwd: join(root, variant), env, encoding: 'utf8', windowsHide: true })
    if (result.error) throw result.error
    record.commands.push({ variant, args, exit: result.status, stdout: result.stdout, stderr: result.stderr })
    writeFileSync(join(root, 'evidence.json'), JSON.stringify(record, null, 2) + '\n')
    assert.equal(result.status, expected, `${variant}: git ${args.join(' ')}\n${result.stderr}`)
    return result.stdout.trim()
  }
  return { record, git, persist: () => writeFileSync(join(root, 'evidence.json'), JSON.stringify(record, null, 2) + '\n') }
}

export function prepare() {
  const root = mkdtempSync(join(tmpdir(), 'aifoundry-s1-l5-'))
  writeFileSync(join(root, 'empty.config'), '')
  const zipBytes = readFileSync(join(repo, 'starter/aifoundry-stage1-starter.zip'))
  const zip = unzipSync(zipBytes)
  assert.ok(!Object.keys(zip).some(path => path.split('/').includes('.git')))
  const zipHasIgnore = Object.keys(zip).some(path => path.endsWith('/.gitignore'))
  for (const [path, bytes] of Object.entries(zip)) {
    const relative = path.replace(/^aifoundry-stage1-starter\//, '')
    assert.ok(relative && !relative.includes('..') && !relative.startsWith('/'))
    const target = join(root, 'a', relative)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, bytes)
  }
  cpSync(join(here, '../s1-l4/implementation-a/after'), join(root, 'a'), { recursive: true })
  // This matches the lesson's missing-ignore step, not a change to the delivered ZIP.
  if (!zipHasIgnore) cpSync(join(repo, 'starter/stage-1/.gitignore'), join(root, 'a/.gitignore'))
  cpSync(join(here, '../s1-l3/common'), join(root, 'b'), { recursive: true })
  cpSync(join(here, '../s1-l4/implementation-b/before'), join(root, 'b'), { recursive: true })
  personalizeB(root)
  writeFileSync(join(root, 'evidence.json'), JSON.stringify({ marker, zipHasIgnore, zipHash: hash(zipBytes), commands: [], states: {} }, null, 2))
  const ctx = context(root)
  ctx.git('a', ['--version'])
  ctx.git('a', ['status'], 128)
  // B already has a real older version before the lesson begins.
  ctx.git('b', ['init'])
  ctx.git('b', ['config', '--local', 'user.name', 'Course validation'])
  ctx.git('b', ['config', '--local', 'user.email', 'qa@example.invalid'])
  ctx.git('b', ['add', '.'])
  ctx.git('b', ['commit', '-m', 'existing working project'])
  ctx.record.states.bEarlierCommit = ctx.git('b', ['rev-parse', 'HEAD'])
  cpSync(join(here, '../s1-l4/implementation-b/after'), join(root, 'b'), { recursive: true })
  personalizeB(root)
  ctx.persist()
  return root
}

export function save(root) {
  const ctx = context(root)
  for (const variant of ['a', 'b']) {
    const dir = join(root, variant)
    for (const path of ['node_modules/ignore-probe.txt', '.next/ignore-probe.txt', '.env', '.env.local', '.env.production']) {
      mkdirSync(dirname(join(dir, path)), { recursive: true })
      writeFileSync(join(dir, path), 'synthetic ignore probe; no credentials\n')
    }
    if (variant === 'a') {
      ctx.git(variant, ['status'], 128)
      ctx.git(variant, ['init'])
      ctx.git(variant, ['config', '--local', 'user.useConfigOnly', 'true'])
    }
    ctx.git(variant, ['status'])
    ctx.git(variant, ['add', '.'])
    ctx.git(variant, ['status'])
    const tracked = ctx.git(variant, ['ls-files'])
    assert.doesNotMatch(tracked, /(^|\n)(node_modules\/|\.next\/|\.env)/)
    assert.match(tracked, /(^|\n)\.gitignore(\n|$)/)
    if (variant === 'a') {
      ctx.git(variant, ['commit', '-m', 'save working version'], 128)
      assert.match(ctx.record.commands.at(-1).stderr, /identity|who you are/i)
      ctx.git(variant, ['config', '--local', 'user.name', 'Course validation'])
      ctx.git(variant, ['config', '--local', 'user.email', 'qa@example.invalid'])
    }
    ctx.git(variant, ['commit', '-m', 'save working version'])
    ctx.git(variant, ['log', '--oneline', '-n', '3'])
    assert.match(ctx.git(variant, ['status']), /working tree clean/)
    ctx.record.states[variant] = {
      savepoint: ctx.git(variant, ['rev-parse', 'HEAD']),
      pageHash: hash(readFileSync(join(dir, 'app/page.tsx'))),
      count: Number(ctx.git(variant, ['rev-list', '--count', 'HEAD'])),
      tracked,
    }
    cpSync(join(dir, 'app/page.tsx'), join(root, `${variant}-saved-page.tsx`))
    ctx.persist()
  }
}

export function inspect(root) {
  const ctx = context(root)
  for (const variant of ['a', 'b']) {
    ctx.git(variant, ['status'])
    assert.equal(ctx.git(variant, ['diff', '--name-only']), 'app/page.tsx')
    assert.equal(ctx.git(variant, ['diff', '--cached', '--name-only']), '')
    assert.equal(ctx.git(variant, ['rev-parse', 'HEAD']), ctx.record.states[variant].savepoint)
    const page = readFileSync(join(root, variant, 'app/page.tsx'), 'utf8')
    assert.ok(page.includes('版本恢复实验') && page.includes('这段修改稍后会恢复'))
    ctx.record.states[variant].experimentDiff = ctx.git(variant, ['diff', '--', 'app/page.tsx'])
    ctx.persist()
  }
}

export function restore(root) {
  const ctx = context(root)
  for (const variant of ['a', 'b']) {
    assert.equal(ctx.git(variant, ['diff', '--name-only']), 'app/page.tsx')
    assert.equal(ctx.git(variant, ['diff', '--cached', '--name-only']), '')
    ctx.git(variant, ['restore', 'app/page.tsx'])
    assert.match(ctx.git(variant, ['status']), /working tree clean/)
    ctx.git(variant, ['log', '--oneline', '-n', '3'])
    assert.equal(ctx.git(variant, ['rev-parse', 'HEAD']), ctx.record.states[variant].savepoint)
    assert.equal(Number(ctx.git(variant, ['rev-list', '--count', 'HEAD'])), ctx.record.states[variant].count)
    // Git may normalize line endings, so compare content with LF on both sides.
    const normalize = path => readFileSync(path, 'utf8').replace(/\r\n/g, '\n')
    assert.equal(normalize(join(root, variant, 'app/page.tsx')), normalize(join(root, `${variant}-saved-page.tsx`)))
    ctx.record.states[variant].restored = true
    ctx.persist()
  }
  assert.equal(ctx.git('b', ['rev-parse', 'HEAD~1']), ctx.record.states.bEarlierCommit)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [phase, root] = process.argv.slice(2)
  if (phase === 'prepare') console.log(prepare())
  else {
    assert.ok(existsSync(join(root ?? '', 'evidence.json')), 'Use the explicit temporary root returned by prepare.')
    assert.ok(['save', 'inspect', 'restore'].includes(phase))
    ;({ save, inspect, restore })[phase](root)
    console.log(`${phase}: A/B passed`)
  }
}
