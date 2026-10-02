import { readFile, writeFile } from 'node:fs/promises'
import { createStarterZip } from './starter-package.js'

for (const stage of [1, 3, 4] as const) {
  const destination = `starter/aifoundry-stage${stage}-starter.zip`
  const zip = await createStarterZip(`starter/stage-${stage}`, stage)
  if (process.argv.includes('--check')) {
    if (!Buffer.from(zip).equals(await readFile(destination))) throw new Error(`Stage ${stage} Starter ZIP 已过期，请运行 npm run build:starter`)
    console.info(`PASS: Stage ${stage} Starter ZIP 与源文件一致`)
  } else {
    await writeFile(destination, zip)
    console.info(`Starter ZIP: ${destination} (${zip.length} bytes)`)
  }
}
