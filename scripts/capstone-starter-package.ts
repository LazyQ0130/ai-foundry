import { readFile, lstat } from 'node:fs/promises'
import path from 'node:path'
import { zipSync, type Zippable } from 'fflate'
// Exact reviewed paths, never recursive inclusion. Completed author documents excluded.
export const capstoneStarterFiles = [
  ".env.example",
  ".gitignore",
  "README.md",
  "app/layout.tsx",
  "app/page.tsx",
  "app/styles.css",
  "docs/templates/architecture-decision.md",
  "docs/templates/product-brief.md",
  "docs/templates/user-flow.md",
  "eslint.config.mjs",
  "next-env.d.ts",
  "next.config.ts",
  "package-lock.json",
  "package.json",
  "postcss.config.mjs",
  "test/bootstrap.test.mjs",
  "tsconfig.json"
] as const
export async function createCapstoneStarterZip(root=path.resolve('starter/capstone')) {
  const entries: Zippable={}
  for(const file of capstoneStarterFiles) {
    let current=root
    for(const part of file.split('/')) {current=path.join(current,part);if((await lstat(current)).isSymbolicLink())throw new Error('CAPSTONE_STARTER_SYMLINK')}
    if(!(await lstat(current)).isFile())throw new Error('CAPSTONE_STARTER_NOT_FILE')
    entries['aifoundry-capstone-starter/'+file]=[await readFile(current),{mtime:new Date(2020,0,1),level:9}]
  }
  return zipSync(entries)
}
