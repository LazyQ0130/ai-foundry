"""单一实验源同步到 H04 折叠代码与答案；只写本课。"""
from pathlib import Path
import subprocess,re,json
repo=Path(__file__).resolve().parents[4]
p=repo/'course-content/internal/deepseek-harness/h04/lesson.md'
lab=p.parent/'lab/launch-lab.mjs'
s=p.read_text(encoding='utf-8')
code=lab.read_text(encoding='utf-8').rstrip()
answer=subprocess.check_output(['node','--input-type=module','-e',"import {reference} from './course-content/internal/deepseek-harness/h04/lab/launch-lab.mjs'; console.log(JSON.stringify(reference,null,2))"],cwd=repo).decode('utf-8').rstrip()
if '__H04_LAB_CODE__' in s:s=s.replace('__H04_LAB_CODE__',code)
else:
 s,n=re.subn(r'(:::deepdive\{title="完整校验程序：复制到 launch-lab.mjs"\}[\s\S]*?```javascript\n)[\s\S]*?(\n```\n:::)',lambda m:m[1]+code+m[2],s,count=1);assert n==1
if '__H04_REFERENCE_JSON__' in s:s=s.replace('__H04_REFERENCE_JSON__',answer)
else:
 s,n=re.subn(r'(:::deepdive\{title="A 与 B 完整参考答案"\}[\s\S]*?```json\n)[\s\S]*?(\n```)',lambda m:m[1]+answer+m[2],s,count=1);assert n==1
worksheet=json.loads(answer)
for v in worksheet['A'].values():
 for k in v:v[k]=[] if isinstance(v[k],list) else ''
for k,v in worksheet['B'].items():worksheet['B'][k]=[] if isinstance(v,list) else ''
s=s.replace('__H04_WORKSHEET_JSON__',json.dumps(worksheet,ensure_ascii=False,indent=2))
s=s.replace('LOCKED/','https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/')
p.write_text(s,encoding='utf-8')
(p.parent/'lab/reference-answer.json').write_text(answer+'\n',encoding='utf-8')
print('H04 complete lab and answer synchronized; all links fixed to Commit')
