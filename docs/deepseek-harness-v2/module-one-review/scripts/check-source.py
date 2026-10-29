"""本轮引用与历史断言的固定 Git blob 重核；静态完整性不冒充语义或套件运行。"""
from pathlib import Path
import hashlib, json, os, re, subprocess
ROOT=Path(__file__).resolve().parents[1]; REPO=ROOT.parents[2]
COMMIT='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
lock=json.loads((ROOT.parent/'evidence/source-lock.json').read_text(encoding='utf-8-sig'))
CACHE=Path(os.environ.get('HARNESS_SOURCE_CACHE',lock['sourceCache']))
GIT=Path(os.environ.get('HARNESS_GIT_CACHE',str(CACHE.parents[1]/'deepseek-harness-f3803c9')))
tree={}
for row in subprocess.check_output(['git','-C',str(GIT),'ls-tree','-r','-z',COMMIT]).split(b'\0'):
 if row:
  meta,p=row.split(b'\t',1);tree[p.decode()]=meta.split()[2].decode()
files={}
def check(p,a,b):
 if p not in files:
  data=(CACHE/p).read_bytes();blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
  assert blob==tree[p],p
  files[p]={'sha256':hashlib.sha256(data).hexdigest(),'gitBlob':blob,'lines':len(data.decode('utf-8').splitlines())}
 assert 1<=a<=b<=files[p]['lines'],(p,a,b)
refs=[]; lessons=[]; claims=[]
for h in ['h01','h02','h03','h04']:
 p=REPO/f'course-content/internal/deepseek-harness/{h}/lesson.md';s=p.read_text(encoding='utf-8')
 urls=sorted(set(re.findall(r'https://github\.com/deepseek-ai/deepseek-harness/blob/[^\s)]+',s)))
 for url in urls:
  m=re.fullmatch(r'https://github\.com/deepseek-ai/deepseek-harness/blob/([a-f0-9]{40})/(.+)#L(\d+)-L(\d+)',url); assert m,url
  commit,f,a,b=m.groups();a,b=int(a),int(b);assert commit==COMMIT;check(f,a,b)
  refs.append({'lesson':h,'path':f,'start':a,'end':b,'url':url})
 old=json.loads((ROOT.parent/h/'evidence/source-check.json').read_text(encoding='utf-8'))
 assert old['commit']==COMMIT
 for c in old['claims']:
  check(c['path'],c['start'],c['end']);claims.append({'lesson':h,**c})
  if isinstance(c.get('test'),dict):
   t=c['test'];check(t['path'],t['start'],t['end'])
 for entry in old.get('files',[]):
  check(entry['path'],1,1);assert files[entry['path']]['sha256']==entry['sha256']
 lessons.append({'lesson':h,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'references':len(urls),'historicalClaimsRechecked':len(old['claims'])})
# 新增的同一服务例证，以及错误类名的所属类 AST 在 check-members.ts 再核。
assert 'LlmService' not in (REPO/'course-content/internal/deepseek-harness/h03/lesson.md').read_text(encoding='utf-8')
for f,a,b in [('packages/core/tools/src/index.ts',99,118),('packages/llm/llm/src/index.ts',354,354),('packages/llm/llm/src/index.ts',960,1017)]: check(f,a,b)
reviewRefs=[]
for doc in ROOT.glob('*.md'):
 for url in sorted(set(re.findall(r'https://github\.com/deepseek-ai/deepseek-harness/blob/[^\s)]+',doc.read_text(encoding='utf-8')))):
  m=re.fullmatch(r'https://github\.com/deepseek-ai/deepseek-harness/blob/([a-f0-9]{40})/(.+)#L(\d+)-L(\d+)',url);assert m,url
  commit,f,a,b=m.groups();a,b=int(a),int(b);assert commit==COMMIT;check(f,a,b)
  reviewRefs.append({'document':doc.name,'path':f,'start':a,'end':b,'url':url})
report={'status':'STATIC_INTEGRITY_VERIFIED','commit':COMMIT,'sourceCache':str(CACHE),'lessons':lessons,'references':refs,'reviewReferences':reviewRefs,'historicalClaims':claims,'files':files,'semanticReview':'source-review.md: implementation branches + selected official test assertions read by same author; lexical anchors alone are insufficient','upstreamSuite':'NOT_RUN','realModels':'NOT_RUN'}
(ROOT/'evidence/source-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'references':len(refs),'claims':len(claims),'files':len(files),'status':report['status']}))
