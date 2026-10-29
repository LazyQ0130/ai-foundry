"""五个完整受测程序逐字同步；不修改实验语义。"""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1];REPO=ROOT.parents[2]
p=REPO/'course-content/internal/deepseek-harness/h07/lesson.md';s=p.read_text(encoding='utf8')
def fill(kind,name,body):
 global s
 a=f'<!-- {kind}:{name}:start -->';b=f'<!-- {kind}:{name}:end -->'
 assert s.count(a)==s.count(b)==1,(kind,name)
 s=re.sub(re.escape(a)+r'[\s\S]*?'+re.escape(b),lambda _:a+'\n```typescript\n'+body.rstrip()+'\n```\n'+b,s)
for f in ['support.ts','states.ts','resources.ts','dependencies.ts','demo.ts']:fill('code',f,(p.parent/'lab'/f).read_text(encoding='utf8'))
p.write_text(s,encoding='utf8');print('5 full files synced')
