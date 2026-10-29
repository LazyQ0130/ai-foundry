"""H04 本轮门禁。校验证据新鲜度、真实测试与原工作区保护；无删除或发布。"""
from pathlib import Path
import json,hashlib,subprocess,re
ROOT=Path(__file__).resolve().parents[1];REPO=ROOT.parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def run(args):
 r=subprocess.run(args,cwd=REPO,capture_output=True,encoding='utf8',errors='strict')
 assert r.returncode==0,(args,r.stdout[-1200:],r.stderr[-1200:]);return r.stdout
def read(name):return json.loads((ROOT/'evidence'/name).read_text(encoding='utf8'))
lesson=REPO/'course-content/internal/deepseek-harness/h04/lesson.md'
content,sources,visual,manual=map(read,['content-check.json','source-check.json','visual-qa.json','manual-review.json'])
for r in [content,sources,visual]:assert r['lessonSha256']==sha(lesson)
assert visual['rendererSha256']==sha(REPO/'src/components/LessonMarkdown.tsx')
for f in visual['figures']:
 assert f['sourceSha256']==sha(ROOT/'figures/source'/f"{f['id']}.svg")
 assert f['imageSha256']==sha(ROOT/'figures/rendered'/f"{f['id']}.png")
assert len(visual['figures'])==3 and [v['width'] for v in visual['viewports']]==[1440,390,320]
assert all(v['status']=='PASS' and v['labScroll']['scrolled']>0 and v['thoughtAnswers'] for v in visual['viewports'])
assert manual['status']=='AUTHOR_REVIEWED' and manual['independentReview']=='NOT_DONE'
for p,h in manual['artifacts'].items():assert sha(REPO/p)==h,('stale author review',p)
flow=read('control-flow.json');actual=read('actual-probes.json')
assert len(flow['checks'])==5 and actual['status']=='PASS' and len(actual['checks'])==10
assert all(c['status']=='PASS' for c in actual['checks'])
assert sources['commit']==actual['commit']==flow['commit']=='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
assert len(sources['claims'])==40 and sources['astStructureChecks']==5
tests={}
for name,args,expected in [
 ('lab',['node','--test','--test-reporter=tap','course-content/internal/deepseek-harness/h04/lab/launch-lab.test.mjs'],12),
 ('renderer',['node','--import','tsx','--test','--test-reporter=tap','tests/lesson-renderer.test.ts'],9),
]:
 out=run(args);(ROOT/'evidence'/f'{name}-tests.tap').write_text(out,encoding='utf8')
 passed=int(re.search(r'^# pass (\d+)',out,re.M)[1]);failed=int(re.search(r'^# fail (\d+)',out,re.M)[1]);skipped=int(re.search(r'^# skipped (\d+)',out,re.M)[1])
 assert passed==expected and failed==skipped==0
 tests[name]={'pass':passed,'fail':failed,'skipped':skipped,'exitCode':0}
demo=run(['node','course-content/internal/deepseek-harness/h04/lab/launch-lab.mjs','--self-test'])
trace=run(['node','course-content/internal/deepseek-harness/h04/lab/launch-lab.mjs','--trace'])
(ROOT/'evidence/lab-demo.txt').write_text(demo+'\n--- Web 固定启动教学追踪 ---\n'+trace,encoding='utf8')
baseline=read('workspace-before.json');changed=[]
for group in ['tracked','output']:
 for f,h in baseline[group].items():
  if not (REPO/f).is_file() or sha(REPO/f)!=h:changed.append(f)
assert not changed,changed
status=run(['git','status','--porcelain=v1','--untracked-files=all']);unexpected=[]
for line in status.splitlines():
 path=line[3:].strip('"').replace('\\','/')
 if not path.startswith(('docs/deepseek-harness-v2/h04/','course-content/internal/deepseek-harness/h04/','output/')):unexpected.append(line)
assert not unexpected,unexpected
report={'date':'2026-10-29','status':'PASS_WITH_RECORDED_LIMITS','baselineHead':baseline['head'],'source':{'commit':sources['commit'],'references':len(sources['references']),'claims':len(sources['claims']),'uniqueFiles':len(sources['files']),'astStructureChecks':5,'officialTestReview':'SELECTED_STATIC_NOT_EXECUTED','actualSourceHelperProbes':10},'content':content,'tests':tests,'visual':{'widths':[v['width'] for v in visual['viewports']],'images':3,'keyboardDetails':'PASS','threeThoughtAnswers':'PASS','realReactClipboard':'PASS: full program + JSON','mobileCodeHorizontalScroll':'PASS','originalPopup':'PASS','staticReadingPreview':'PASS'},'originalFiles':{'trackedUnchanged':len(baseline['tracked']),'preexistingOutputUnchanged':len(baseline['output']),'changed':changed},'scope':'H04 private content and author evidence only; no routes/publication/entitlements/prices/database/catalog changes','notRun':['learner trial, actual duration, independent review, learning effectiveness','full upstream suite or built official CLI/profile startup','real Provider/proxy requests, SDK/ACP handshake, native HMR and sandbox/OS isolation','disk flush and cross-process recovery','authenticated product page/progress/private media deployment'],'moduleOneReview':{'preparation':'PREPARED','concentratedReview':'NOT_PERFORMED','productionStandard':'CANDIDATE_NOT_FROZEN'},'teachingEffectiveness':'NOT_ESTABLISHED_BY_TECHNICAL_TESTS'}
(ROOT/'evidence/validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:report[k] for k in ['status','source','tests','originalFiles']},ensure_ascii=False))
