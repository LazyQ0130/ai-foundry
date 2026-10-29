/** 真实 AST 的结构与顺序辅助证据；不是完整启动或分支覆盖证明。 */
import ts from 'typescript'
import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
const root=fileURLToPath(new URL('../',import.meta.url)),lock=JSON.parse(await readFile(resolve(root,'../evidence/source-lock.json'),'utf8')),cache=process.env.HARNESS_SOURCE_CACHE??lock.sourceCache
const files=new Map<string,any>(),checks:any[]=[]
async function body(path:string,name:string){
 if(!files.has(path)){const text=await readFile(resolve(cache,path),'utf8');files.set(path,{text,ast:ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true)})}
 const {ast}=files.get(path);let owner:any
 const walk=(n:ts.Node)=>{if(ts.isFunctionDeclaration(n)&&n.name?.text===name)owner=n;ts.forEachChild(n,walk)};walk(ast);assert.ok(owner,name)
 const calls:any[]=[];const collect=(n:ts.Node)=>{if(ts.isCallExpression(n))calls.push({node:n,callee:n.expression.getText(ast),line:ast.getLineAndCharacterOfPosition(n.getStart()).line+1});ts.forEachChild(n,collect)};collect(owner)
 return {owner,calls,ast}
}
let a=await body('apps/cli/src/bin.ts','runCli')
const run=a.calls.find(c=>c.callee==='runProfile'),env=a.calls.find(c=>c.callee==='loadLayeredEnv'),parse=a.calls.find(c=>c.callee==='parseDshArgs')
assert.ok(parse.node.pos<run.node.pos&&run.node.pos<env.node.pos&&env.node.end<run.node.end)
checks.push({id:'O1',path:'apps/cli/src/bin.ts',symbol:'runCli',lines:[parse.line,run.line,env.line],meaning:'loadLayeredEnv is nested in runProfile arguments, so argument evaluation precedes runProfile invocation despite its later lexical line; dump is a different switch branch'})
a=await body('apps/cli/src/profile-boot.ts','runProfile')
const ordered=['installProxyFromEnvironment','composeProfile','boot'].map(name=>a.calls.find(c=>c.callee===name));assert.ok(ordered.every(Boolean));assert.ok(ordered[0].line<ordered[1].line&&ordered[1].line<ordered[2].line)
checks.push({id:'O2',path:'apps/cli/src/profile-boot.ts',symbol:'runProfile',calls:ordered.map(({callee,line})=>({callee,line})),meaning:'await proxy installation before composition; boot receives preparation callback; runtime/cleanup branches reviewed separately'})
a=await body('packages/boot/app-boot/src/index.ts','boot')
const prep=a.calls.find(c=>c.callee==='prepare'),mount=a.calls.find(c=>c.callee==='mountRootInclude');assert.ok(prep.line<mount.line)
checks.push({id:'O3',path:'packages/boot/app-boot/src/index.ts',symbol:'boot',lines:[prep.line,mount.line],meaning:'host preparation callback is awaited before config-tree mounting, not before creation of the Loader itself'})
a=await body('packages/boot/app-boot/src/index.ts','loadLayeredEnv')
const reads=a.calls.filter(c=>c.callee==='readEnvLayer'),snapshot=a.calls.find(c=>c.callee==='createLaunchEnvironmentSnapshot');let assignment:ts.Node|undefined
const findAssignment=(n:ts.Node)=>{if(ts.isBinaryExpression(n)&&n.left.getText(a.ast)==='process.env[name]')assignment=n;ts.forEachChild(n,findAssignment)};findAssignment(a.owner)
assert.equal(reads.length,2);assert.ok(reads.every(c=>c.node.end<assignment!.pos)&&assignment!.end<snapshot.node.pos)
checks.push({id:'O4',path:'packages/boot/app-boot/src/index.ts',symbol:'loadLayeredEnv',lines:reads.map(c=>c.line),meaning:'both permitted file reads/validations occur before first env materialization; home==cwd skips duplicate read; snapshot captures inherited provenance separately'})
a=await body('packages/boot/app-boot/src/profile-context.ts','readProfilePatches')
const clone=a.calls.find(c=>c.callee==='structuredClone'),array=clone.node.arguments[0];assert.ok(ts.isArrayLiteralExpression(array));const layers=array.elements.map((e:ts.Node)=>e.getText(a.ast))
assert.equal(layers.length,4);assert.ok(layers[0].includes('readBundlePatches')&&layers[1].includes('patchPath')&&layers[2].includes('context.home')&&layers[3]==='...context.overlays')
checks.push({id:'O5',path:'packages/boot/app-boot/src/profile-context.ts',symbol:'readProfilePatches',layers,meaning:'bundle/profile/home/argv spreads are separate; telemetry disable patch may be appended afterwards, not represented by a universal precedence slogan'})
await writeFile(resolve(root,'evidence/control-flow.json'),JSON.stringify({commit:'f3803c96974ad4a94195fb97e5c637e9c2a3afe3',status:'AST_STRUCTURE_VERIFIED_WITH_RECORDED_LIMITS',checks,files:[...files].map(([path,v])=>({path,sha256:createHash('sha256').update(v.text).digest('hex')})),limit:'Static structure plus selected test reading and actual helper probes; full launcher/profile boot not executed'},null,2)+'\n')
console.log('PASS: 5 real AST structure checks; argument evaluation and callback execution distinguished')
