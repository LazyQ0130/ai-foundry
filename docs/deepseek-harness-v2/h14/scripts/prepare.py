from pathlib import Path
R=Path(__file__).resolve().parents[1];P=R.parents[2];L=P/'course-content/internal/deepseek-harness/h14/lab'
if (L/'flow.ts').exists():raise SystemExit('Developed H14 exists; do not overwrite.')
L.mkdir(parents=True,exist_ok=True)
for d in ['evidence','figures/qa']:(R/d).mkdir(parents=True,exist_ok=True)
(L/'bootstrap.mjs').write_text((P/'course-content/internal/deepseek-harness/h13/lab/bootstrap.mjs').read_text(encoding='utf-8').replace('H13','H14'),encoding='utf-8')
for name in ['check-sources.py','make-reading-preview.tsx','preview-and-qa.tsx','run-labs.mjs','run-checks.mjs','sync-lab.py']:
 s=(P/'docs/deepseek-harness-v2/h13/scripts'/name).read_text(encoding='utf-8').replace('h13','h14').replace('H13','H14')
 s=s.replace('Tool Registry：工具定义、Schema、作用域与步骤准入','工具执行流水线：从模型调用到结果返回')
 s=s.replace("'docs/subsystems/tools.zh.md',","'docs/tool-execution-pipeline.zh.md','docs/subsystems/tools.zh.md',")
 s=s.replace('registry.test.ts','pipeline.test.ts')
 if name=='sync-lab.py':s=s.replace("'support.ts','progressive.ts','definitions.ts','scopes.ts','admission.ts','requests.ts','demo.ts'","'support.ts','flow.ts','scheduling.ts','failures.ts','requests.ts','demo.ts'").replace('Seven','Six')
 if name=='preview-and-qa.tsx':s=s.replace("['渐进示例完整程序','progressive.ts'],",'').replace('definitions.ts','flow.ts').replace('scopes.ts','scheduling.ts').replace('admission.ts','failures.ts').replace('seven full','six full')
 (R/'scripts'/name).write_text(s,encoding='utf-8')
print('H14 scaffold')
