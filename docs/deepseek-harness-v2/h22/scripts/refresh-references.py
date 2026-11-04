from pathlib import Path
import json,re
R=Path(__file__).resolve().parents[1];P=R.parents[2];lesson=P/'course-content/internal/deepseek-harness/h22/lesson.md'
claims={r['claim']:r for r in json.loads((R/'evidence/source-assertions.json').read_text(encoding='utf-8'))}
def link(m):
 c=claims[m[1]]
 return f"[{c['claim']} · {c['symbol']}](https://github.com/deepseek-ai/deepseek-harness/blob/{c['commit']}/{c['file']}#L{c['start']}-L{c['end']})"
s=lesson.read_text(encoding='utf-8');s=re.sub(r'\{\{(S\d{2})\}\}',link,s);s,n=re.subn(r'\[(S\d{2}) · [^\]]+\]\(https://github.com/[^)]+\)',link,s);assert n>20
lesson.write_text(s,encoding='utf-8');print(n,'current fixed-commit references synchronized')
