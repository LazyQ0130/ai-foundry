import { readFile, writeFile } from 'node:fs/promises'
import { createStarterZip } from './starter-package.js'

const destination = 'starter/aifoundry-stage1-starter.zip'
const zip = await createStarterZip()
if (process.argv.includes('--check')) {
  if (!Buffer.from(zip).equals(await readFile(destination))) throw new Error('Starter ZIP 已过期，请运行 npm run build:starter')
  console.info('PASS: Starter ZIP 与源文件一致')
} else {
  await writeFile(destination, zip)
  console.info(`Starter ZIP: ${destination} (${zip.length} bytes)`)
}
