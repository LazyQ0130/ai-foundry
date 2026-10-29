"""H05 内容/测试证据与原文件保护门禁。失败不写 PASS，不运行发布工序。"""
from pathlib import Path
import hashlib,json,re,subprocess
ROOT=Path(__file__).resolve().parents[1];REPO=ROOT.parents[2]
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(f):return json.loads((ROOT/f).read_text(encoding='utf8'))
before=read('evidence/workspace-before.json')
for p,digest in before['tracked'].items():assert (REPO/p).is_file() and h(REPO/p)==digest,p
now={p.relative_to(REPO).as_posix():h(p) for p in (REPO/'output').rglob('*') if p.is_file()}
assert now==before['output'],'output changed'
allowed=['course-content/internal/deepseek-harness/h05/','docs/deepseek-harness-v2/h05/']
tracked=subprocess.check_output(['git','ls-files','-z'],cwd=REPO).decode().split('\0')
untracked=subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=REPO).decode().split('\0')
for p in tracked+untracked:
 if not p or p in before['tracked'] or p in before['output']:continue
 assert any(p.startswith(a) for a in allowed),p
lesson=REPO/'course-content/internal/deepseek-harness/h05/lesson.md'
content=read('evidence/content-check.json');visual=read('evidence/visual-qa.json');sources=read('evidence/source-check.json');lab=read('evidence/lab-results.json');manual=read('evidence/manual-review.json')
assert content['status']==sources['status']==lab['status']=='PASS'
assert content['lessonSha256']==visual['lessonSha256']==manual['lessonSha256']==h(lesson)
assert content['staticPreviewExactSsrMatch'] and len(content['fullProgramMatches'])==6 and len(content['members'])==4
assert lab['tests']==9 and lab['mutation']['exit']!=0
for p in lab['lessonPrograms']:assert h(lesson.parent/'lab'/p['name'])==p['sha256'],p
assert [v['width'] for v in visual['viewports']]==[1440,390,320]
for v in visual['viewports']:
 assert v['status']=='PASS' and len(v['copiedPrograms'])==6 and not v['errors'] and not v['failed']
 assert v['metrics']['h1']==1 and v['metrics']['documentWidth']<=v['width']
 assert v['staticMetrics']['copyButtons']==0 and v['staticMetrics']['details']==15
for f in visual['figures']:
 assert f['status']=='PASS' and not f['out'] and not f['overlap']
 assert h(ROOT/'figures/source'/f"{f['id']}.svg")==f['sourceSha256']
 assert h(ROOT/'figures/rendered'/f"{f['id']}.png")==f['imageSha256']
 assert manual['figureHashes'][f['id']]==f['imageSha256']
tap=(ROOT/'evidence/renderer-tests.tap').read_text(encoding='utf-8-sig')
assert re.search(r'# tests 9\s',tap) and re.search(r'# pass 9\s',tap) and re.search(r'# fail 0\s',tap)
assert manual['reviewer']=='same author; not independent external review' and manual['status']=='AUTHOR_REVIEW_PASS'
for required in ['README.md','reading-preview.html','source-checklist.md','knowledge-bridge.md','quality-review.md','h06-handoff.md','NOTICE.md','SOURCE-LICENSE.txt','review-log.md','acceptance.md']:
 assert (ROOT/required).is_file(),required
packet={}
for directory in [ROOT,lesson.parent]:
 for p in directory.rglob('*'):
  if p.is_file() and p!=ROOT/'evidence/validation.json':packet[p.relative_to(REPO).as_posix()]=h(p)
report={'status':'CONDITIONAL_GO','date':'2026-10-29','commit':sources['commit'],'technical':'PASS_WITH_SCOPED_LIMITS','authorReview':'PASS','learnerTrial':'PENDING','actualLearningDuration':'PENDING','independentExternalReview':'PENDING','tests':{'lab':9,'renderer':9,'mutation':'EXPECTED_NONZERO','types':'TS2345 negative + erased declaration + actual runtime'},'source':{'references':len(sources['references']),'claims':len(sources['claims']),'files':len(sources['files'])},'screens':[1440,390,320],'preservation':{'originalTrackedUnchanged':len(before['tracked']),'originalOutputUnchanged':len(now),'onlyH05Added':True},'notRun':['full upstream suite/build','Loader/Profile/full Harness integration','real Provider/credentials/private data','OS sandbox/persistence recovery','published media/auth/progress'],'packetSha256':packet,'stop':'H05 complete; do not start H06 or publish'}
(ROOT/'evidence/validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='packetSha256'},ensure_ascii=False))
