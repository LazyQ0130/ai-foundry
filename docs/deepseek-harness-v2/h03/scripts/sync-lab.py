"""单一实验源同步到 H03 折叠代码与答案；只写本课。"""
from pathlib import Path
import subprocess,re,json
repo=Path(__file__).resolve().parents[4]
p=repo/'course-content/internal/deepseek-harness/h03/lesson.md'
lab=p.parent/'lab/trace.mjs'
s=p.read_text(encoding='utf-8')
code=lab.read_text(encoding='utf-8').rstrip()
answer=subprocess.check_output(['node','--input-type=module','-e',"import {expected} from './course-content/internal/deepseek-harness/h03/lab/trace.mjs'; console.log(JSON.stringify(expected,null,2))"],cwd=repo).decode('utf-8').rstrip()
if '__H03_LAB_CODE__' in s:s=s.replace('__H03_LAB_CODE__',code)
else:
 s,n=re.subn(r'(:::deepdive\{title="完整追踪程序：复制到 trace.mjs"\}[\s\S]*?```javascript\n)[\s\S]*?(\n```\n:::)',lambda m:m[1]+code+m[2],s,count=1);assert n==1
if '__H03_REFERENCE_JSON__' in s:s=s.replace('__H03_REFERENCE_JSON__',answer)
else:
 s,n=re.subn(r'(:::deepdive\{title="实验参考答案：计数与结果解释"\}[\s\S]*?```json\n)[\s\S]*?(\n```)',lambda m:m[1]+answer+m[2],s,count=1);assert n==1
s=s.replace('LOCKED/','https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/')
p.write_text(s,encoding='utf-8')
(p.parent/'lab/reference-answer.json').write_text(answer+'\n',encoding='utf-8')
print('H03 complete lab and answer synchronized; all links fixed to Commit')
