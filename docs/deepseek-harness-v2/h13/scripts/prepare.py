"""只创建 H13 文件；复用已有验证脚本而不修改原课。"""
from pathlib import Path
R=Path(__file__).resolve().parents[1]; P=R.parents[2]
for d in ['evidence','figures/qa','scripts']:(R/d).mkdir(parents=True,exist_ok=True)
L=P/'course-content/internal/deepseek-harness/h13/lab'
if (L/'requests.ts').exists():raise SystemExit('Scaffold already developed; use individual documented generators, never overwrite final labs.')
L.mkdir(parents=True,exist_ok=True)
for name in ['bootstrap.mjs','support.ts']:
 s=(P/'course-content/internal/deepseek-harness/h12/lab'/name).read_text(encoding='utf-8').replace('H12','H13')
 if name=='support.ts':
  s=s[:s.index('export function registerRead')]
  s=s.replace("import { defineContentToolFixture } from '@deepseek-ai/dsh-tool-testkit';",'')
  s=s.replace("export const gate = () => Promise.withResolvers<void>();","export const gate = <T = void>() => Promise.withResolvers<T>();")
  s=s.replace("text = '请读取 README，并简要介绍这个项目。'","text = '请计算 2、4、6 的总和与数量。'")
 (L/name).write_text(s,encoding='utf-8')
for name in ['check-sources.py','make-reading-preview.tsx','preview-and-qa.tsx','run-labs.mjs','sync-lab.py']:
 s=(P/'docs/deepseek-harness-v2/h12/scripts'/name).read_text(encoding='utf-8').replace('h12','h13').replace('H12','H13')
 s=s.replace('LLM Adapter 与流式响应：模型输出如何进入 Harness？','Tool Registry：工具定义、Schema、作用域与步骤准入')
 s=s.replace("'docs/architecture.zh.md',","'docs/subsystems/tools.zh.md','docs/cookbook/adding-a-tool.zh.md','docs/architecture.zh.md',")
 if name=='run-labs.mjs':
  s=s.replace('streaming.test.ts','registry.test.ts').replace('assert.equal(count, 49);','assert.ok(count >= 25);')
  s=s.replace("A: '1 minimal AsyncIterable example; no Harness simulation'","A: 'NOT_RUN standalone; controlled models and arithmetic bodies are fixtures in C/D'")
  s=s.replace("C: '33 actual Assembler/Accumulator/Message/Runtime/official translator component tests; local scripted adapter'","C: 'See test IDs C01–C30 in registry.test.ts; actual ToolsService/defineTool/Scope/Native pipeline components'")
  s=s.replace("D: '15 real Loop + SystemPrompt + Session + controlled Adapter integrations; fixed tool only'","D: 'See test IDs D01–D06; real ToolsService + SystemPrompt + AgentLoop + in-memory Session + Mock Adapter + Native executor'")
  s=s.replace('错误答案保留max-tokens工具调用','错误答案把旧准入当永久许可')
 if name=='preview-and-qa.tsx':
  s=s.replace("['最小异步例子','iterable.ts'],",'').replace("['实践 A 完整程序','assembly.ts']","['实践 A 完整程序','definitions.ts']").replace("['实践 B 完整程序','runtime.ts']","['实践 B 完整程序','scopes.ts']").replace("['实践 C 完整程序','settlement.ts']","['实践 C 完整程序','admission.ts']").replace("['实践 D 完整程序','chain.ts']","['实践 D 完整程序','requests.ts']").replace("file==='runtime.ts'","file==='scopes.ts'")
 (R/'scripts'/name).write_text(s,encoding='utf-8')
print('H13 author scaffold ready')
