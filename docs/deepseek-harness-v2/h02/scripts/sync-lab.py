"""单一实验源同步到 H02 折叠代码与答案；只写本课。"""
from pathlib import Path
import subprocess,re,json
repo=Path(__file__).resolve().parents[4]
p=repo/'course-content/internal/deepseek-harness/h02/lesson.md'
lab=p.parent/'lab/navigate.mjs'
s=p.read_text(encoding='utf-8')
code=lab.read_text(encoding='utf-8').rstrip()
answer=subprocess.check_output(['node','--input-type=module','-e',"import {reference} from './course-content/internal/deepseek-harness/h02/lab/navigate.mjs'; console.log(JSON.stringify(reference,null,2))"],cwd=repo).decode('utf-8').rstrip()
if '__H02_LAB_CODE__' in s:s=s.replace('__H02_LAB_CODE__',code)
else:
 s,n=re.subn(r'(:::deepdive\{title="完整校验程序：复制到 navigate.mjs"\}[\s\S]*?```javascript\n)[\s\S]*?(\n```\n:::)',lambda m:m[1]+code+m[2],s,count=1);assert n==1
if '__H02_REFERENCE_JSON__' in s:s=s.replace('__H02_REFERENCE_JSON__',answer)
else:
 s,n=re.subn(r'(:::deepdive\{title="练习 B 完整参考答案与三层图"\}[\s\S]*?```json\n)[\s\S]*?(\n```)',lambda m:m[1]+answer+m[2],s,count=1);assert n==1
s=s.replace('LOCKED/','https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/')
p.write_text(s,encoding='utf-8')
(p.parent/'lab/reference-answer.json').write_text(answer+'\n',encoding='utf-8')
print('H02 complete lab and answer synchronized; all links fixed to Commit')
