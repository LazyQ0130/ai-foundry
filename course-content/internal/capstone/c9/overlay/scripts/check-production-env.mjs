import { pathToFileURL } from 'node:url'
import { isIP } from 'node:net'

export function publicHttps(value) {
 try {
  const u=new URL(value), h=u.hostname.toLowerCase()
  return u.protocol==='https:' && !u.username && !u.password && !isIP(h) &&
   !h.includes(':') && h.includes('.') && !h.endsWith('.localhost') &&
   !['localhost','host.docker.internal'].includes(h) && !h.endsWith('.local') && !h.endsWith('.internal') && !h.endsWith('.example')
 } catch { return false }
}
export function validateProductionEnv(e) {
 const failures=[]
 const need=k=>{if(!e[k]?.trim())failures.push(k+': MISSING')}
 for(const k of ['DATABASE_URL','S3_ENDPOINT','S3_REGION','S3_BUCKET','S3_ACCESS_KEY_ID','S3_SECRET_ACCESS_KEY',
  'AI_EMBEDDING_BASE_URL','AI_EMBEDDING_API_KEY','AI_EMBEDDING_MODEL','AI_EMBEDDING_DIMENSION',
  'AI_CHAT_BASE_URL','AI_CHAT_API_KEY','AI_CHAT_MODEL','MCP_EXTERNAL_URL','MCP_EXTERNAL_AUTH_SECRET','ACTION_APPROVAL_SECRET','APP_ORIGIN'])need(k)
 for(const k of ['S3_ENDPOINT','AI_EMBEDDING_BASE_URL','AI_CHAT_BASE_URL','MCP_EXTERNAL_URL','APP_ORIGIN'])
  if(!publicHttps(e[k]))failures.push(k+': PUBLIC_HTTPS_REQUIRED')
 try {
  const u=new URL(e.DATABASE_URL)
  if(!['postgres:','postgresql:'].includes(u.protocol)||!u.username||!u.password||u.pathname==='/')throw Error()
  if(['localhost','0.0.0.0','::1','[::1]','host.docker.internal'].includes(u.hostname)||u.hostname.startsWith('127.'))throw Error()
  if(u.searchParams.get('sslmode')!=='require'&&u.searchParams.get('sslmode')!=='verify-full')throw Error()
 } catch {failures.push('DATABASE_URL: REMOTE_TLS_DATABASE_REQUIRED')}
 if(e.AI_PLANNER_MODEL!==undefined&&(typeof e.AI_PLANNER_MODEL!=='string'||! /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/.test(e.AI_PLANNER_MODEL)))failures.push('AI_PLANNER_MODEL: INVALID_MODEL_NAME')
 if(e.NODE_ENV!=='production')failures.push('NODE_ENV: PRODUCTION_REQUIRED')
 if(e.TEST_DATABASE_URL)failures.push('TEST_DATABASE_URL: FORBIDDEN')
 if(e.C9_LOCAL_STAGING_SMOKE)failures.push('C9_LOCAL_STAGING_SMOKE: FORBIDDEN')
 if(!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(e.S3_BUCKET??'')||isIP(e.S3_BUCKET??''))failures.push('S3_BUCKET: INVALID_BUCKET_NAME')
 if(e.AI_EMBEDDING_DIMENSION!=='1024')failures.push('AI_EMBEDDING_DIMENSION: MUST_BE_1024')
 for(const k of ['AI_EMBEDDING_MODE','AI_RESEARCH_MODE','AI_REPORT_MODE','AI_NOTE_MODE'])if(e[k]!=='real')failures.push(k+': REAL_REQUIRED')
 for(const k of Object.keys(e)) {
  if((/^C[3-8]_/.test(k)&&/TEST|FAIL|SCENARIO|EVAL|JUDGE/.test(k))||k==='MCP_ALLOW_LOCAL_HTTP')if(e[k])failures.push(k+': FORBIDDEN')
  if(k.startsWith('NEXT_PUBLIC_')&&/KEY|SECRET|TOKEN|DATABASE|S3|MCP|PROVIDER/.test(k))failures.push(k+': SECRET_EXPOSURE')
 }
 const secrets=['MCP_EXTERNAL_AUTH_SECRET','ACTION_APPROVAL_SECRET']
 for(const k of secrets)if(!/^[A-Za-z0-9_-]{43,}$/.test(e[k]??'')||Buffer.from(e[k]??'','base64url').length<32||new Set(e[k]).size<16||/replace|change-me|example|placeholder/i.test(e[k]))failures.push(k+': RANDOM_BASE64URL_32_BYTES_REQUIRED')
 const sensitive=[...secrets,'S3_SECRET_ACCESS_KEY','AI_CHAT_API_KEY','AI_EMBEDDING_API_KEY']
 for(const k of secrets)for(const other of sensitive)if(k!==other&&e[k]&&e[k]===e[other])failures.push(k+': MUST_BE_INDEPENDENT')
 try {if(new URL(e.MCP_EXTERNAL_URL).origin!==new URL(e.APP_ORIGIN).origin||new URL(e.MCP_EXTERNAL_URL).pathname!=='/api/mcp/external-research')failures.push('MCP_EXTERNAL_URL: SAME_PRODUCT_ENDPOINT_REQUIRED')}catch{}
 return [...new Set(failures)]
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
 const failures=validateProductionEnv(process.env)
 // Never echo values or parse exceptions (URLs may contain credentials).
 if(failures.length){console.error(failures.join('\n'));process.exitCode=1}
 else console.log('PASS: production variables configured; static checks only, entropy/IAM/connectivity require separate verification')
}
