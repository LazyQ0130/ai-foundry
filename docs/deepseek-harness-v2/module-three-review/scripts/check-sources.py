"""Byte/range/provenance checks only; semantic review is in source-review.md."""
from pathlib import Path
import hashlib,json,os,re,subprocess
ROOT=Path(__file__).resolve().parents[1]; REPO=ROOT.parents[2]; E=ROOT/'evidence'
COMMIT='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
lock=json.loads((ROOT.parent/'h12/evidence/source-lock.json').read_text(encoding='utf-8'))
SOURCE=Path(os.environ.get('HARNESS_SOURCE_CACHE',lock['sourceCache'])); GIT=Path(lock['gitCache'])
tree=subprocess.check_output(['git','-C',str(GIT),'ls-tree','-r',COMMIT],text=True)
blobs={l.split('\t')[1]:l.split()[2] for l in tree.splitlines()}
verified={}
for h in ['h09','h10','h11','h12']:
 l=json.loads((ROOT.parent/h/'evidence/source-lock.json').read_text(encoding='utf-8'));assert l['commit']==COMMIT
 for f in l['files']:
  data=(SOURCE/f['path']).read_bytes();sha=hashlib.sha256(data).hexdigest()
  assert sha==f['sha256'],f['path']
  blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest();assert blob==blobs[f['path']]
  verified[f['path']]={'sha256':sha,'gitBlob':blob,'lines':len(data.splitlines())}
refs=[];assertions=[]
for h in ['h09','h10','h11','h12']:
 for p in [REPO/f'course-content/internal/deepseek-harness/{h}/lesson.md',ROOT.parent/h/'source-checklist.md']:
  for m in re.finditer(r'/blob/([0-9a-f]{40})/([^\s)#]+)#L(\d+)(?:-L(\d+))?',p.read_text(encoding='utf-8')):
   commit,path,start,end=m.groups();start=int(start);end=int(end or start)
   assert commit==COMMIT;assert 1<=start<=end<=len((SOURCE/path).read_bytes().splitlines()),(p,path,start,end)
   refs.append({'document':p.relative_to(REPO).as_posix(),'path':path,'start':start,'end':end})
 data=json.loads((ROOT.parent/h/'evidence/source-assertions.json').read_text(encoding='utf-8'))
 for a in data['assertions']:
  path=a.get('source',a.get('path'));start,end=a.get('lines',[a.get('start'),a.get('end')]);assert 1<=start<=end<=verified[path]['lines']
  t=a['officialTest'];ts,te=t.get('lines',[t.get('start'),t.get('end')]);assert 1<=ts<=te<=len((SOURCE/t['path']).read_bytes().splitlines())
  assertions.append({**a,'auditIdentity':'PASS','auditRange':'PASS','behaviorStatus':'fresh author tests where mapped; STATIC_ONLY remains static; see source-review.md'})
# Preparation inventory is checked against untouched original artifacts, not the new audit.
prep=json.loads((ROOT.parent/'h12/module-three-review-prep/artifact-inventory.json').read_text(encoding='utf-8'))
for item in prep['materials']:
 assert hashlib.sha256((REPO/item['path']).read_bytes()).hexdigest()==item['sha256'],item['path']
result={'status':'PASS','commit':COMMIT,'sourceCache':str(SOURCE),'gitCache':str(GIT),'verifiedFiles':verified,'references':refs,'assertions':assertions,'prepMaterialsChecked':len(prep['materials']),'boundary':'No automatic semantic PASS from bytes, AST, keywords or line bounds'}
(E/'source-check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':'PASS','files':len(verified),'references':len(refs),'assertions':len(assertions),'prepShape':type(prep).__name__}))
