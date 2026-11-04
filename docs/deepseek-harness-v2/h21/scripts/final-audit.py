from pathlib import Path
import json,hashlib,subprocess,re
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence';h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads((E/'workspace-before.json').read_text(encoding='utf-8'))
protected=[]
for f in before['files']:
 p=P/f['path'];assert p.is_file(),f['path'];assert h(p)==f['sha256'],f['path'];protected.append(f['path'])
allow=('docs/deepseek-harness-v2/h21/','course-content/internal/deepseek-harness/h21/')
staged=[s for s in subprocess.check_output(['git','diff','--cached','--name-only','-z'],cwd=P).decode().split('\0') if s]
assert all(s.startswith(allow) for s in staged),staged
for name in ['lesson.md','lab/A.ts','lab/B.ts','lab/C.ts','lab/D.ts','lab/X.ts','lab/subagent.test.ts']:
 assert (P/'course-content/internal/deepseek-harness/h21'/name).is_file(),name
for name in ['reading-preview.html','README.md','quality-review.md','knowledge-bridge.md','h22-handoff.md','source-checklist.md','coverage-matrix.md','renderer-regression.md','preparation.md']:
 assert (R/name).is_file(),name
results=json.loads((E/'lab-results.json').read_text(encoding='utf-8'));assert results['status']=='PASS' and results['tests']==21 and results['levels']=={'C':8,'D':13}
raw=json.loads((E/results['rawRun']).read_text(encoding='utf-8'));assert raw['exit']==0
for f in results['programs']:assert h(P/'course-content/internal/deepseek-harness/h21/lab'/f['name'])==f['sha256'],f['name']
content=json.loads((E/'content-check.json').read_text(encoding='utf-8'));lesson=P/'course-content/internal/deepseek-harness/h21/lesson.md';assert content['status']=='PASS' and content['lessonSha256']==h(lesson)
visual=json.loads((E/'visual-qa.json').read_text(encoding='utf-8'));assert visual['lessonSha256']==h(lesson)
assert [v['width'] for v in visual['viewports']]==[1440,390,320]
assert all(v['status']=='PASS' and len(v['copiedPrograms'])==9 and v['thoughtAnswers']==12 for v in visual['viewports'])
for f in visual['figures']:assert h(R/next(x['source'] for x in json.loads((E/'figures.json').read_text(encoding='utf-8')) if x['id']==f['id']))==f['sourceSha256']
manual=json.loads((E/'manual-review.json').read_text(encoding='utf-8'));assert manual['status']=='PASS'
for f in manual['samples']:assert h(R/f['path'])==f['sha256'],f['path']
renderer=(E/'renderer-regression.txt').read_text(encoding='utf-8');assert '# pass 12' in renderer and '# fail 0' in renderer
source=subprocess.run(['python','-X','utf8',str(R/'scripts/check-sources.py')],cwd=P,text=True,capture_output=True,encoding='utf-8');assert source.returncode==0,source.stderr
html=(R/'reading-preview.html').read_text(encoding='utf-8');assert '<script' not in html and 'lesson-copy' not in re.sub(r'<style>[\s\S]*?</style>','',html)
report={'status':'PASS','base':before['base'],'protectedFiles':len(protected),'outputFiles':sum(s.startswith('output/') for s in protected),'nonH21FilesChanged':0,'staged':staged,'onlyH21Staged':True,'labTests':21,'levels':results['levels'],'rendererTests':12,'widths':[1440,390,320],'manualSamples':len(manual['samples']),'sourceCheck':source.stdout.strip(),'worktreeStatus':subprocess.check_output(['git','status','--short'],cwd=P,text=True),'meaning':'Scope, input identity and artifact consistency only; not E integration, teaching effect or release approval.'}
(E/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({k:report[k] for k in ['status','protectedFiles','outputFiles','nonH21FilesChanged','onlyH21Staged']},ensure_ascii=False))
