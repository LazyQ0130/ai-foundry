import { randomBytes } from 'node:crypto'
import { writeFile } from 'node:fs/promises'

// Never overwrite credentials for an existing database or Garage volume.
const password = randomBytes(24).toString('hex')
const text = `# Local teaching environment only. Do not commit or share this file.
CAPSTONE_DB_PASSWORD=${password}
DATABASE_URL=postgresql://capstone:${password}@127.0.0.1:55439/capstone?schema=public
TEST_DATABASE_URL=postgresql://capstone:${password}@127.0.0.1:55440/capstone_c8_eval?schema=public
GARAGE_RPC_SECRET=${randomBytes(32).toString('hex')}
S3_ENDPOINT=http://127.0.0.1:3900
S3_REGION=garage
S3_BUCKET=capstone-private
S3_ACCESS_KEY_ID=GK${randomBytes(16).toString('hex')}
S3_SECRET_ACCESS_KEY=${randomBytes(32).toString('hex')}
C3_APP_ORIGIN=http://localhost:3000
AI_EMBEDDING_MODE=mock
AI_RESEARCH_MODE=mock
AI_REPORT_MODE=mock
AI_NOTE_MODE=mock
AI_EMBEDDING_DIMENSION=1024
`
try {
  await writeFile('.env.local', text, { flag: 'wx', mode: 0o600 })
  console.log('Created .env.local with local credentials. Values are not printed.')
} catch (error) {
  if (error.code !== 'EEXIST') throw error
  console.log('.env.local already exists; preserved it. See docs/local-environment.md for upgrades.')
}
