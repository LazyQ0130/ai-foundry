import test from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { validateProductionEnv } from '../scripts/check-production-env.mjs'
test('production env fails closed on test/local/mock/shared/public secrets without echoing values',()=>{
 const env:Record<string,string>={NODE_ENV:'production',DATABASE_URL:'postgresql://app:synthetic@db.vendor.test/app?sslmode=require',
 S3_ENDPOINT:'https://storage.vendor.test',S3_REGION:'auto',S3_BUCKET:'private',S3_ACCESS_KEY_ID:'synthetic-id',S3_SECRET_ACCESS_KEY:'synthetic-storage',
 AI_EMBEDDING_BASE_URL:'https://ai.vendor.test/v1',AI_EMBEDDING_API_KEY:'synthetic-embed',AI_EMBEDDING_MODEL:'embedding',AI_EMBEDDING_DIMENSION:'1024',
 AI_CHAT_BASE_URL:'https://ai.vendor.test/v1',AI_CHAT_API_KEY:'synthetic-chat',AI_CHAT_MODEL:'chat',
 MCP_EXTERNAL_URL:'https://product.vendor.test/api/mcp/external-research',APP_ORIGIN:'https://product.vendor.test',
 MCP_EXTERNAL_AUTH_SECRET:randomBytes(32).toString('base64url'),ACTION_APPROVAL_SECRET:randomBytes(32).toString('base64url'),
 AI_EMBEDDING_MODE:'real',AI_RESEARCH_MODE:'real',AI_REPORT_MODE:'real',AI_NOTE_MODE:'real'}
 assert.deepEqual(validateProductionEnv(env),[])
 for(const model of ['qwen3.8-flash','another-provider/model-v2'])assert.deepEqual(validateProductionEnv({...env,AI_PLANNER_MODEL:model}),[])
 for(const model of ['', '  ', 'bad model', '\nunsafe'])assert.ok(validateProductionEnv({...env,AI_PLANNER_MODEL:model}).includes('AI_PLANNER_MODEL: INVALID_MODEL_NAME'))
 for(const [key,value] of Object.entries({TEST_DATABASE_URL:'secret-db-url',MCP_ALLOW_LOCAL_HTTP:'1',AI_NOTE_MODE:'mock',
  AI_EMBEDDING_DIMENSION:'1536',S3_ENDPOINT:'http://localhost:3900',NEXT_PUBLIC_AI_CHAT_API_KEY:'never-print',
  ACTION_APPROVAL_SECRET:env.MCP_EXTERNAL_AUTH_SECRET,DATABASE_URL:'postgresql://app:secret@127.0.0.2/db?sslmode=require',S3_BUCKET:'*',C9_LOCAL_STAGING_SMOKE:'1'})){
  const errors=validateProductionEnv({...env,[key]:value})
  assert.ok(errors.length>0,key);assert.ok(!JSON.stringify(errors).includes(value),'no values in diagnostics')
 }
})
