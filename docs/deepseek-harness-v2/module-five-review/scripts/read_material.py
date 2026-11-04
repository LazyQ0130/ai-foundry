from pathlib import Path
import sys,re,json,hashlib
root=Path(__file__).resolve().parents[4]
p=root/sys.argv[1]
s=p.read_text(encoding='utf-8-sig')
# Source URL prefixes are expanded again in the source documents. No prose is summarized.
s=re.sub(r'https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/', 'FIXED/', s)
if '--prose' in sys.argv:
    # Embedded complete programs are reviewed separately from the identical lab files.
    s=re.sub(r'<!-- code:([^:]+):start -->[\s\S]*?<!-- code:\1:end -->', r'[完整程序另读 lab/\1]',s)
s='\n'.join(x for x in s.splitlines() if x.strip())
size=12500
part=int(sys.argv[2]) if len(sys.argv)>2 else 1
print(f'{p} PART {part}/{(len(s)+size-1)//size} ({len(s)} chars)')
print(s[(part-1)*size:part*size])
