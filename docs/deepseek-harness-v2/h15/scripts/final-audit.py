"""最终只读保护核验；仅在 H15/evidence 写报告，不清理任何文件。"""
from pathlib import Path
import json,hashlib,subprocess,re,datetime
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence';ALLOW=('docs/deepseek-harness-v2/h15/','course-content/internal/deepseek-harness/h15/')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
load=lambda n:json.loads((E/n).read_text(encoding='utf-8'))
git=lambda *args:subprocess.check_output(['git',*args],cwd=P).decode('utf-8')
before=load('workspace-before.json');known={f['path'] for f in before['files']}
changed=[f['path'] for f in before['files'] if not (P/f['path']).is_file() or sha(P/f['path'])!=f['sha256']]
assert not changed,changed
allpaths=set(git('ls-files','-z').split('\0'))|set(git('ls-files','--others','--exclude-standard','-z').split('\0'))
allpaths.update(p.relative_to(P).as_posix() for p in (P/'output').rglob('*') if p.is_file())
unexpected=sorted(p for p in allpaths if p and p not in known and not p.startswith(ALLOW))
assert not unexpected,unexpected
staged=[p for p in git('diff','--cached','--name-only','-z').split('\0') if p]
assert all(p.startswith(ALLOW) for p in staged),staged
status=git('status','--short')
outside=lambda s:[line for line in s.splitlines() if not line[3:].replace('\\','/').startswith(ALLOW)]
assert outside(status)==outside(before['status']),(outside(status),outside(before['status']))
body=P/'course-content/internal/deepseek-harness/h15/lesson.md';content=load('content-check.json');visual=load('visual-qa.json');labs=load('lab-results.json');manual=load('manual-review.json')
assert content['lessonSha256']==visual['lessonSha256']==sha(body)
assert visual['rendererSha256']==sha(P/'src/components/LessonMarkdown.tsx')
for f in visual['figures']:
 item=next(i for i in load('figures.json') if i['id']==f['id'])
 assert f['sourceSha256']==sha(R/item['source']) and f['imageSha256']==sha(R/item['image'])
 assert f['out']==[] and f['overlap']==[]
assert [v['width'] for v in visual['viewports']]==[1440,390,320]
for v in visual['viewports']:
 assert v['status']=='PASS' and not v['errors'] and not v['failed']
for f in manual['samples']:assert sha(R/f['path'])==f['sha256'],f['path']
assert manual['status']=='PASS_AUTHOR_VISUAL_REVIEW' and len(manual['samples'])>=12
assert labs['status']=='PASS' and labs['tests']==31 and labs['mutation']['exit']!=0
for f in labs['programs']:assert sha(body.parent/'lab'/f['name'])==f['sha256'],f['name']
tap=(E/'lab-tests.txt').read_text(encoding='utf-8');assert '# tests 31' in tap and '# fail 0' in tap
reg=(E/'renderer-regression.txt').read_text(encoding='utf-8');assert '# tests 12' in reg and '# fail 0' in reg
assert len(re.findall(r'^# Subtest: C',tap,re.M))==18 and len(re.findall(r'^# Subtest: D',tap,re.M))==13
lock=load('source-lock.json')
for f in lock['files']:assert sha(Path(lock['sourceCache'])/f['path'])==f['sha256'],f['path']
assert len(load('source-assertions.json'))==52
for c in load('source-assertions.json'):
 path=Path(lock['sourceCache'])/c['path'];assert sha(path)==c['sourceSha256']
 assert all(a in path.read_text(encoding='utf-8') for a in c['anchors'])
assert all(v=='NOT_RUN' for v in load('platform-coverage.json')['nativeProcessRunners'].values())
for f in ['README.md','reading-preview.html','source-checklist.md','quality-review.md','test-evidence.md','knowledge-bridge.md','h16-handoff.md','native-platform-coverage.md','acceptance.md','NOTICE.md','SOURCE-LICENSE.txt','CORDIS-LICENSE.txt','ZOD-LICENSE.txt']:assert (R/f).is_file(),f
# 本地 Markdown 链接：检查交付导航，不把远端锚点当网络可达性证明。
for p in R.glob('*.md'):
 for target in re.findall(r'\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
  if target.startswith(('http:','https:','#')) or target in ['evidence/validation.json','evidence/artifact-inventory.json']:continue
  assert (p.parent/target.split('#')[0]).exists(),(p.name,target)
data={'status':'PASS','decision':'CONDITIONAL GO','base':before['base'],'headAtAudit':git('rev-parse','HEAD').strip(),'protectedFiles':len(before['files']),'protectedOutputFiles':sum(f['path'].startswith('output/') for f in before['files']),'changedProtectedFiles':changed,'unexpectedPaths':unexpected,'stagedFiles':staged,'scope':list(ALLOW),'checks':{'C':18,'D':13,'renderer':12,'sourceAssertions':52,'widths':[1440,390,320],'manualSamples':len(manual['samples']),'artifactHashesCurrent':True},'unverified':['learner trial','actual learning time','independent review','E complete application integration','all native process sandbox runners','hostile TOCTOU races'],'completed':datetime.datetime.now(datetime.timezone.utc).isoformat()}
(E/'validation.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(E/'workspace-after.json').write_text(json.dumps({'status':status,'head':data['headAtAudit'],'protectedFilesUnchanged':len(before['files'])},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
exclude={'evidence/artifact-inventory.json','evidence/validation.json','evidence/workspace-after.json'}
files=[p for p in R.rglob('*') if p.is_file() and p.relative_to(R).as_posix() not in exclude]+[p for p in body.parent.rglob('*') if p.is_file()]
items=[{'path':p.relative_to(P).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(files)]
(E/'artifact-inventory.json').write_text(json.dumps({'excludesSelfReferentialReports':sorted(exclude),'files':items,'count':len(items),'bytes':sum(i['bytes'] for i in items)},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:data[k] for k in ['status','decision','protectedFiles','protectedOutputFiles','unexpectedPaths']},ensure_ascii=False))
