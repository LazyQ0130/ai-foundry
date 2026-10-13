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
  "compose.yaml",
  "docs/local-environment.md",
  "docs/templates/architecture-decision.md",
  "docs/templates/product-brief.md",
  "docs/templates/user-flow.md",
  "eslint.config.mjs",
  "infra/cors.json",
  "infra/eval-init.sql",
  "infra/garage.toml",
  "infra/storage-check.txt",
  "next-env.d.ts",
  "next.config.ts",
  "package-lock.json",
  "package.json",
  "postcss.config.mjs",
  "scripts/check-local-storage.mjs",
  "scripts/init-local-env.mjs",
  "test/bootstrap.test.mjs",
  "tsconfig.json"
] as const
export async function createCapstoneStarterZip(root=path.resolve('starter/capstone')) {
  const entries: Zippable={}
  for(const file of capstoneStarterFiles) {
    let current=root
    for(const part of file.split('/')) {current=path.join(current,part);if((await lstat(current)).isSymbolicLink())throw new Error('CAPSTONE_STARTER_SYMLINK')}
    if(!(await lstat(current)).isFile())throw new Error('CAPSTONE_STARTER_NOT_FILE')
    // Every allowlisted asset is UTF-8 source. Git may convert CRLF on Windows;
    // use LF in the download so checkout platform cannot make the ZIP stale.
    const source=await readFile(current,'utf8')
    entries['aifoundry-capstone-starter/'+file]=[Buffer.from(source.replace(/\r\n/g,'\n')),{mtime:new Date(2020,0,1),level:9}]
  }
  return zipSync(entries)
}
