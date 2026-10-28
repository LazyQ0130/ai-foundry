"""只同步正文折叠区的完整教学实验；短摘录另由 check-content 校验。"""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[4]
p=root/'course-content/internal/deepseek-harness/h01/lesson.md'
code=(p.parent/'lab/compare.mjs').read_text(encoding='utf-8').rstrip()
s=p.read_text(encoding='utf-8')
pattern=r'(:::deepdive\{title="完整可运行程序：复制到 compare.mjs"\}[\s\S]*?```javascript\n)[\s\S]*?(\n```\n:::)'
s,n=re.subn(pattern,lambda m:m[1]+code+m[2],s,count=1)
assert n==1
p.write_text(s,encoding='utf-8')
print('exact lab code synchronized into one private lesson fold')
