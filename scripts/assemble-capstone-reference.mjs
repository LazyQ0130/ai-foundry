import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const [stage, outputArg] = process.argv.slice(2)
if (!['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9'].includes(stage) || !outputArg) {
  throw new Error('Usage: node scripts/assemble-capstone-reference.mjs <c1|c2|c3|c4|c5|c6|c7|c8|c9> <new .runtime directory>')
}
const runtime = path.join(root, '.runtime')
const output = path.resolve(root, outputArg)
if (!output.startsWith(runtime + path.sep) || existsSync(output)) {
  throw new Error('Output must be a new directory inside .runtime; existing files are never replaced')
}
const skip = new Set(['node_modules', '.next', '.git', 'tsconfig.tsbuildinfo'])
function copyTree(source, target) {
  if (!existsSync(source)) throw new Error(`Missing reference source: ${source}`)
  mkdirSync(target, { recursive: true })
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (skip.has(entry.name) || (entry.name.startsWith('.env') && !['.env.example', '.env.production.example'].includes(entry.name))) continue
    if (entry.isSymbolicLink()) throw new Error(`Symlink is not allowed: ${entry.name}`)
    const from = path.join(source, entry.name)
    const to = path.join(target, entry.name)
    if (entry.isDirectory()) copyTree(from, to)
    else if (entry.isFile()) copyFileSync(from, to)
  }
}

copyTree(path.join(root, 'starter/capstone'), output)
const c1 = path.join(root, 'course-content/internal/capstone/c1')
copyTree(path.join(c1, 'docs'), path.join(output, 'docs'))
copyFileSync(path.join(c1, 'README.md'), path.join(output, 'README.md'))
if (stage === 'c2' || stage === 'c3' || stage === 'c4' || stage === 'c5' || stage === 'c6' || stage === 'c7' || stage === 'c8' || stage === 'c9') {
  const source = path.join(root, 'course-content/internal/capstone/c2')
  copyTree(path.join(source, 'overlay'), output)
  copyFileSync(path.join(source, 'architecture-decision.md'), path.join(output, 'docs/architecture-decision.md'))
  // These are reviewed engineering primitives, not a copied product shell.
  const primitiveFiles = [
    'lib/auth.ts', 'lib/password.ts', 'lib/prisma.ts',
    'app/api/auth/login/route.ts', 'app/api/auth/logout/route.ts', 'app/api/auth/me/route.ts',
  ]
  for (const file of primitiveFiles) {
    const target = path.join(output, file)
    mkdirSync(path.dirname(target), { recursive: true })
    copyFileSync(path.join(root, 'starter/stage-4', file), target)
  }
  const packagePath = path.join(output, 'package.json')
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
  pkg.name = 'ai-research-workspace-c2-reference'
  pkg.scripts.build = 'prisma generate && next build'
  pkg.scripts.typecheck = 'prisma generate && tsc --noEmit'
  pkg.scripts['db:migrate'] = 'prisma migrate deploy'
  pkg.scripts['test:db'] = 'node scripts/c2-http-smoke.mjs'
  pkg.dependencies['@prisma/client'] = '6.19.3'
  pkg.devDependencies.prisma = '6.19.3'
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')
  const lock = path.join(source, 'package-lock.json')
  if (existsSync(lock)) copyFileSync(lock, path.join(output, 'package-lock.json'))
}
if (stage === 'c3' || stage === 'c4' || stage === 'c5' || stage === 'c6' || stage === 'c7' || stage === 'c8' || stage === 'c9') {
  const source = path.join(root, 'course-content/internal/capstone/c3')
  copyTree(path.join(source, 'overlay'), output)
  copyTree(path.join(root, 'course-content/internal/capstone/fixtures'), path.join(output, 'test/fixtures'))
  const packagePath = path.join(output, 'package.json')
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
  pkg.name = 'ai-research-workspace-c3-reference'
  pkg.scripts.test = 'tsx --test test/*.test.ts'
  pkg.scripts['test:db'] = 'node scripts/c3-http-smoke.mjs'
  pkg.dependencies['@aws-sdk/client-s3'] = '3.1147.0'
  pkg.dependencies['@aws-sdk/s3-request-presigner'] = '3.1147.0'
  pkg.dependencies['pdfjs-dist'] = '6.4.299'
  pkg.devDependencies.tsx = '4.23.15'
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')
  copyFileSync(path.join(source, 'package-lock.json'), path.join(output, 'package-lock.json'))
}
if (stage === 'c4' || stage === 'c5' || stage === 'c6' || stage === 'c7' || stage === 'c8' || stage === 'c9') {
  const source = path.join(root, 'course-content/internal/capstone/c4')
  copyTree(path.join(source, 'overlay'), output)
  const packagePath = path.join(output, 'package.json')
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
  pkg.name = 'ai-research-workspace-c4-reference'
  pkg.scripts['test:db'] = 'node scripts/c4-http-smoke.mjs'
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')
  const lock = JSON.parse(readFileSync(path.join(output, 'package-lock.json'), 'utf8'))
  lock.name = pkg.name
  lock.packages[''].name = pkg.name
  writeFileSync(path.join(output, 'package-lock.json'), JSON.stringify(lock, null, 2) + '\n')
}
if (stage === 'c5' || stage === 'c6' || stage === 'c7' || stage === 'c8' || stage === 'c9') {
  const source = path.join(root, 'course-content/internal/capstone/c5')
  copyTree(path.join(source, 'overlay'), output)
  const packagePath = path.join(output, 'package.json')
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
  pkg.name = 'ai-research-workspace-c5-reference'
  pkg.scripts['test:db'] = 'node scripts/c5-http-smoke.mjs'
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')
  const lock = JSON.parse(readFileSync(path.join(output, 'package-lock.json'), 'utf8'))
  lock.name = pkg.name
  lock.packages[''].name = pkg.name
  writeFileSync(path.join(output, 'package-lock.json'), JSON.stringify(lock, null, 2) + '\n')
}

