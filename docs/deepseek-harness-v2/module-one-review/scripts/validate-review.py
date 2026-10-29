"""新基线的范围保护、当前证据一致性及报告完整性。无删除、安装或发布。"""
from pathlib import Path
import hashlib,json,re,subprocess
ROOT=Path(__file__).resolve().parents[1];REPO=ROOT.parents[2];E=ROOT/'evidence'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def read(n): return json.loads((E/n).read_text(encoding='utf-8'))
before=read('workspace-before.json')
allowed={f'course-content/internal/deepseek-harness/h0{n}/lesson.md' for n in range(1,5)}|{f'docs/deepseek-harness-v2/h0{n}/reading-preview.html' for n in range(1,5)}
changed=[]
for f,digest in before['tracked'].items():
 p=REPO/f;assert p.is_file(),f
 if sha(p)!=digest:
  assert f in allowed, f'Unexpected original change: {f}'
  changed.append(f)
assert set(changed)==allowed,changed
out={p.relative_to(REPO).as_posix():sha(p) for p in (REPO/'output').rglob('*') if p.is_file()}
assert out==before['output'],'output changed/added/removed'
currentTracked=set(x for x in subprocess.check_output(['git','ls-files','-z'],cwd=REPO).decode('utf-8').split('\0') if x)
newTracked=currentTracked-set(before['tracked'])
assert all(p.startswith('docs/deepseek-harness-v2/module-one-review/') for p in newTracked),newTracked
pending=[x for x in subprocess.check_output(['git','ls-files','-z','--others','--exclude-standard'],cwd=REPO).decode('utf-8').split('\0') if x]
assert all(p.startswith(('output/','docs/deepseek-harness-v2/module-one-review/')) for p in pending),pending
def node_result(name,expected):
 s=(E/name).read_text(encoding='utf-8')
 for k,v in [('tests',expected),('pass',expected),('fail',0),('cancelled',0),('skipped',0),('todo',0)]:
  assert re.search(rf'\b{k}\s+{v}(?:\D|$)',s),(name,k)
 return {'log':name,'tests':expected,'status':'PASS','sha256':sha(E/name)}
tests=[node_result(f'h0{n}-lab-tests.tap',v) for n,v in enumerate([7,8,10,12],1)]
tests.append(node_result('renderer-tests.tap',9))
source=read('source-check.json');assert source['status']=='STATIC_INTEGRITY_VERIFIED'
assert len(source['references'])==172 and len(source['historicalClaims'])==114
assert len(read('h03-control-flow.json')['orders'])==6
assert len(read('h04-control-flow.json')['checks'])==5
assert len(read('member-check.json')['checks'])==2
assert len(read('actual-stream-probes.json')['checks'])==4
assert len(read('actual-boot-probes.json')['checks'])==10
for name in ['member-check.json','actual-stream-probes.json','actual-boot-probes.json']:
 d=read(name);assert d['status']=='PASS' and d['commit']==source['commit']
lessons=[];figures=[]
for n in range(1,5):
 h=f'h0{n}';p=REPO/f'course-content/internal/deepseek-harness/{h}/lesson.md'
 c=read(h+'-content-check.json');v=read(h+'-visual-qa.json')
 assert c['status']=='PASS' and c['lessonSha256']==v['lessonSha256']==sha(p)
 assert next(r for r in source['lessons'] if r['lesson']==h)['sha256']==sha(p)
 assert next(r for r in read('preview-sync.json')['rows'] if r['lesson']==h)['previewSha256']==sha(ROOT.parent/h/'reading-preview.html')
 assert c['globallyUniqueKeys'] and len(v['figures'])==3
 assert [x['width'] for x in v['viewports']]==[1440,390,320]
 assert v['rendererSha256']==sha(REPO/'src/components/LessonMarkdown.tsx')
 for view in v['viewports']:assert view['status']=='PASS' and view['metrics']['documentWidth']<=view['width']
 for f in v['figures']:
  q=ROOT.parent/h/'figures';svg=q/'source'/f'{f["id"]}.svg';png=q/'rendered'/f'{f["id"]}.png'
  assert sha(svg)==f['sourceSha256'] and sha(png)==f['imageSha256']
  assert sha(png)==sha(E/'visual'/h/f'{f["id"]}-master.png')
  assert before['tracked'][png.relative_to(REPO).as_posix()]==sha(png)
  assert not f['out'] and not f['overlap'] and f['font']
  figures.append({'id':f['id'],'sourceSha256':sha(svg),'imageSha256':sha(png),'regeneratedExactMatch':True})
 lessons.append({'lesson':h,'lessonSha256':sha(p),'previewSha256':sha(ROOT.parent/h/'reading-preview.html'),'content':'PASS','threeWidths':'PASS'})
