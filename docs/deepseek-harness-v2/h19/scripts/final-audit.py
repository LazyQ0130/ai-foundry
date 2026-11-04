"""仅写 H19 证据；保护旧教材、用户改动、output、H18 文件与空目录。"""
from pathlib import Path
import datetime, hashlib, json, re, subprocess
R=Path(__file__).resolve().parents[1]; P=R.parents[2]; E=R/'evidence'
ALLOW=('docs/deepseek-harness-v2/h19/','course-content/internal/deepseek-harness/h19/')
COMMIT='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(n):return json.loads((E/n).read_text(encoding='utf-8'))
def git(*args):return subprocess.check_output(['git',*args],cwd=P).decode('utf-8')
subprocess.check_call(['python','-X','utf8',str(R/'scripts/inventory-temporary.py')],cwd=P)
before=load('workspace-before.json');known={f['path'] for f in before['files']}
changed=[f['path'] for f in before['files'] if not (P/f['path']).is_file() or sha(P/f['path'])!=f['sha256']]
assert not changed,changed
kept=load('h18-retained-before.json')
missingDirs=[p for p in kept['directories'] if not Path(p).is_dir()]
changedH18=[f['path'] for f in kept['files'] if not Path(f['path']).is_file() or sha(Path(f['path']))!=f['sha256']]
assert not missingDirs and not changedH18,(missingDirs,changedH18)
paths=set(git('ls-files','-z').split('\0'))|set(git('ls-files','--others','--exclude-standard','-z').split('\0'))
paths.update(p.relative_to(P).as_posix() for p in (P/'output').rglob('*') if p.is_file())
unexpected=sorted(p for p in paths if p and p not in known and not p.startswith(ALLOW));assert not unexpected,unexpected
staged=[p for p in git('diff','--cached','--name-only','-z').split('\0') if p];assert all(p.startswith(ALLOW) for p in staged),staged
status=git('status','--short')
def outside(s):return [line for line in s.splitlines() if not line[3:].replace('\\','/').startswith(ALLOW)]
assert outside(status)==outside(before['status']),(outside(status),outside(before['status']))
body=P/'course-content/internal/deepseek-harness/h19/lesson.md'
content,visual,labs,manual=(load(n) for n in ['content-check.json','visual-qa.json','lab-results.json','manual-review.json'])
assert content['status']=='PASS' and manual['status']=='PASS'
assert content['lessonSha256']==visual['lessonSha256']==manual['lessonSha256']==sha(body)
assert visual['rendererSha256']==sha(P/'src/components/LessonMarkdown.tsx')
assert content['previewExactSsr'] and content['noNewDeprecatedReads'] and content['uniqueCheckKeys']
assert len(content['programs'])==9 and len(content['astMembers'])>=12
assert content['metrics']['thoughts']>=12 and content['metrics']['sequenceOrCodeThoughts']>=4
assert len(visual['figures'])==4
for f in visual['figures']:
    item=next(x for x in load('figures.json') if x['id']==f['id'])
    assert f['sourceSha256']==sha(R/item['source']) and f['imageSha256']==sha(R/item['image'])
    assert f['status']=='PASS' and f['font'] and not f['out'] and not f['overlap']
