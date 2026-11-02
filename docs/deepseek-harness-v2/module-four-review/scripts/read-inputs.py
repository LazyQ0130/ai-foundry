from pathlib import Path
import re,json,hashlib,sys
sys.stdout.reconfigure(encoding='utf-8')
R=Path(__file__).resolve().parents[1]; P=R.parents[2]
def compact(s):
    return re.sub(r'https://github.com/deepseek-ai/deepseek-harness/blob/[0-9a-f]{40}/', 'SOURCE/', s)
if sys.argv[1]=='blueprint':
    s=(P/'docs/deepseek-harness-v2/A-blueprint-v2.md').read_text(encoding='utf-8')
    parts=re.split(r'(?=^## H\d\d\s*$)',s,flags=re.M)
    a,b=map(int,sys.argv[2:4]); print(compact(''.join(parts[a:b])))
elif sys.argv[1]=='lesson':
    s=(P/f'course-content/internal/deepseek-harness/h{sys.argv[2]}/lesson.md').read_text(encoding='utf-8')
    if len(sys.argv)>3 and sys.argv[3]=='prose': s=re.sub(r'^```[^\n]*\n.*?^```\s*$', '[完整程序另读 lab 文件]', s, flags=re.M|re.S)
    s=compact(s)
    if len(sys.argv)>4:
        n=int(sys.argv[4]); size=7000; s=s[n*size:(n+1)*size]
    print(s)
else:
    print(compact((P/sys.argv[1]).read_text(encoding='utf-8')))
