"""核锁定缓存字节与 Git blob；不运行上游带递归清理的测试。"""
from pathlib import Path
import os,json,hashlib,subprocess,re
ROOT=Path(__file__).resolve().parents[1]; REPO=ROOT.parents[2]
COMMIT='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
SOURCE=Path(os.environ.get('HARNESS_SOURCE_CACHE',r'C:\Users\QYF\.codex\research\harness-v2-source\deepseek-harness-'+COMMIT))
GIT=Path(os.environ.get('HARNESS_GIT_CACHE',r'C:\Users\QYF\.codex\research\deepseek-harness-f3803c9'))
tree=subprocess.check_output(['git','-C',str(GIT),'ls-tree','-r',COMMIT],text=True)
blobs={line.split('\t',1)[1]:line.split()[2] for line in tree.splitlines() if '\t' in line}
prefixes=('vendor/','packages/core/','packages/session/','packages/llm/','packages/util/','packages/test-support/','packages/fs/','packages/ptc/')
docs=['docs/architecture.zh.md','docs/agent-lifecycle.zh.md','docs/subsystems/core.zh.md','docs/cordis-tutorial/06-composition-and-hmr.zh.md','docs/subsystems/boot.zh.md','SAFETY.zh.md','LICENSE','package.json','tsconfig.base.json','pnpm-lock.yaml']
paths=sorted(p for p in blobs if (p.startswith(prefixes) and (p.endswith(('.ts','.mjs','.yml','.yaml','.json','.md','LICENSE')))) or p in docs)
files=[]
for path in paths:
 data=(SOURCE/path).read_bytes(); blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
 assert blob==blobs[path],path
 files.append({'path':path,'sha256':hashlib.sha256(data).hexdigest(),'gitBlob':blob,'lines':len(data.splitlines())})
lock={'repository':'https://github.com/deepseek-ai/deepseek-harness','commit':COMMIT,'rootVersion':'0.2.2-alpha.2','cordisVersion':'4.0.6-alpha.1','sourceCache':str(SOURCE),'gitCache':str(GIT),'files':files,'method':'SHA1 Git blob against fixed ls-tree and SHA256 before runtime'}
(ROOT/'evidence/source-lock.json').write_text(json.dumps(lock,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
refs=[]
for name in ['course-content/internal/deepseek-harness/h10/lesson.md','docs/deepseek-harness-v2/h10/source-checklist.md']:
 p=REPO/name
 if not p.exists():continue
 for match in re.finditer(r'/blob/('+COMMIT+r')/([^\s)#]+)#L(\d+)-L(\d+)',p.read_text(encoding='utf-8')):
  _,path,a,b=match.groups(); lines=(SOURCE/path).read_text(encoding='utf-8').splitlines();assert 1<=int(a)<=int(b)<=len(lines),(path,a,b)
  refs.append({'file':name,'path':path,'start':int(a),'end':int(b)})
(ROOT/'evidence/source-check.json').write_text(json.dumps({'status':'PASS','commit':COMMIT,'files':len(files),'references':refs,'meaning':'Byte/range integrity only; semantic review in source-checklist. Official tests selected/read, not executed.'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'PASS: {len(files)} fixed source/config/document files, {len(refs)} bounded references')
