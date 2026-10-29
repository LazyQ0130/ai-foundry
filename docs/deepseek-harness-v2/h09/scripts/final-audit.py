"""只核已有证据和保护快照；不制造运行/人工审阅结论，不清理目录。"""
from pathlib import Path
import json,re,hashlib,subprocess
R=Path(__file__).resolve().parents[1];REPO=R.parents[2]
def get(p):return json.loads((R/p).read_text(encoding='utf8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
before=get('evidence/workspace-before.json')
changed=[]
for item in before['files']:
 p=REPO/item['path']
 if not p.is_file() or sha(p)!=item['sha256']:changed.append(item['path'])
assert not changed,changed
allow=('course-content/internal/deepseek-harness/h09/','docs/deepseek-harness-v2/h09/')
raw=subprocess.check_output(['git','status','--porcelain=v1','-z'],cwd=REPO).decode('utf8').split('\0')
for line in filter(None,raw):
 path=line[3:].replace('\\','/')
 assert path=='output/' or path.startswith(allow),(line,path)
content=get('evidence/content-check.json');visual=get('evidence/visual-qa.json');labs=get('evidence/lab-results.json');source=get('evidence/source-check.json');manual=get('evidence/manual-review.json')
lesson=REPO/'course-content/internal/deepseek-harness/h09/lesson.md'
assert content['status']==labs['status']==source['status']=='PASS'
assert content['lessonSha256']==visual['lessonSha256']==manual['lessonSha256']==sha(lesson)
assert labs['tests']==24 and labs['mutation']['exit']!=0
tap=(R/'evidence/renderer-tests.tap').read_text(encoding='utf8')
assert re.search(r'# tests 9\b',tap) and re.search(r'# fail 0\b',tap)
assert [v['width'] for v in visual['viewports']]==[1440,390,320]
assert all(v['status']=='PASS' and len(v['copiedPrograms'])==5 and not v['errors'] and not v['failed'] for v in visual['viewports'])
for f in visual['figures']:
 assert f['sourceSha256']==sha(R/f'figures/source/{f["id"]}.svg')
 assert f['imageSha256']==sha(R/f'figures/rendered/{f["id"]}.png')
for sample in manual['samples']:assert sample['sha256']==sha(R/sample['path']),sample['path']
assert manual['reviewer']=='same author; not independent review'
assert len(get('evidence/source-assertions.json')['assertions'])==37
assert source['files']==1590 and len(source['references'])==100
# 课件链接校验仅限本次包的普通本地Markdown链接；官方固定锚点另由check-sources核。
local=[]
for path in list(R.glob('*.md')):
 for target in re.findall(r'(?<!!)\[[^\]]+\]\(([^)]+)\)',path.read_text(encoding='utf8')):
  if re.match(r'^[a-zA-Z]+:|^[/#]',target):continue
  target=target.split('#',1)[0]
  generated=target in ['evidence/validation.json','evidence/artifact-inventory.json']
  assert generated or (path.parent/target).exists(),(path.name,target)
  local.append([path.name,target])
expected=['README.md','reading-preview.html','source-checklist.md','test-evidence.md','renderer-regression.md','quality-review.md','knowledge-bridge.md','h10-handoff.md','review-log.md','acceptance.md','NOTICE.md','SOURCE-LICENSE.txt','CORDIS-LICENSE.txt','ZOD-LICENSE.txt']
for file in expected:assert (R/file).is_file(),file
inventory=[{'path':str(p.relative_to(REPO)).replace('\\','/'),'sha256':sha(p),'bytes':p.stat().st_size} for base in [R,lesson.parent] for p in sorted(base.rglob('*')) if p.is_file() and p.name not in ['validation.json','artifact-inventory.json']]
report={'status':'PASS','conclusion':'CONDITIONAL GO','base':before['base'],'officialCommit':labs['commit'],
 'protectedFiles':len(before['files']),'protectedOutputFiles':sum(x['path'].startswith('output/') for x in before['files']),
 'changedPreexistingFiles':changed,'onlyH09Changes':True,'tests':{'C':3,'D':21,'total':24,'renderer':9,'mutation':'EXPECTED_FAILURE','E':'NOT_RUN'},
 'viewports':[1440,390,320],'sourceFiles':source['files'],'sourceAssertions':37,'boundedReferences':100,
 'manualSamples':len(manual['samples']),'localLinks':len(local),'metrics':content['metrics'],
 'learnerStudy':'NOT_RUN','measuredLearningDuration':'NOT_RUN','independentReview':'NOT_RUN','published':False,
 'officialPersistenceBackend':'NOT_RUN; authored memory storage fixture only','databasePricePermissionsChanged':False}
(R/'evidence/artifact-inventory.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(R/'evidence/validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(report,ensure_ascii=False))
