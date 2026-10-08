import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { randomBytes, createHash } from 'node:crypto'
import { prisma } from '../lib/prisma.ts'
import { embed } from '../lib/embedding-provider.ts'
import { vectorLiteral, INDEXING_VERSION } from '../lib/knowledge-core.ts'
import { documents } from './fixtures/gold.mjs'

export function assertEvalDatabase(env = process.env) {
 if(env.NODE_ENV==='production')throw Error('EVAL_PRODUCTION_ENV_FORBIDDEN')
 if (!env.TEST_DATABASE_URL || env.DATABASE_URL !== env.TEST_DATABASE_URL) throw Error('EVAL_DATABASE_REQUIRED')
 const u = new URL(env.TEST_DATABASE_URL)
 if (!['postgres:','postgresql:'].includes(u.protocol) || !['localhost','127.0.0.1'].includes(u.hostname) || u.port !== '55440' ||
  !['/capstone_c8_eval','/capstone_c8_real'].includes(u.pathname) || u.searchParams.get('schema') !== 'public') throw Error('EVAL_DATABASE_NOT_ALLOWLISTED')
 return u.pathname.slice(1)
}
export async function createContext(real = false) {
 assertEvalDatabase()
 const stamp = Date.now().toString(36)+randomBytes(3).toString('hex')
 if (!real) {
  for (const key of ['AI_EMBEDDING_MODE','AI_RESEARCH_MODE','AI_REPORT_MODE','AI_NOTE_MODE']) process.env[key]='mock'
  for (const key of ['C3_EMBED_FAIL_AT','C3_EMBED_FAIL_ONCE_AT','C4_MOCK_SCENARIO']) delete process.env[key]
 }
 process.env.ACTION_APPROVAL_SECRET = randomBytes(48).toString('base64url')
 const objects = new Map()
 const storage = createServer(async(req,res)=>{
  const objectKey = new URL(req.url,'http://localhost').pathname
  if (req.method === 'PUT') { const chunks=[];for await(const chunk of req) chunks.push(chunk);objects.set(objectKey,{bytes:Buffer.concat(chunks),mime:req.headers['content-type']});res.writeHead(200);res.end();return }
  if (req.method === 'DELETE') { objects.delete(objectKey);res.writeHead(204);res.end();return }
  const object=objects.get(objectKey)
  if (!object) {res.writeHead(404);res.end();return}
  res.writeHead(200,{'content-length':object.bytes.length,'content-type':object.mime});res.end(req.method==='HEAD'?undefined:object.bytes)
 })
 storage.listen(3911,'127.0.0.1');await once(storage,'listening')
 Object.assign(process.env,{S3_ENDPOINT:'http://127.0.0.1:3911',S3_REGION:'eval',S3_BUCKET:'synthetic',S3_ACCESS_KEY_ID:'eval-only',S3_SECRET_ACCESS_KEY:'eval-only-local-stub'})
 const base='http://127.0.0.1:3142'
 const app=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port','3142'],{env:process.env,stdio:['ignore','ignore','ignore']})
 // Reports intentionally omit child output, secrets, requests and provider raw responses.
 async function close() {app.kill();storage.closeAllConnections();await new Promise(resolve=>storage.close(resolve));await prisma.$disconnect()}
 try {
  let ready=false
  for(let i=0;i<150;i++){try{if((await fetch(base)).ok){ready=true;break}}catch{} await new Promise(resolve=>setTimeout(resolve,100))}
  if(!ready) throw Error('EVAL_APP_NOT_READY')
  async function call(route,{method='GET',cookie,body}={}) {
   const r=await fetch(base+route,{method,headers:{...(cookie?{cookie}:{}),...(body===undefined?{}:{'content-type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(130_000)})
   return {status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],data:await r.json().catch(()=>({}))}
  }
  async function user(label) {
   const response=await call('/api/auth/register',{method:'POST',body:{username:`c8_${label}_${stamp}`,password:'StrongPass123'}})
   if(response.status!==201) throw Error('FIXTURE_REGISTER_FAILED')
   const workspace=await prisma.workspace.findUniqueOrThrow({where:{ownerId:response.data.user.id}})
   return {...response.data.user,cookie:response.cookie,workspaceId:workspace.id}
  }
  const alice=await user('alice'),bob=await user('bob')
  async function seed(source,owner=alice) {
   const embedding=await embed(source.text)
   const doc=await prisma.knowledgeDocument.create({data:{workspaceId:owner.workspaceId,title:source.id,originalName:source.id+'.txt',mimeType:'text/plain',byteSize:Buffer.byteLength(source.text),objectKey:`c8/${stamp}/${source.id}`,contentHash:createHash('sha256').update(source.text).digest('hex'),status:'READY'}})
   const citationKey=`c8-${stamp}-${source.id}`
   await prisma.$executeRaw`INSERT INTO "KnowledgeChunk" ("documentId","position","page","startOffset","endOffset","content","citationKey","embedding","embeddingModel","embeddingDimension","indexingVersion") VALUES (${doc.id},0,NULL,0,${source.text.length},${source.text},${citationKey},${vectorLiteral(embedding.vector)}::vector,${embedding.model},1024,${INDEXING_VERSION})`
   objects.set('/synthetic/'+doc.objectKey,{bytes:Buffer.from(source.text),mime:'text/plain'})
   return {...doc,citationKey,text:source.text}
  }
  const seeded=[];for(const source of documents) seeded.push(await seed(source))
  const identity={userId:alice.id,workspaceId:alice.workspaceId},bobIdentity={userId:bob.id,workspaceId:bob.workspaceId}
  async function runFixture(source=documents[0]) {
   const doc=seeded.find(d=>d.title===source.id)
   const task=await prisma.researchTask.create({data:{workspaceId:alice.workspaceId,title:'Synthetic evaluation',query:source.text.slice(0,120)}})
   const report={answerability:'grounded',summary:[],findings:[{text:source.text,citationKeys:[doc.citationKey]}],analysis:[],conclusion:[]}
   const run=await prisma.researchRun.create({data:{taskId:task.id,status:'COMPLETED',report,citations:{create:{position:1,citationKey:doc.citationKey,title:source.id,excerpt:source.text}}}})
   return {run,task,report}
  }
  return {prisma,call,alice,bob,identity,bobIdentity,seeded,seed,runFixture,objects,close,stamp,real}
 } catch(error) {await close();throw error}
}
