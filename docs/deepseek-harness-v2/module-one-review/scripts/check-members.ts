/** 防止链接指向正确文件却给出不存在的类名；AST 定位所属类与调用。 */
import ts from 'typescript'
import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
const root=fileURLToPath(new URL('../',import.meta.url))
const lock=JSON.parse(await readFile(resolve(root,'../evidence/source-lock.json'),'utf8'))
const found:any[]=[]
for(const [path,owner,member] of [
 ['packages/llm/llm/src/index.ts','LlmRuntime','prepareCall'],
 ['packages/core/tools/src/index.ts','ToolsService','constructor']]){
 const text=await readFile(resolve(process.env.HARNESS_SOURCE_CACHE??lock.sourceCache,path),'utf8')
 const ast=ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true)
 let klass:ts.ClassDeclaration|undefined
 const walk=(n:ts.Node)=>{if(ts.isClassDeclaration(n)&&n.name?.text===owner)klass=n;ts.forEachChild(n,walk)};walk(ast)
 assert.ok(klass,owner)
 const method=klass.members.find(n=>member==='constructor'?ts.isConstructorDeclaration(n):ts.isMethodDeclaration(n)&&n.name.getText(ast)===member)
 assert.ok(method,`${owner}.${member}`)
 if(member==='constructor'){
  const calls:ts.CallExpression[]=[]
  const visit=(n:ts.Node)=>{if(ts.isCallExpression(n))calls.push(n);ts.forEachChild(n,visit)};visit(method)
  assert.ok(calls.some(c=>c.expression.kind===ts.SyntaxKind.SuperKeyword&&c.arguments[0]?.getText(ast)==='ctx'&&c.arguments[1]?.getText(ast)==="'tools'"))
 }
 found.push({path,owner,member,classLine:ast.getLineAndCharacterOfPosition(klass.getStart(ast)).line+1,memberLine:ast.getLineAndCharacterOfPosition(method.getStart(ast)).line+1})
}
await writeFile(resolve(root,'evidence/member-check.json'),JSON.stringify({status:'PASS',commit:lock.commit,checks:found,limit:'AST locates declaration and constructor registration; behavior still reviewed in source-review.md'},null,2)+'\n')
console.log('PASS: LlmRuntime.prepareCall owner and ToolsService constructor registration')
