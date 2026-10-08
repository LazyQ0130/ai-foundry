import { spawnSync } from 'node:child_process'
import { mkdirSync,writeFileSync } from 'node:fs'
// A fresh npm ci has not generated this schema's client. Generate before importing C8 context.
// Generate never contacts a database; the C8 guard runs before tests/Eval or any DB action.
if(process.env.NODE_ENV==='production'||!process.env.TEST_DATABASE_URL||process.env.DATABASE_URL!==process.env.TEST_DATABASE_URL)throw Error('ISOLATED_EVAL_ENV_REQUIRED')
if(spawnSync(process.execPath,['node_modules/prisma/build/index.js','generate'],{stdio:'inherit'}).status!==0)process.exit(1)
const { assertEvalDatabase } = await import('../eval/context.mjs')
// Eval enforces isolated allowlisted local DB and refuses production. No cloud env is loaded.
assertEvalDatabase()
for(const k of Object.keys(process.env))if(/API_KEY|S3_SECRET|APPROVAL_SECRET|MCP_EXTERNAL_AUTH_SECRET/.test(k))delete process.env[k]
for(const k of ['AI_EMBEDDING_MODE','AI_RESEARCH_MODE','AI_REPORT_MODE','AI_NOTE_MODE'])process.env[k]='mock'
const npm=process.env.npm_execpath
if(!npm)throw Error('RUN_VIA_NPM_RELEASE_CHECK')
const run=args=>spawnSync(process.execPath,[npm,...args],{stdio:'inherit',env:process.env}).status
for(const command of ['lint','typecheck','test','build','eval:capstone']){
 const args=['run',command,...(command==='eval:capstone'?['--','--compare-baseline','eval/baseline.json']:[])]
 if(run(args)!==0)process.exit(1)
}
for(const args of [['audit','--omit=dev','--json'],['audit','--json']]){
 const result=spawnSync(process.execPath,[npm,...args],{encoding:'utf8',env:process.env})
 let data;try{data=JSON.parse(result.stdout)}catch{throw Error('AUDIT_UNAVAILABLE')}
 if(data.error||!data.metadata?.vulnerabilities)throw Error('AUDIT_INCOMPLETE')
 mkdirSync('.runtime/release',{recursive:true})
 writeFileSync(`.runtime/release/audit-${args.includes('--omit=dev')?'production':'full'}.json`,JSON.stringify(data,null,2))
 const v=data.metadata.vulnerabilities
 console.log(JSON.stringify({event:'dependency_audit',scope:args.includes('--omit=dev')?'production':'full',counts:v}))
 if(v.high||v.critical)process.exit(1)
}
console.log('PASS: release code/audit/deterministic gates; production secrets/IAM/HTTPS/cloud smoke are separate mandatory gates')
