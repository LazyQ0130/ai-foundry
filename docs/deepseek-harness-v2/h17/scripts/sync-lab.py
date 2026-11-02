from pathlib import Path
import re
R=Path(__file__).resolve().parents[1];P=R.parents[2];lesson=P/'course-content/internal/deepseek-harness/h17/lesson.md';s=lesson.read_text(encoding='utf-8')
for name in ['bootstrap.mjs','support.ts','append.ts','surface.ts','projection.ts','agent.ts','trace.ts','demo.ts']:
 a=f'<!-- code:{name}:start -->';b=f'<!-- code:{name}:end -->';language='javascript' if name.endswith('.mjs') else 'typescript'
 content=a+'\n```'+language+'\n'+(lesson.parent/'lab'/name).read_text(encoding='utf-8').rstrip()+'\n```\n'+b
 assert a in s and b in s;s=re.sub(re.escape(a)+r'.*?'+re.escape(b),lambda _:content,s,flags=re.S)
lesson.write_text(s,encoding='utf-8');print('8 complete programs synchronized')
