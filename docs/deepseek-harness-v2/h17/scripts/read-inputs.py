from pathlib import Path
import re,json,hashlib
R=Path(__file__).resolve().parents[1];P=R.parents[2]
names=['A-blueprint-v2.md','E-production-standard.md','module-one-review/README.md','module-two-review/README.md','module-three-review/review-report.md','module-four-review/review-report.md','module-one-review/production-standard-v1.md','module-two-review/production-standard-module-two-addendum.md','module-three-review/production-standard-module-three-addendum.md','module-four-review/production-standard-module-four-addendum.md','module-four-review/h17-h20-handoff.md','h16/module-four-review-prep/h17-prerequisites.md']
paths=[P/'docs/deepseek-harness-v2'/n for n in names]+[P/f'course-content/internal/deepseek-harness/h{n}/lesson.md' for n in ['03','09','10','11','12','14']]
records=[];excerpts=[]
for p in paths:
 s=p.read_text(encoding='utf-8');records.append({'path':p.relative_to(P).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'lines':len(s.splitlines())})
 if p.name=='A-blueprint-v2.md':
  excerpts.append(re.search(r'## H17\n.*?(?=## H21)',s,re.S).group())
 elif p.name=='lesson.md':
  s=re.sub(r'```.*?```','[完整程序省略于阅读摘录]',s,flags=re.S)
  lines=s.splitlines(); selected=set()
  for i,line in enumerate(lines):
   if re.search(r'Session|session|结算|持久|tool/result|tool/call|request/header|deriveMessages|Turn|Step',line):
    selected.update(range(max(0,i-1),min(len(lines),i+2)))
  excerpts.append(str(p.relative_to(P))+'\n'+'\n'.join(lines[i] for i in sorted(selected) if not lines[i].startswith('<!--')))
(R/'evidence/preparation-inputs.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(R/'evidence/prerequisite-reading.txt').write_text('\n\n'.join(excerpts),encoding='utf-8')
print('\n\n'.join(excerpts))