assert [v['width'] for v in visual['viewports']]==[1440,390,320]
assert all(v['status']=='PASS' and not v['errors'] and not v['failed'] for v in visual['viewports'])
for f in manual['images']:assert sha(R/f['path'])==f['sha256'],f['path']
assert len(manual['images'])>=12
assert labs['status']=='PASS' and labs['tests']==34 and labs['levels']=={'C':19,'D':15}
for f in labs['programs']:assert sha(body.parent/'lab'/f['name'])==f['sha256'],f['name']
raw=load(labs['rawRun']);assert raw['exit']==0 and raw['error'] is None
tap=(E/'lab-tests.txt').read_text(encoding='utf-8')
assert '# tests 34' in tap and '# fail 0' in tap
assert len(re.findall(r'^# Subtest: C',tap,re.M))==19
assert len(re.findall(r'^# Subtest: D',tap,re.M))==15
reg=(E/'renderer-regression.txt').read_text(encoding='utf-8');assert '# tests 12' in reg and '# fail 0' in reg
checks=load('checks.json');assert checks['status']=='PASS' and len(checks['checks'])==10
assert all(c['exit']==0 and c['error'] is None for c in checks['checks'])
deps=load('dependencies.json');assert deps['status']=='PASS' and len(deps['packages'])==46
lock=load('source-lock.json');assert lock['commit']==COMMIT and len(lock['files'])==9619
source=Path(lock['sourceCache'])
for f in lock['files']:assert sha(source/f['path'])==f['sha256'],f['path']
claims=load('source-assertions.json');assert len(claims)==54 and len({c['claim'] for c in claims})==54
for c in claims:
    p=source/c['path'];assert c['commit']==COMMIT and c['sourceSha256']==sha(p),c['id']
    assert 1<=c['start']<=c['end']<=len(p.read_text(encoding='utf-8').splitlines()),c['id']
    assert c['symbol'] and c['claim'] and c['test'] and c['level'],c['id']
for name in ['README.md','reading-preview.html','quality-review.md','coverage-matrix.md','source-checklist.md','discrepancies.md','knowledge-bridge.md','h20-handoff.md','renderer-regression.md','NOTICE.md','SOURCE-LICENSE.txt','CORDIS-LICENSE.txt','ZOD-LICENSE.txt']:
    assert (R/name).is_file(),name
for name in ['README.md','bootstrap.mjs','support.ts','A.ts','B.ts','C.ts','D.ts','X.ts','extras.ts','demo.ts','compaction.test.ts']:
    assert (body.parent/'lab'/name).is_file(),name
future={'evidence/validation.json','evidence/artifact-inventory.json','evidence/workspace-after.json'}
for p in list(R.rglob('*.md'))+[body.parent/'lab/README.md']:
    for target in re.findall(r'\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
        if target.startswith(('https:','http:','#')) or target in future:continue
        assert (p.parent/target.split('#')[0]).exists(),(p.name,target)
data={'status':'PASS','decision':'CONDITIONAL GO','base':before['base'],'headAtAudit':git('rev-parse','HEAD').strip(),'protectedFiles':len(before['files']),'protectedOutputFiles':sum(f['path'].startswith('output/') for f in before['files']),'changedProtectedFiles':changed,'h18RetainedFilesUnchanged':len(kept['files']),'h18RetainedDirectoriesPresent':len(kept['directories']),'unexpectedPaths':unexpected,'stagedFiles':staged,'scope':list(ALLOW),'checks':{'C':19,'D':15,'renderer':12,'sourceAssertions':54,'sourceFiles':len(lock['files']),'dependencies':46,'widths':[1440,390,320],'manualSamples':len(manual['images']),'artifactHashesCurrent':True},'unverified':['real Provider / tokenizer / cost / cache benefit / summary factual quality','H19 independent process / Zstd / physical failure / cross-platform','complete Harness E','real learners and reading duration','independent external review'],'completedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
(E/'validation.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(E/'workspace-after.json').write_text(json.dumps({'status':status,'head':data['headAtAudit'],'protectedFilesUnchanged':len(before['files'])},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
exclude={'evidence/artifact-inventory.json','evidence/validation.json','evidence/workspace-after.json'}
files=[p for p in R.rglob('*') if p.is_file() and p.relative_to(R).as_posix() not in exclude]+[p for p in body.parent.rglob('*') if p.is_file()]
items=[{'path':p.relative_to(P).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(files)]
(E/'artifact-inventory.json').write_text(json.dumps({'excludesSelfReferentialReports':sorted(exclude),'files':items,'count':len(items),'bytes':sum(i['bytes'] for i in items)},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:data[k] for k in ['status','decision','protectedFiles','protectedOutputFiles','h18RetainedFilesUnchanged','h18RetainedDirectoriesPresent','unexpectedPaths']},ensure_ascii=False))