quiz=read('assessment-check.json');assert len(quiz['questions'])==12 and quiz['totalScore']==100
assert quiz['sourceSha256']==sha(ROOT/'assessment.md') and quiz['previewSha256']==sha(ROOT/'assessment-preview.html')
assert len(quiz['viewports'])==3 and all(x['status']=='PASS' for x in quiz['viewports'])
for name in ['README.md','issues-initial.md','dependency-matrix.md','terminology-and-repetition.md','source-review.md','figures-review.md','assessment.md','workload.md','revisions.md','production-standard-v1.md','acceptance.md']:
 p=ROOT/name;assert p.exists() and len(p.read_text(encoding='utf-8'))>300
# 保存原文到当前的精确 diff；基线不随本轮提交移动。
patch=subprocess.check_output(['git','diff','--unified=0',before['head'],'--',*sorted(allowed)],cwd=REPO)
(E/'lesson-revisions.patch').write_bytes(patch)
changes=[{'path':f,'workspaceBeforeSha256':before['tracked'][f],'afterSha256':sha(REPO/f)} for f in sorted(changed)]
(E/'revisions.json').write_text(json.dumps({'baseCommit':before['head'],'initialIssuesSha256':sha(ROOT/'issues-initial.md'),'resolved':['R01','R02','R03','R04','R05'],'deferred':['R06','R07'],'files':changes},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# 检查新交付的相对文件链接，产品 /lesson 路由或外网链接不在此处伪装成已访问。
links=[]
for p in ROOT.glob('*.md'):
 for dest in re.findall(r'\]\(([^\s)]+)\)',p.read_text(encoding='utf-8')):
  if dest.startswith(('http:','https:','/','#')):continue
  target=(p.parent/dest.split('#')[0]).resolve();assert target.exists() or target==(E/'validation.json').resolve(),(p.name,dest)
  links.append({'document':p.name,'target':dest})
report={'date':'2026-10-29','status':'PASS_WITH_EXPLICIT_SCOPE','fixedCommit':source['commit'],'baseCommit':before['head'],'technical':'GO within coverage','editorial':'GO author-side standard v1.0','learnerEffectiveness':'PENDING','overall':'CONDITIONAL GO','tests':tests,'labTests':37,'rendererTests':9,'astChecks':13,'actualSourceHelperChecks':14,'sourceReferences':172,'historicalClaims':114,'sourceFiles':len(source['files']),'lessons':lessons,'figures':figures,'lessonViewportCases':12,'assessment':{'questions':12,'points':100,'widths':3,'freeResponseGrading':'MANUAL_NOT_AUTOMATED','effectiveness':'UNVERIFIED'},'protection':{'originalTracked':len(before['tracked']),'allowedChanged':sorted(changed),'unchangedOriginal':len(before['tracked'])-len(changed),'outputFilesUnchanged':len(out),'newFilesRestrictedToReviewDirectory':True},'relativeLinksChecked':len(links),'unverified':['real learner trial/duration/transfer','independent technical and pedagogical review','rubric calibration and inter-rater agreement','full official suite/build/application boot','real models/network/SDK/ACP handshake','native HMR/OS sandbox/durable cross-process recovery','online rights/prices/progress/private media integration'],'scope':'No H05 development, platform change, public asset, database migration, publishing or bulk deletion'}
(E/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for link in links: assert (ROOT/link['target'].split('#')[0]).resolve().exists(),link
print(json.dumps({'status':report['status'],'tests':46,'sourceFiles':len(source['files']),'originalUnchanged':1848,'allowedRevised':8,'outputProtected':len(out),'overall':report['overall']},ensure_ascii=False))
