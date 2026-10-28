"""H01 最终检查：运行两组实际测试、核对版本证据和原工作区哈希。无删除/发布操作。"""
from pathlib import Path
import json, hashlib, subprocess, re
ROOT=Path(__file__).resolve().parents[1]
REPO=ROOT.parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(name,value):(ROOT/'evidence'/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def run(args):
    r=subprocess.run(args,cwd=REPO,capture_output=True,encoding='utf-8',errors='strict')
    assert r.returncode==0,(args,r.stdout[-1000:],r.stderr[-1000:])
    return r.stdout

# 证据必须对应当前正文、当前图及实际组件，防止使用改动前的绿灯。
lesson=REPO/'course-content/internal/deepseek-harness/h01/lesson.md'
content=json.loads((ROOT/'evidence/content-check.json').read_text(encoding='utf-8'))
sources=json.loads((ROOT/'evidence/source-check.json').read_text(encoding='utf-8'))
visual=json.loads((ROOT/'evidence/visual-qa.json').read_text(encoding='utf-8'))
for report in [content,sources,visual]:assert report['lessonSha256']==sha(lesson)
assert visual['rendererSha256']==sha(REPO/'src/components/LessonMarkdown.tsx')
for f in visual['figures']:
    assert f['sourceSha256']==sha(ROOT/'figures/source'/f"{f['id']}.svg")
    assert f['imageSha256']==sha(ROOT/'figures/rendered'/f"{f['id']}.png")
assert len(visual['viewports'])==3 and all(v['status']=='PASS' for v in visual['viewports'])
manual=json.loads((ROOT/'evidence/manual-review.json').read_text(encoding='utf-8'))
assert manual['status']=='AUTHOR_REVIEWED'

tests={}
for name,args,expected in [
 ('lab',['node','--test','--test-reporter=tap','course-content/internal/deepseek-harness/h01/lab/compare.test.mjs'],7),
 ('renderer',['node','--import','tsx','--test','--test-reporter=tap','tests/lesson-renderer.test.ts'],9),
]:
    out=run(args);(ROOT/'evidence'/f'{name}-tests.tap').write_text(out,encoding='utf-8')
    passed=int(re.search(r'^# pass (\d+)',out,re.M)[1]);failed=int(re.search(r'^# fail (\d+)',out,re.M)[1])
    skipped=int(re.search(r'^# skipped (\d+)',out,re.M)[1])
    assert passed==expected and failed==skipped==0
    tests[name]={'pass':passed,'fail':failed,'skipped':skipped,'exitCode':0}
(ROOT/'evidence/lab-demo.txt').write_text(run(['node','course-content/internal/deepseek-harness/h01/lab/compare.mjs']),encoding='utf-8')
baseline=json.loads((ROOT/'evidence/workspace-before.json').read_text(encoding='utf-8'))
changed=[]
for group in ['tracked','preexistingOutput']:
    for f,digest in baseline[group].items():
        if not (REPO/f).is_file() or sha(REPO/f)!=digest:changed.append(f)
assert not changed, changed
status=run(['git','status','--porcelain=v1','--untracked-files=all'])
unexpected=[]
for line in status.splitlines():
    path=line[3:].strip('"').replace('\\','/')
    if not path.startswith(('docs/deepseek-harness-v2/h01/','course-content/internal/deepseek-harness/h01/','output/')):unexpected.append(line)
assert not unexpected, unexpected
report={'date':'2026-10-28','status':'PASS_WITH_RECORDED_LIMITS','baselineHead':baseline['head'],'source':{'commit':sources['commit'],'references':len(sources['references']),'uniqueFiles':len(set(r['path'] for r in sources['references'])),'claims':len(sources['claims']),'status':'STATIC_VERIFIED'},'content':content,'visual':{'images':3,'widths':[v['width'] for v in visual['viewports']],'realReactClipboard':'PASS','keyboardDetails':'PASS','originalPopup':'PASS','staticReadingPreview':'PASS'},'tests':tests,'originalFiles':{'trackedUnchanged':len(baseline['tracked']),'preexistingOutputUnchanged':len(baseline['preexistingOutput']),'changed':changed},'scope':'new H01 private content and author artifacts only; no publication integration','notRun':['learner trial and independent review','full upstream suite','real model API','native sandbox','cross-process recovery','product entitlement/progress/media deployment'],'teachingEffectiveness':'NOT_ESTABLISHED_BY_TECHNICAL_TESTS'}
save('validation.json',report)
print(json.dumps({k:report[k] for k in ['status','source','tests','originalFiles']},ensure_ascii=False))
