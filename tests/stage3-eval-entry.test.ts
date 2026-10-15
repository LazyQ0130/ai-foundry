import test from 'node:test'
import assert from 'node:assert/strict'
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { randomUUID } from 'node:crypto'
import { createServer } from 'node:http'
import path from 'node:path'

// Isolated command fixtures test transport, local evidence and refusal behavior.
// They are not application/Neon or model-quality verification.
async function fixture() {
  const cwd = path.resolve('.runtime', `stage3-entry-test-${randomUUID()}`)
  await mkdir(path.join(cwd, 'node_modules/@next/env'), { recursive: true })
  await mkdir(path.join(cwd, 'scripts')); await mkdir(path.join(cwd, '.runtime'))
  await writeFile(path.join(cwd, 'package.json'), '{"private":true}')
  await writeFile(path.join(cwd, 'node_modules/@next/env/index.js'), 'exports.loadEnvConfig=()=>{}')
  await writeFile(path.join(cwd, '.gitignore'), '.env*\n/.runtime/\n/node_modules/\n')
  const git = spawnSync('git', ['init', '-q'], { cwd, windowsHide: true })
  assert.equal(git.status, 0)
  await cp('course-tools/shared/course-env.mjs', path.join(cwd, 'scripts/course-env.mjs'))
  await cp('course-tools/stage-3/run-rag-eval.mjs', path.join(cwd, 'scripts/run-rag-eval.mjs'))
  await writeFile(path.join(cwd, 'scripts/rag-eval.mjs'), 'console.log("FIXTURE_RUNNER_IMPORTED")')
  return cwd
}
async function command(cwd: string, values: Record<string,string> = {}) {
  const child = spawn(process.execPath, ['scripts/run-rag-eval.mjs'], { cwd, windowsHide: true, timeout: 15000,
    env: { ...process.env, EVAL_MODE: 'mock', EVAL_REAL_CONFIRM: 'NO', ...values } })
  let output = ''; child.stdout.on('data', data => { output += data }); child.stderr.on('data', data => { output += data })
  const [code] = await once(child, 'exit'); return { code, output }
}
test('Stage 3 entry copies prior reports without exposing contents or overwriting archives/current evidence', async () => {
  const cwd = await fixture()
  const json = '{"mode":"mock","private":"REPORT_PRIVATE_SENTINEL"}', markdown = 'PRIVATE_REVIEW_SENTINEL'
  await writeFile(path.join(cwd, '.runtime/stage3-eval-report.json'), json)
  await writeFile(path.join(cwd, '.runtime/stage3-eval-review.md'), markdown)
  for (let index = 0; index < 2; index++) {
    const result = await command(cwd)
    assert.equal(result.code, 0, result.output); assert.match(result.output, /PREVIOUS_REPORT_ARCHIVED/)
    assert.match(result.output, /FIXTURE_RUNNER_IMPORTED/); assert.doesNotMatch(result.output, /PRIVATE_SENTINEL/)
    assert.equal(await readFile(path.join(cwd, '.runtime/stage3-eval-report.json'), 'utf8'), json)
    assert.equal(await readFile(path.join(cwd, '.runtime/stage3-eval-review.md'), 'utf8'), markdown)
    const archives = await readdir(path.join(cwd, '.runtime/stage3-eval-history'))
    assert.equal(archives.length, index + 1)
    for (const name of archives) {
      assert.equal(await readFile(path.join(cwd, '.runtime/stage3-eval-history', name, 'stage3-eval-report.json'), 'utf8'), json)
      assert.equal(await readFile(path.join(cwd, '.runtime/stage3-eval-history', name, 'stage3-eval-review.md'), 'utf8'), markdown)
    }
  }
})
test('unconfirmed real mode refuses before runner import/archive; no report is needed for a first Mock run', async () => {
  const cwd = await fixture()
  const refused = await command(cwd, { EVAL_MODE: 'real' })
  assert.notEqual(refused.code, 0); assert.match(refused.output, /REAL_EVAL_CONFIRM_REQUIRED/)
  assert.doesNotMatch(refused.output, /FIXTURE_RUNNER_IMPORTED|PREVIOUS_REPORT_ARCHIVED/)
  assert.deepEqual(await readdir(path.join(cwd, '.runtime')), [])
  const mock = await command(cwd)
  assert.equal(mock.code, 0, mock.output); assert.match(mock.output, /FIXTURE_RUNNER_IMPORTED/)
  assert.doesNotMatch(mock.output, /PREVIOUS_REPORT_ARCHIVED/)
})
test('invalid report paths and tracked evidence are refused before learner runner can overwrite them', async () => {
  const cwd = await fixture(), report = path.join(cwd, '.runtime/stage3-eval-report.json')
  await mkdir(report)
  const wrongPath = await command(cwd)
  assert.notEqual(wrongPath.code, 0); assert.match(wrongPath.output, /EVAL_REPORT_PATH_REQUIRED/)
  assert.doesNotMatch(wrongPath.output, /FIXTURE_RUNNER_IMPORTED/)
  // Use a separate explicit fixture; no cleanup or deletion is needed.
  const tracked = await fixture()
  await writeFile(path.join(tracked, '.runtime/stage3-eval-review.md'), 'PRIVATE_REVIEW_SENTINEL')
  assert.equal(spawnSync('git', ['add', '-f', '--', '.runtime/stage3-eval-review.md'], { cwd: tracked, windowsHide: true }).status, 0)
  const refused = await command(tracked)
  assert.notEqual(refused.code, 0); assert.match(refused.output, /GIT_IGNORE_REQUIRED/)
  assert.doesNotMatch(refused.output, /FIXTURE_RUNNER_IMPORTED|PRIVATE_REVIEW_SENTINEL/)
})
for (const scenario of [
  { name:'response mode mismatch', error:'EVAL_RESPONSE_MODE_MISMATCH', body:{kind:'real',answer:'Synthetic HTTP fixture'} },
  { name:'missing candidate IDs', error:'EVAL_CANDIDATE_IDS_REQUIRED', body:{ok:true,kind:'mock',status:'answered',answer:'Synthetic HTTP fixture',
    matches:[{title:'Git 学习笔记',position:0,preview:'Synthetic fixture'}],
    sources:[{sourceId:'SRC-CHUNK-1',title:'Git 学习笔记',position:0,preview:'Synthetic fixture'}]} },
]) {
test(`${scenario.name} stops the reference runner after one HTTP question and preserves old evidence`, async () => {
  const cwd = await fixture(), source = 'course-content/internal/stage-3/s3-l7'
  await mkdir(path.join(cwd, 'eval'))
  for (const name of ['rag-eval-core.mjs', 'rag-cases.json']) await cp(`${source}/eval/${name}`, path.join(cwd, 'eval', name))
  await cp(`${source}/scripts/rag-eval.mjs`, path.join(cwd, 'scripts/rag-eval.mjs'))
  const previous = '{"mode":"mock","runAt":"old-run-only"}'
  await writeFile(path.join(cwd, '.runtime/stage3-eval-report.json'), previous)
  let questions = 0
  const server = createServer((req, res) => {
    req.resume(); res.setHeader('Content-Type', 'application/json')
    if (req.url === '/api/auth/login') { res.setHeader('Set-Cookie', 'fixture=local-only'); res.end('{}'); return }
    questions++; res.end(JSON.stringify(scenario.body))
  })
  server.listen(0, '127.0.0.1'); await once(server, 'listening')
  try {
    const port = (server.address() as { port:number }).port
    const result = await command(cwd, { EVAL_BASE_URL:`http://127.0.0.1:${port}`, EVAL_USERNAME:'fixture', EVAL_PASSWORD:'local-only', EVAL_INTERVAL_MS:'13000' })
    assert.notEqual(result.code, 0); assert(result.output.includes(scenario.error),result.output)
    assert.equal(questions, 1); assert.doesNotMatch(result.output, /Case 2\/|caseCount/)
    assert.equal(await readFile(path.join(cwd, '.runtime/stage3-eval-report.json'), 'utf8'), previous)
    const archived = await readdir(path.join(cwd, '.runtime/stage3-eval-history'))
    assert.equal(archived.length, 1)
    assert.equal(await readFile(path.join(cwd, '.runtime/stage3-eval-history', archived[0], 'stage3-eval-report.json'), 'utf8'), previous)
  } finally { server.closeAllConnections(); await new Promise<void>(resolve=>server.close(()=>resolve())) }
})
}
