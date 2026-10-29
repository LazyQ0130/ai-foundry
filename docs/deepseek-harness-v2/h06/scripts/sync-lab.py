"""完整受测文件和五个短示例逐字同步；不修改实验语义。"""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1];REPO=ROOT.parents[2]
p=REPO/'course-content/internal/deepseek-harness/h06/lesson.md';s=p.read_text(encoding='utf8')
def fill(kind,name,body):
 global s
 a=f'<!-- {kind}:{name}:start -->';b=f'<!-- {kind}:{name}:end -->'
 assert s.count(a)==s.count(b)==1,(kind,name)
 s=re.sub(re.escape(a)+r'[\s\S]*?'+re.escape(b),lambda _:a+'\n```typescript\n'+body.rstrip()+'\n```\n'+b,s)
for f in ['support.ts','modes.ts','request.ts','demo.ts']:fill('code',f,(p.parent/'lab'/f).read_text(encoding='utf8'))
modes=(p.parent/'lab/modes.ts').read_text(encoding='utf8')
for mode in ['emit','parallel','serial','bail','waterfall']:
 body=modes.split(f'// snippet:{mode}:start\n')[1].split(f'// snippet:{mode}:end')[0]
 fill('snippet',mode,body)
p.write_text(s,encoding='utf8');print('4 full files + 5 exact snippets synced')