if (stage === 'c6' || stage === 'c7' || stage === 'c8' || stage === 'c9') {
  const source = path.join(root, 'course-content/internal/capstone/c6')
  copyTree(path.join(source, 'overlay'), output)
  const packagePath = path.join(output, 'package.json')
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
  pkg.name = 'ai-research-workspace-c6-reference'
  pkg.scripts['test:db'] = 'node scripts/c6-http-smoke.mjs'
  pkg.dependencies['@modelcontextprotocol/client'] = '2.2.0'
  pkg.dependencies['@modelcontextprotocol/server'] = '2.2.0'
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')
  const lockPath = path.join(source, 'package-lock.json')
  if (existsSync(lockPath)) copyFileSync(lockPath, path.join(output, 'package-lock.json'))
}

if (stage === 'c7' || stage === 'c8' || stage === 'c9') {
  copyTree(path.join(root, 'course-content/internal/capstone/c7/overlay'), output)
  const packagePath = path.join(output, 'package.json')
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
  pkg.name = 'ai-research-workspace-c7-reference'
  pkg.scripts['test:db'] = 'node scripts/c7-http-smoke.mjs && tsx --test test/knowledge-write.integration.ts'
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')
  const lockPath = path.join(output, 'package-lock.json')
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'))
  lock.name = pkg.name; lock.packages[''].name = pkg.name
  writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n')
}
if (stage === 'c8' || stage === 'c9') {
  copyTree(path.join(root, 'course-content/internal/capstone/c8/overlay'), output)
  const packagePath = path.join(output, 'package.json')
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
  pkg.name = 'ai-research-workspace-c8-reference'
  pkg.scripts['eval:capstone'] = 'tsx eval/runner.mjs'
  pkg.scripts['eval:capstone:real'] = 'tsx eval/runner.mjs --real'
  pkg.scripts.verify = 'npm run lint && npm run typecheck && npm test && npm run build && npm run eval:capstone'
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')
  const lockPath = path.join(output, 'package-lock.json')
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'))
  lock.name = pkg.name; lock.packages[''].name = pkg.name
  writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n')
}
if (stage === 'c9') copyTree(path.join(root, 'course-content/internal/capstone/c9/overlay'), output)
if (['c4', 'c5', 'c6', 'c7', 'c8'].includes(stage)) {
  // Do not leave the inherited C3 README claiming that later domains do not exist.
  const scope = {
    c4: 'Grounded Report and historical Citation Snapshot',
    c5: 'Bounded Research Workflow, Brief and persistent Steps',
    c6: 'Controlled external MCP evidence and explicit Source Policy',
    c7: 'Post-run Proposal, exact human approval and atomic KnowledgeNote',
    c8: 'Fixed Product Eval, zero-only safety gates and reviewed baseline',
  }[stage]
  writeFileSync(path.join(output, 'README.md'), `# AI Research Workspace — internal ${stage.toUpperCase()} teaching reference

Current increment: ${scope}. All earlier Capstone increments are included; later increments are not implemented. Students continue their own project and product decisions. This is an author reference, not a downloadable Starter.

Requires Node >=20.19, isolated PostgreSQL/pgvector and private S3-compatible storage. Never use the platform or production database. Set DATABASE_URL and TEST_DATABASE_URL to the same isolated test URL. Configure S3_* privately. Run npm ci, npm run db:migrate, npm run lint, npm run typecheck, npm test and npm run build.

For deterministic HTTP verification set AI_EMBEDDING_MODE, AI_RESEARCH_MODE, AI_REPORT_MODE and AI_NOTE_MODE to mock. Start Next with CAPSTONE_BASE_URL matching its actual port; export the same test DB and base URL in the test shell. Set C4_MOCK_TEST_SCENARIOS=1 and C5_MOCK_TEST_SCENARIOS=1 only in this isolated test environment. Do not enable C3_EMBED_FAIL_ONCE_AT for these later-stage smoke scripts.

${['c6', 'c7', 'c8'].includes(stage) ? 'Start the separate test-only MCP fixture with C6_TEST_MCP_FIXTURE=1 and a freshly generated server-only MCP_EXTERNAL_AUTH_SECRET: npx tsx scripts/c6-mcp-fixture.ts. The app uses the SAME secret, MCP_EXTERNAL_URL=http://127.0.0.1:3133/api/mcp/external-research and MCP_ALLOW_LOCAL_HTTP=1. This fixture advertises an extra tool to test the local whitelist; it is never imported by production routes. Then run npm run test:db.' : 'Run npm run test:db against the running app; this stage needs no external MCP fixture.'}
${['c7', 'c8'].includes(stage) ? 'Approval tests additionally require a separate random ACTION_APPROVAL_SECRET.' : ''}

${stage === 'c8' ? 'C8 Eval uses its own stricter guard: local port 55440, database capstone_c8_eval (or capstone_c8_real), schema public, matching DATABASE_URL and TEST_DATABASE_URL, never NODE_ENV=production. Run npm run eval:capstone and npm run eval:capstone -- --compare-baseline eval/baseline.json after build. Eval starts its own HTTP app and explicitly labelled storage stub; stop any process on its reserved ports first.' : ''}
Real Provider runs require separate explicit opt-in. Mock results do not prove semantic quality or production IAM.

Keep credentials, tokens and reports outside Git. Current stage ${stage.toUpperCase()} is Internal Authoring. Capstone remains locked; Stage formal lessons remain 29.
`)
}
console.log(`Assembled ${stage.toUpperCase()} internal reference at ${output}`)
