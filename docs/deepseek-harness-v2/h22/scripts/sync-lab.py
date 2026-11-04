from pathlib import Path
import re
R=Path(__file__).resolve().parents[1];P=R.parents[2];lesson=P/'course-content/internal/deepseek-harness/h22/lesson.md';s=lesson.read_text(encoding='utf-8')
names=re.findall(r'<!-- code:([^:]+):start -->',s)
for name in names:
 a=f'<!-- code:{name}:start -->';b=f'<!-- code:{name}:end -->';language='javascript' if name.endswith('.mjs') else 'typescript'
 content=a+'\n```'+language+'\n'+(lesson.parent/'lab'/name).read_text(encoding='utf-8').rstrip()+'\n```\n'+b
 assert a in s and b in s;s=re.sub(re.escape(a)+r'.*?'+re.escape(b),lambda _:content,s,flags=re.S)
lesson.write_text(s,encoding='utf-8');print(f'{len(names)} complete programs synchronized')
