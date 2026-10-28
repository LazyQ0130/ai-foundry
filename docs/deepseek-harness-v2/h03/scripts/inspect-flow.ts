/** 真实源码 AST 顺序证据；分支语义仍需结合实现和测试人工核对。 */
import ts from 'typescript'
import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
const root=fileURLToPath(new URL('../',import.meta.url))
const lock=JSON.parse(await readFile(resolve(root,'../evidence/source-lock.json'),'utf8'))
const cache=process.env.HARNESS_SOURCE_CACHE??lock.sourceCache
const seen=new Map<string,{ast:ts.SourceFile,text:string}>()
async function source(path:string){
 if(!seen.has(path)){const text=await readFile(resolve(cache,path),'utf8');seen.set(path,{text,ast:ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true)})}
 return seen.get(path)!
}
async function calls(path:string,method:string){
 const {ast}=await source(path);let owner:ts.Node|undefined
 const find=(n:ts.Node)=>{if(ts.isMethodDeclaration(n)&&n.name.getText(ast)===method)owner=n;ts.forEachChild(n,find)};find(ast)
 assert.ok(owner,`${path}:${method}`)
 const out:any[]=[]
 const visit=(n:ts.Node)=>{
  if(ts.isCallExpression(n)){
   const parents:string[]=[];let p:ts.Node|undefined=n.parent
   while(p&&p!==owner){if(ts.isCatchClause(p)||ts.isIfStatement(p)||ts.isTryStatement(p)||ts.isArrowFunction(p))parents.push(ts.SyntaxKind[p.kind]);p=p.parent}
   out.push({callee:n.expression.getText(ast),arg0:n.arguments[0]&&ts.isStringLiteral(n.arguments[0])?n.arguments[0].text:undefined,line:ast.getLineAndCharacterOfPosition(n.getStart(ast)).line+1,end:ast.getLineAndCharacterOfPosition(n.getEnd()).line+1,parents})
  }ts.forEachChild(n,visit)
 };visit(owner!);return out
}
const path='packages/core/agent-loop/src/agent.ts',orders:any[]=[]
async function order(id:string,method:string,spec:{callee:string,arg0?:string,min?:number}[],meaning:string){
 const all=await calls(path,method),selected=spec.map(s=>all.find(c=>c.callee===s.callee&&(s.arg0===undefined||c.arg0===s.arg0)&&c.line>=(s.min??0)))
 assert.ok(selected.every(Boolean),JSON.stringify({id,spec,all}))
 assert.ok(selected.every((c,i)=>i===0||c.line>selected[i-1].line),id)
 orders.push({id,path,method,selected,meaning,limit:'AST lexical order is supporting evidence, not execution proof; branch/finally reasoning and cited test assertions reviewed separately'})
}
await order('O1','turn',[{callee:'this.session.append',arg0:'turn/start'},{callee:'this.preStep'},{callee:'this.session.append',arg0:'step/start'},{callee:'this.step'},{callee:'this.session.append',arg0:'step/end'},{callee:'this.dispatch.serial'},{callee:'this.session.append',arg0:'turn/end'}],'正常分支：Turn 先打开；reject 提前返回但外层 finally 关 Turn；Step finally 关 Step，随后才停止检查')
await order('O2','preStep',[{callee:'this.inbox.claim'},{callee:'this.loopCtx.tools.resolve'},{callee:'this.loopCtx.systemPrompt.assemble'},{callee:'this.dispatch.waterfall'}],'模型选择在 claim 后读取；工具与提示材料先准备，之后才进入 pre-step 接纳扩展点')
await order('O3','step',[{callee:'this.prepareRequest'},{callee:'this.session.append',arg0:'user/message'},{callee:'this.buildRequest'},{callee:'preparedCall?.stream'},{callee:'this.session.append',arg0:'assistant/message',min:560},{callee:'this.loopCtx.tools.execute'}],'默认已注册适配器且成功流：模型调用准备先于用户消息提交；成功助手消息提交先于工具分派；catch 中断/attempt 是不同分支')
await order('O4','buildRequest',[{callee:'this.session.append',arg0:'request/header'},{callee:'session.append',arg0:'request/context'},{callee:'session.deriveMessages'}],'header/context 在各自条件中按需追加；派生历史在其后，不能画成每步强制新增快照')
const streamPath='packages/core/agent-loop/src/assistant-stream.ts',settle=await calls(streamPath,'settle')
assert.ok(settle.find(c=>c.callee==='append').line<settle.find(c=>c.callee==='this.emit').line)
orders.push({id:'O5',path:streamPath,method:'settle',selected:settle,meaning:'append 成功后发 committed end；append 抛出时 catch 调 abandon，不得把两条分支合并'})
const batchPath='packages/core/tools/src/batch.ts',{text:batch,ast}=await source(batchPath)
const batchCalls:any[]=[]
const visit=(n:ts.Node)=>{const line=ast.getLineAndCharacterOfPosition(n.getStart(ast)).line+1;if(ts.isCallExpression(n)&&line>=154&&line<=170)batchCalls.push({callee:n.expression.getText(ast),line});ts.forEachChild(n,visit)};visit(ast)
assert.ok(batchCalls.find(c=>c.callee==='settlement.start').line<batchCalls.find(c=>c.callee==='pipeline.prepare').line)
assert.ok(batchCalls.find(c=>c.callee==='pipeline.prepare').line<batchCalls.find(c=>c.callee==='pipeline.dispatch').line)
orders.push({id:'O6',path:batchPath,method:'runGroup.startCall',selected:batchCalls,meaning:'tool/call 起始记录先于 prepare；只有 dispatch 分支启动主体，不把起始记录当成功'})
await writeFile(resolve(root,'evidence/control-flow.json'),JSON.stringify({commit:'f3803c96974ad4a94195fb97e5c637e9c2a3afe3',status:'AST_ORDER_VERIFIED_REQUIRES_SEMANTIC_REVIEW',files:[...seen].map(([path,v])=>({path,sha256:createHash('sha256').update(v.text).digest('hex')})),orders},null,2)+'\n')
console.log('PASS: 6 actual AST order checks; branch semantics and official test reading are separate evidence')
