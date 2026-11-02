from pathlib import Path
R=Path(__file__).resolve().parents[1];P=R.parents[2];L=P/'course-content/internal/deepseek-harness/h16/lab'
if (L/'support.ts').exists():raise SystemExit('Developed H16 exists; do not overwrite.')
L.mkdir(parents=True,exist_ok=True)
for name in ['snapshot.py','check-sources.py','make-reading-preview.tsx','preview-and-qa.tsx','sync-lab.py','run-labs.mjs','run-checks.mjs','final-audit.py']:
 s=(P/'docs/deepseek-harness-v2/h15/scripts'/name).read_text(encoding='utf-8').replace('h15','h16').replace('H15','H16')
 s=s.replace('Agent 安全执行：审批、权限、沙箱与文件系统守卫','Agent 工具生态：File、Shell、Web 与 MCP 的组合实践').replace('safety.test.ts','ecosystem.test.ts')
 (R/'scripts'/name).write_text(s,encoding='utf-8')
print('H16 author scaffold')
