import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const script = 'course-content/internal/stage-1/s1-l5/validation.mjs'
const run = (...args: string[]) => {
  const result = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', windowsHide: true })
  assert.equal(result.status, 0, result.stderr)
  return result.stdout.trim()
}

test('1.5 real Git workflow: missing repository, local identity, ignored files, existing history and exact-file recovery', () => {
  const root = run('prepare')
  run('save', root)
  for (const variant of ['a', 'b']) {
    const path = join(root, variant, 'app/page.tsx')
    const before = readFileSync(path, 'utf8')
    const changed = before.replace(/(<h1[^>]*>)[\s\S]*?(<\/h1>)/, '$1版本恢复实验$2')
      .replace(/(<p className="mt-2 max-w-xl[^>]*>)[\s\S]*?(<\/p>)/, '$1这段修改稍后会恢复$2')
    assert.notEqual(changed, before)
    writeFileSync(path, changed)
  }
  run('inspect', root)
  run('restore', root)
  const evidence = JSON.parse(readFileSync(join(root, 'evidence.json'), 'utf8'))
  assert.equal(evidence.states.a.count, 1)
  assert.equal(evidence.states.b.count, 2)
  assert.ok(evidence.states.a.restored && evidence.states.b.restored)
  assert.equal(evidence.commands.filter((entry: {variant: string; args: string[]}) => entry.variant === 'b' && entry.args[0] === 'init').length, 1)
  // Retain temporary histories: this test deliberately does not recursively delete files.
})
