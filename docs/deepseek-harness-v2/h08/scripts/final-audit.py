from pathlib import Path
import json,hashlib,subprocess,re
R=Path(__file__).resolve().parents[1];REPO=R.parents[2]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda name:json.loads((R/name).read_text(encoding='utf-8-sig'))
before=read('evidence/workspace-before.json')
changed=[n for n,h in before['tracked'].items() if not (REPO/n).is_file() or sha(REPO/n)!=h]
output={str(p.relative_to(REPO)).replace('\\','/'):sha(p) for p in (REPO/'output').rglob('*') if p.is_file()}
assert not changed,changed;assert output==before['output'],'output changed'
allowed=('docs/deepseek-harness-v2/h08/','course-content/internal/deepseek-harness/h08/')
staged=subprocess.check_output(['git','diff','--cached','--name-only'],cwd=REPO,text=True).splitlines()
assert all(n.startswith(allowed) for n in staged),staged
lesson=REPO/'course-content/internal/deepseek-harness/h08/lesson.md';digest=sha(lesson)
lab=read('evidence/lab-results.json');visual=read('evidence/visual-qa.json');content=read('evidence/content-check.json');manual=read('evidence/manual-review.json');source=read('evidence/source-check.json')
assert lab['status']=='PASS' and lab['tests']==20 and lab['mutation']['exit']!=0
assert lab['levels']['fullOfficialApplication']=='NOT_RUN'
assert all(item['status']=='PASS' for item in visual['viewports']) and len(visual['viewports'])==3
assert len(visual['figures'])==4 and source['status']=='PASS' and source['files']==749
assert digest==visual['lessonSha256']==content['lessonSha256']==manual['lessonSha256']
assert manual['status']=='PASS_AUTHOR_VISUAL_INSPECTION'
for s in manual['samples']:assert sha(R/s['path'])==s['sha256'],s['path']
for f in lab['programs']:assert sha(lesson.parent/'lab'/f['name'])==f['sha256'],f['name']
tap=(R/'evidence/renderer-tests.tap').read_text(encoding='utf-8-sig');assert '# tests 9' in tap and '# fail 0' in tap
html=(R/'reading-preview.html').read_text(encoding='utf-8');assert '**我们的分析' not in html
for name in ['README.md','acceptance.md','quality-review.md','renderer-regression.md','knowledge-bridge.md','h09-handoff.md','module-two-review-prep/README.md','module-two-review-prep/artifact-inventory.json']:
 assert (R/name).is_file(),name
inventory=read('module-two-review-prep/artifact-inventory.json');assert inventory['status']=='PREPARED_REVIEW_NOT_STARTED'
for h in inventory['lessons']:
 for a in h['artifacts']:assert sha(REPO/a['path'])==a['sha256'],a['path']
# 本地相对Markdown交付链接检查；外部固定源码由check-sources核。
local=[]
for p in R.rglob('*.md'):
 for dest in re.findall(r'(?<!!)\[[^\]]+\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
  if '://' in dest or dest.startswith('#'):continue
  target=(p.parent/dest.split('#')[0]).resolve()
  # 本脚本最后创建的唯一输出，可在首次验收时作为链接目标；其他缺链仍拒绝。
  assert target.exists() or target==(R/'evidence/validation.json').resolve(),(p,dest)
  local.append(dest)
report={'status':'PASS','date':'2026-10-29','decision':'CONDITIONAL GO','baselineHead':before['head'],
 'lessonSha256':digest,'sourceFiles':749,'sourceReferences':len(source['references']),'claims':len(read('evidence/claims.json')),
 'authorBehaviorTests':20,'rendererTests':9,'figures':4,'viewports':[v['width'] for v in visual['viewports']],
 'manualSamples':len(manual['samples']),'localLinksChecked':len(local),'protectedTrackedFiles':len(before['tracked']),'protectedOutputFiles':len(output),
 'changedPreexistingFiles':changed,'stagedPathsOnlyH08':True,'moduleTwoReview':'PREPARED_NOT_EXECUTED','h09':'NOT_STARTED','publication':'NOT_PERFORMED',
 'unverified':['learner trial and actual learning time','independent technical/pedagogical review','native HMR module replacement/file watching','complete official application and upstream integration suites','real providers/credentials/OS sandbox/disk recovery','online media/auth/progress'],
 'testLevels':lab['levels']}
(R/'evidence/validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:report[k] for k in ['status','decision','authorBehaviorTests','rendererTests','sourceReferences','protectedTrackedFiles','protectedOutputFiles']},ensure_ascii=False))
