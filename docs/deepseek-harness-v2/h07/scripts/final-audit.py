"""H07内容、运行与保护门禁；不删除文件、不发布、不修改旧课。"""
from pathlib import Path
import hashlib,json,os,re,subprocess
ROOT=Path(__file__).resolve().parents[1];REPO=ROOT.parents[2]
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(f):return json.loads((ROOT/f).read_text(encoding='utf8'))
before=read('evidence/workspace-before.json')
for p,digest in before['tracked'].items():assert (REPO/p).is_file() and h(REPO/p)==digest,p
now={p.relative_to(REPO).as_posix():h(p) for p in (REPO/'output').rglob('*') if p.is_file()}
assert now==before['output'],'output changed'
allowed=['course-content/internal/deepseek-harness/h07/','docs/deepseek-harness-v2/h07/']
tracked=subprocess.check_output(['git','ls-files','-z'],cwd=REPO).decode().split('\0')
untracked=subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=REPO).decode().split('\0')
for p in tracked+untracked:
 if not p or p in before['tracked'] or p in before['output']:continue
 assert any(p.startswith(a) for a in allowed),p
lesson=REPO/'course-content/internal/deepseek-harness/h07/lesson.md'
content=read('evidence/content-check.json');visual=read('evidence/visual-qa.json');sources=read('evidence/source-check.json');lab=read('evidence/lab-results.json');manual=read('evidence/manual-review.json');lock=read('evidence/source-lock.json')
assert content['status']==sources['status']==lab['status']=='PASS'
assert sources['commit']==lab['commit']==lock['commit']=='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
assert content['lessonSha256']==visual['lessonSha256']==manual['lessonSha256']==h(lesson)
assert visual['rendererSha256']==h(REPO/'src/components/LessonMarkdown.tsx')
assert content['staticPreviewExactSsrMatch'] and len(content['fullProgramMatches'])==5 and len(content['members'])==8
assert content['checklist']==4 and content['globallyUniqueKeys']
assert lab['tests']==24 and lab['mutation']['exit']!=0 and lab['mutation']['status']=='EXPECTED_FAILURE'
assert 'TS2345' in lab['typecheck']
assert 'TS2345' in (ROOT/'evidence/type-error.txt').read_text(encoding='utf8')
emitted=(ROOT/'evidence/support-emitted.js').read_text(encoding='utf8')
assert 'declare module' not in emitted and 'new Context' in emitted
for p in lab['lessonPrograms']:assert h(lesson.parent/'lab'/p['name'])==p['sha256'],p
cache=Path(os.environ.get('HARNESS_SOURCE_CACHE',lock['sourceCache']))
for f in sources['files']:assert h(cache/f['path'])==f['sha256'],f['path']
assert (ROOT/'SOURCE-LICENSE.txt').read_bytes()==(cache/'LICENSE').read_bytes()
assert (ROOT/'CORDIS-LICENSE.txt').read_bytes()==(cache/'vendor/cordis/LICENSE').read_bytes()
assert len(sources['references'])==24 and len(sources['claims'])==36 and len(sources['files'])==32
assert [v['width'] for v in visual['viewports']]==[1440,390,320]
for v in visual['viewports']:
 assert v['status']=='PASS' and len(v['copiedPrograms'])==5 and not v['errors'] and not v['failed']
 assert v['metrics']['h1']==1 and v['metrics']['documentWidth']<=v['width']
 assert len(v['metrics']['images'])==3 and len(v['metrics']['details'])==18 and not any(v['metrics']['details'])
 assert v['staticMetrics']['copyButtons']==0 and v['staticMetrics']['details']==18
 for scroll in [v['labScroll'],v['codeScroll']]:
  assert scroll['scrolled']==max(0,scroll['scrollWidth']-scroll['clientWidth'])
 assert v['originalImage']=='PASS: actual popup decoded'
for f in visual['figures']:
 assert f['status']=='PASS' and not f['out'] and not f['overlap'] and f['font'] and f['minFont']>=28
 assert h(ROOT/'figures/source'/f"{f['id']}.svg")==f['sourceSha256']
 assert h(ROOT/'figures/rendered'/f"{f['id']}.png")==f['imageSha256']
 assert manual['figureHashes'][f['id']]==f['imageSha256']
assert len(manual['samples'])==7
for sample in manual['samples']:assert h(ROOT/sample['path'])==sample['sha256']
tap=(ROOT/'evidence/renderer-tests.tap').read_text(encoding='utf-8-sig')
assert re.search(r'# tests 9\s',tap) and re.search(r'# pass 9\s',tap) and re.search(r'# fail 0\s',tap)
assert manual['reviewer']=='same author; not independent external review' and manual['status']=='AUTHOR_REVIEW_PASS'
prereq=read('evidence/prerequisites.json')
for f in prereq['inputs']:assert h(REPO/f['path'])==f['sha256'],f['path']
for required in ['README.md','reading-preview.html','source-checklist.md','knowledge-bridge.md','quality-review.md','h08-handoff.md','NOTICE.md','SOURCE-LICENSE.txt','CORDIS-LICENSE.txt','review-log.md','acceptance.md','evidence/prerequisites.json']:
 assert (ROOT/required).is_file(),required
# 检查交付说明相对链接，忽略外链与课内路由，不访问网络。
for p in ROOT.glob('*.md'):
 for target in re.findall(r'\]\(([^)]+)\)',p.read_text(encoding='utf8')):
  if target.startswith(('https://','http://','/','#')):continue
  if (p.parent/target.split('#')[0]).resolve()==ROOT/'evidence/validation.json':continue # 本次成功后才生成
  assert (p.parent/target.split('#')[0]).exists(),(p.name,target)
packet={}
for directory in [ROOT,lesson.parent]:
 for p in directory.rglob('*'):
  if p.is_file() and p!=ROOT/'evidence/validation.json':packet[p.relative_to(REPO).as_posix()]=h(p)
report={'status':'CONDITIONAL_GO','date':'2026-10-29','commit':sources['commit'],'technical':'PASS_WITH_SCOPED_LIMITS','authorReview':'PASS','learnerTrial':'PENDING','actualLearningDuration':'PENDING','independentExternalReview':'PENDING','tests':{'lab':24,'renderer':9,'mutation':'EXPECTED_NONZERO','types':'strict consumers + TS2345 negative + erased declaration; actual runtime separately tested'},'source':{'references':len(sources['references']),'claims':len(sources['claims']),'files':len(sources['files'])},'screens':[1440,390,320],'preservation':{'originalTrackedUnchanged':len(before['tracked']),'originalOutputUnchanged':len(now),'onlyH07Added':True},'notRun':['full upstream suite/build','full Harness/Agent/Scope/tool pipeline/persistence integration','native Loader/HMR/Profile/Bundle/Patch','broken logger process fault','real model/credentials/private data','OS sandbox/persistence recovery','published media/auth/progress'],'packetSha256':packet,'stop':'H07 complete; do not start H08 or publish'}
(ROOT/'evidence/validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='packetSha256'},ensure_ascii=False))
