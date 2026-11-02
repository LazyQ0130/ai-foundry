from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]; REPO=ROOT.parents[2]
lesson=REPO/'course-content/internal/deepseek-harness/h15/lesson.md';lab=lesson.parent/'lab'
s=lesson.read_text(encoding='utf-8')
for name in ['bootstrap.mjs','support.ts','approval.ts','pipeline.ts','sandbox.ts','filesystem.ts','demo.ts']:
 language='javascript' if name.endswith('.mjs') else 'typescript'
 a=f'<!-- code:{name}:start -->';b=f'<!-- code:{name}:end -->'
 content=f'{a}\n```{language}\n{(lab/name).read_text(encoding="utf-8").rstrip()}\n```\n{b}'
 s=re.sub(re.escape(a)+r'.*?'+re.escape(b),lambda _:content,s,flags=re.S)
lesson.write_text(s,encoding='utf-8')
print('Seven full programs synchronized')
