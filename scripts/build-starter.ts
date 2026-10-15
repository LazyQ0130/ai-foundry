import { readFile, writeFile } from 'node:fs/promises'
import { createStarterZip } from './starter-package.js'
import { createCourseToolsZip } from './course-tools-package.js'

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

const {createCapstoneStarterZip}=await import('./capstone-starter-package.js')
const capstoneZip=await createCapstoneStarterZip(),capstoneDestination='starter/aifoundry-capstone-starter.zip'
if(process.argv.includes('--check')) {if(!Buffer.from(capstoneZip).equals(await readFile(capstoneDestination)))throw new Error('Capstone Starter ZIP 已过期');console.info('PASS: Capstone Starter ZIP matches exact allowlist')}
else {await writeFile(capstoneDestination,capstoneZip);console.info('Capstone Starter ZIP: '+capstoneZip.length+' bytes')}

for (const stage of [2, 3, 4] as const) {
  const zip = await createCourseToolsZip(stage)
  const destination = `course-tools/aifoundry-stage${stage}-tools.zip`
  if (process.argv.includes('--check')) {
    if (!Buffer.from(zip).equals(await readFile(destination))) throw new Error(`Stage ${stage} 验收工具 ZIP 已过期`)
    console.info(`PASS: Stage ${stage} course tools match the fixed allowlist`)
  } else { await writeFile(destination, zip); console.info(`Stage ${stage} course tools: ${zip.length} bytes`) }
}
