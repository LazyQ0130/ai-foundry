"""把受测程序逐字插入明确的课文代码区域；保留可审查标记。"""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]; REPO=ROOT.parents[2]
lesson=REPO/'course-content/internal/deepseek-harness/h05/lesson.md'
s=lesson.read_text(encoding='utf8')
for f in ['greeter.ts','consumer.ts','demo.ts','a-starter.ts','a-reference.ts','lab.test.ts']:
 a=f'<!-- code:{f}:start -->'; b=f'<!-- code:{f}:end -->'
 assert s.count(a)==s.count(b)==1,f
 code=(lesson.parent/'lab'/f).read_text(encoding='utf8').rstrip()
 s=re.sub(re.escape(a)+r'[\s\S]*?'+re.escape(b),lambda _:a+'\n```typescript\n'+code+'\n```\n'+b,s)
lesson.write_text(s,encoding='utf8')
print('Six complete tested files synced to lesson')
