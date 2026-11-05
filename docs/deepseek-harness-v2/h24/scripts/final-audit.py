from pathlib import Path
import json,hashlib,subprocess,re
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence';h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads((E/'workspace-before.json').read_text(encoding='utf-8'));allow=('docs/deepseek-harness-v2/h24/','course-content/internal/deepseek-harness/h24/')
for f in before['files']:
 p=P/f['path'];assert p.is_file(),f['path'];assert h(p)==f['sha256'],f['path']
assert len(before['files'])==5294
staged=[s for s in subprocess.check_output(['git','diff','--cached','--name-only','-z'],cwd=P).decode().split('\0') if s];assert staged
assert all(s.startswith(allow) for s in staged),staged
current=subprocess.check_output(['git','status','--short'],cwd=P,text=True)
non_h24=lambda s:sorted(l for l in s.splitlines() if not l[3:].startswith(allow))
assert non_h24(current)==non_h24(before['status']),current
output_now={p.relative_to(P).as_posix() for p in (P/'output').rglob('*') if p.is_file()};assert output_now=={f['path'] for f in before['files'] if f['path'].startswith('output/')}
for name in ['reading-preview.html','README.md','quality-review.md','preparation.md','knowledge-bridge.md','h25-handoff.md','source-checklist.md','coverage-matrix.md','renderer-regression.md','discrepancies.md']:
 assert (R/name).is_file(),name
for name in ['README.md','knowledge-dependencies.md','architecture.md','client-chain.md','evidence-index.md','capability-matrix.md','integration-level.md','figure-index.md','terminology.md','workload.md','risks.md','h25-prerequisites.md','review-plan.md']:
 assert (R/'module-six-review-prep'/name).is_file(),name
results=json.loads((E/'lab-results.json').read_text());assert results['status']=='PASS' and results['tests']==23 and results['levels']=={'C':9,'D':14}
raw=json.loads((E/results['rawRun']).read_text());assert raw['exit']==0 and '# skipped 0' in raw['stdout']
for f in results['programs']:assert h(P/'course-content/internal/deepseek-harness/h24/lab'/f['name'])==f['sha256'],f['name']
x=json.loads((E/'trace-X.json').read_text());assert x['report']['highestGrade']=='D' and x['wire']['exit']==0
assert x['report']['evidence']['reconstructedMessages']==len(x['reconstructedMessages'])
assert x['reconstructedMessages'][:len(x['runtime']['requests'][-1]['messages'])]==x['runtime']['requests'][-1]['messages']
content=json.loads((E/'content-check.json').read_text());lesson=P/'course-content/internal/deepseek-harness/h24/lesson.md';assert content['status']=='PASS' and content['lessonSha256']==h(lesson)
assert len(content['programs'])==14 and content['metrics']['thoughts']==15
visual=json.loads((E/'visual-qa.json').read_text());assert visual['lessonSha256']==h(lesson)
assert [v['width'] for v in visual['viewports']]==[1440,390,320]
assert all(v['status']=='PASS' and len(v['copiedPrograms'])==14 and v['thoughtAnswers']==15 for v in visual['viewports'])
figures=json.loads((E/'figures.json').read_text())
for f in visual['figures']:
 entry=next(x for x in figures if x['id']==f['id']);assert h(R/entry['image'])==f['imageSha256'];assert h(R/entry['source'])==f['sourceSha256']
manual=json.loads((E/'manual-review.json').read_text());assert manual['status']=='PASS' and len(manual['samples'])==9
for f in manual['samples']:assert h(R/f['path'])==f['sha256'],f['path']
assert '# pass 12' in (E/'renderer-regression.txt').read_text(encoding='utf-8') and '# fail 0' in (E/'renderer-regression.txt').read_text(encoding='utf-8')
grades=json.loads((E/'test-grades.json').read_text());assert grades['count']==23 and grades['levels']==results['levels']
assert len(json.loads((E/'source-assertions.json').read_text()))==50
inputs=json.loads((E/'preparation-inputs.json').read_text());assert len(inputs['planning'])==30
for f in inputs['inputs']:assert h(P/f['path'])==f['sha256'],f['path']
six=json.loads((E/'module-six-figures.json').read_text());assert len(six)==16
for f in six:assert h(P/f['image'])==f['imageSha256'] and h(P/f['source'])==f['sourceSha256']
assert json.loads((E/'m1-m6-run.json').read_text())['exit']==0
processes=json.loads((E/'process-check.json').read_text(encoding='utf-8-sig'));assert processes['status']=='PASS' and processes['matchingProcesses']==[]
p1=json.loads((E/'default-exit-failure.json').read_text());assert p1['status']=='OPEN_P1_NO_GO' and len(p1['failures'])>=2
assert '总体结论：NO-GO' in (R/'quality-review.md').read_text(encoding='utf-8')
html=(R/'reading-preview.html').read_text(encoding='utf-8');assert '<script' not in html and 'lesson-copy' not in re.sub(r'<style>[\s\S]*?</style>','',html)
links=[]
for p in list(R.rglob('*.md'))+[lesson]:
 text=re.sub(r'```[\s\S]*?```','',p.read_text(encoding='utf-8'))
 for link in re.findall(r'\]\(([^)]+)\)',text):
  if link.startswith(('http','/','#','mailto:')):continue
  if link=='evidence/validation.json':continue
  assert (p.parent/link.split('#')[0]).exists(),(p,link);links.append(link)
source=subprocess.run(['python','-X','utf8',str(R/'scripts/check-sources.py')],cwd=P,text=True,capture_output=True,encoding='utf-8');assert source.returncode==0,source.stderr
report=dict(status='PASS',meaning='Artifact identity, scope and verification consistency only; author quality remains NO-GO with open P1. Not module formal review or release approval.',quality='NO-GO',base=before['base'],protectedFiles=len(before['files']),outputFiles=len(output_now),nonH24FilesChanged=0,onlyH24Staged=True,staged=staged,labTests=23,levels=results['levels'],rendererTests=12,widths=[1440,390,320],copiedPrograms=42,manualSamples=9,sourceAssertions=50,sourceCheck=source.stdout.strip(),localLinksChecked=len(links),worktreeStatus=current,unverified=['complete shipped Profile/lib/E','product Web browser','real Provider/Internet','benchmark/performance/cost','learners/measured time','independent review'])
(E/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({k:report[k] for k in ['status','quality','protectedFiles','outputFiles','nonH24FilesChanged','onlyH24Staged']},ensure_ascii=False))
