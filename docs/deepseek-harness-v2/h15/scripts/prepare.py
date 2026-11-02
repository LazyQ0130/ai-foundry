from pathlib import Path
R=Path(__file__).resolve().parents[1]; P=R.parents[2]; L=P/'course-content/internal/deepseek-harness/h15/lab'
if (L/'support.ts').exists(): raise SystemExit('H15 already prepared; do not overwrite.')
L.mkdir(parents=True,exist_ok=True)
for d in ['evidence','figures/qa']:(R/d).mkdir(parents=True,exist_ok=True)
for name in ['check-sources.py','make-reading-preview.tsx','preview-and-qa.tsx','run-labs.mjs','run-checks.mjs','sync-lab.py','final-audit.py']:
 s=(P/'docs/deepseek-harness-v2/h14/scripts'/name).read_text(encoding='utf-8').replace('h14','h15').replace('H14','H15')
 s=s.replace('工具执行流水线：从模型调用到结果返回','Agent 安全执行：审批、权限、沙箱与文件系统守卫').replace('pipeline.test.ts','safety.test.ts')
 (R/'scripts'/name).write_text(s,encoding='utf-8')
print('H15 preview/check scaffold prepared')
