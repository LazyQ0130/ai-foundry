"""固定版本字节、引用范围、准备包历史哈希；不把静态检查当行为证明。"""
from pathlib import Path
import hashlib, json, re, subprocess
ROOT=Path(__file__).resolve().parents[1]; REPO=ROOT.parents[2]; E=ROOT/'evidence'
commit='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
lock=json.loads((ROOT.parent/'h08/evidence/source-lock.json').read_text(encoding='utf-8'))
source=Path(lock['sourceCache']); git=Path(lock['gitCache'])
tree=subprocess.check_output(['git','-C',str(git),'ls-tree','-r',commit],encoding='utf-8')
blobs={line.split('\t',1)[1]:line.split()[2] for line in tree.splitlines()}
manifest={f['path']:f for f in lock['files']}
for h in ['h05','h06','h07']:
    report=json.loads((ROOT.parent/h/'evidence/source-check.json').read_text(encoding='utf-8'))
    assert report['commit']==commit
    for f in report['files']:
        if f['path'] in manifest: assert manifest[f['path']]['sha256']==f['sha256']
        manifest[f['path']]=f
files=[]
for path,previous in sorted(manifest.items()):
    data=(source/path).read_bytes()
    sha=hashlib.sha256(data).hexdigest()
    blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
    assert sha==previous['sha256'],path
    assert blob==blobs[path]==previous['gitBlob'],path
    files.append({'path':path,'sha256':sha,'gitBlob':blob,'lines':len(data.decode('utf-8-sig').splitlines())})
index={f['path']:f for f in files}; refs=[]
for h in ['h05','h06','h07','h08']:
    s=(REPO/f'course-content/internal/deepseek-harness/{h}/lesson.md').read_text(encoding='utf-8')
    for m in re.finditer(r'https://github.com/deepseek-ai/deepseek-harness/blob/([^/]+)/([^\s)#]+)#L(\d+)(?:-L(\d+))?',s):
        revision,path,start,end=m.groups();start=int(start);end=int(end or start)
        assert revision==commit and 1<=start<=end<=index[path]['lines'],m.group()
        refs.append({'lesson':h,'path':path,'start':start,'end':end,'lessonLine':s[:m.start()].count('\n')+1})
audit_refs=[]
for document in ROOT.glob('*.md'):
    s=document.read_text(encoding='utf-8')
    for m in re.finditer(r'https://github.com/deepseek-ai/deepseek-harness/blob/([^/]+)/([^\s)#]+)#L(\d+)(?:-L(\d+))?',s):
        revision,path,start,end=m.groups();start=int(start);end=int(end or start)
        assert revision==commit and 1<=start<=end<=index[path]['lines'],(document.name,m.group())
        audit_refs.append({'document':document.name,'path':path,'start':start,'end':end})
for h,config in json.loads((ROOT/'workload-input.json').read_text(encoding='utf-8')).items():
    for route in config['coreRoute']:
        for start,end in route['ranges']: assert 1<=start<=end<=index[route['path']]['lines'],(h,route)
# 研发准备包应与修改前材料比较，不能让合法修订抹掉历史快照。
before=json.loads((E/'workspace-before.json').read_text(encoding='utf-8'))
prep=json.loads((ROOT.parent/'h08/module-two-review-prep/artifact-inventory.json').read_text(encoding='utf-8'))
prep_checks=[]
for lesson in prep['lessons']:
    for a in lesson['artifacts']:
        old=E/'before'/a['path'];data=(old if old.exists() else REPO/a['path']).read_bytes()
        assert hashlib.sha256(data).hexdigest()==a['sha256'],a['path']
        prep_checks.append(a['path'])
(E/'source-check.json').write_text(json.dumps({'status':'PASS','commit':commit,'sourceCache':str(source),'gitCache':str(git),'files':files,'references':refs,'auditReferences':audit_refs,'preparedInventoryCheckedAgainstBefore':prep_checks,'method':'Git blob against pinned tree plus SHA256 against historical inventories; all current lesson/report fixed references and core reading ranges within UTF-8 file bounds. Static byte/link checks do not prove semantics.'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PASS:',len(files),'fixed files;',len(refs),'lesson references;',len(prep_checks),'prep artifacts')
