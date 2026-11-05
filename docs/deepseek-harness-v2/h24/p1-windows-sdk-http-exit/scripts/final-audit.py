from pathlib import Path
import json,re,hashlib,subprocess
R=Path(__file__).resolve().parents[1];E=R/'evidence';P=R.parents[3];h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();base=json.loads((E/'baseline.json').read_text());allowed=json.loads((E/'allowed-parent-changes.json').read_text());prefix=R.relative_to(P).as_posix()+'/'
changed=[]
for f in base['files']:
 p=P/f['path'];assert p.is_file(),f['path']
 if h(p)!=f['sha256']:changed.append(f['path']);assert f['path'] in allowed,f['path']
assert sorted(changed)==sorted(allowed),(changed,allowed)
old=json.loads((R.parent/'evidence/workspace-before.json').read_text());assert len(old['files'])==5294
for f in old['files']:assert h(P/f['path'])==f['sha256'],f['path']
for p in (R/'original-reports').rglob('*'):
 if p.is_file():
  target=(R.parent/p.relative_to(R/'original-reports')).relative_to(P).as_posix();assert h(p)==next(f['sha256'] for f in base['files'] if f['path']==target)
for filename in ['README.md','baseline.md','reproduction.md','reproduction-matrix.md','native-assertion.md','dependency-audit.md','root-cause.md','fix-or-disposition.md','regression.md','gate-decision.md']:assert (R/filename).is_file(),filename
gate=json.loads((E/'gate-decision.json').read_text());assert gate['quality']=='NO-GO' and not gate['originalP1Cleared'];assert next(g for g in gate['gates'] if g['id']==2)['status']=='FAIL'
native=json.loads((E/'standalone-native.json').read_text());assert len(native)==6
assert all(n['exit']==3221226505 and n['assertion'] and n['portRebound'] for n in native[:3]);assert all(n['exit']==0 and not n['assertion'] and n['portRebound'] for n in native[3:])
index=json.loads((E/'result-index.json').read_text());assert any(r['verdict']=='FAIL' and r['node']=='v24.16.0' and r['style']=='protocol' for r in index['lifecycle'])
assert any(r['verdict']=='FAIL' and r['active'] and r['style']=='eof' for r in index['lifecycle']);assert any(r['verdict']=='FAIL' and r['active'] and r['style']=='dispose' for r in index['lifecycle'])
for variant in ['hook','patch']:assert any(r['variant']==variant and r['passed']==23 for r in index['fullSuites'])
official=json.loads((E/'official-runtime.json').read_text());assert official['matchesOfficial'];assert h(Path(official['path']))==official['sha256'];assert any(r['nodeExecutable']==official['path'] and r['variant']=='default' and r['passed']==23 and not r['exitHook'] and not r['observer'] for r in index['fullSuites'])
patch=json.loads((E/'patch-apply-check.json').read_text());assert patch['status']=='PASS' and patch['sdkOriginalUnchanged'] and all(c['exit']==0 for c in patch['commands']);assert patch['patchSha256']==h(R/'patches/sdk-natural-default-exit.patch')
startup=json.loads((E/'sdk-child-startup-baseline.json').read_text());assert startup['childStartup'] and all('environmentNames' in c for c in startup['childStartup'])
for filename in ['h23-lab-results.json','h23-patched-lab-results.json']:
 d=json.loads((E/filename).read_text());assert d['tests']==25 and d['levels']=={'C':7,'D':18}
renderer=json.loads((E/'renderer-regression.json').read_text());assert renderer['exit']==0 and '# pass 12' in renderer['stdout'] and '# fail 0' in renderer['stdout']
visual=json.loads((E/'visual-qa.json').read_text());assert [v['width'] for v in visual['viewports']]==[1440,390,320];assert all(len(v['copiedPrograms'])==14 and v['thoughtAnswers']==15 and v['status']=='PASS' for v in visual['viewports'])
assert visual['lessonSha256']==h(P/'course-content/internal/deepseek-harness/h24/lesson.md')
manual=json.loads((E/'manual-review.json').read_text());assert manual['status']=='PASS'
for f in manual['samples']:assert h(R/f['path'])==f['sha256']
assert json.loads((E/'source-identity-final.json').read_text())['upstreamFilesModified']==0
for p in E.glob('clean-install-*.json'):
 for run in json.loads(p.read_text())['runs']:assert run['exit']==0 and run['lockBefore']==run['lockAfter'] and 'removed ' not in run['stdout']
assert json.loads((E/'process-check.json').read_text(encoding='utf-8-sig'))['matchingProcesses']==[]
links=[]
for p in R.rglob('*.md'):
 if 'original-reports' in p.parts:continue # Byte-exact historical copies retain their original relative context.
 s=re.sub(r'```[\s\S]*?```','',p.read_text(encoding='utf-8'))
 for link in re.findall(r'\]\(([^)]+)\)',s):
  if link.startswith(('https:','http:','/','#','mailto:')):continue
  assert (p.parent/link.split('#')[0]).exists(),(p,link);links.append(link)
current=subprocess.check_output(['git','status','--short'],cwd=P,text=True)
outside=lambda s:sorted(l for l in s.splitlines() if not l[3:].startswith(prefix) and l[3:] not in allowed)
assert outside(current)==outside(base['status']),current
staged=[s for s in subprocess.check_output(['git','diff','--cached','--name-only','-z'],cwd=P).decode().split('\0') if s];assert staged and all(s.startswith(prefix) or s in allowed for s in staged),staged
output={p.relative_to(P).as_posix() for p in (P/'output').rglob('*') if p.is_file()};assert output=={f['path'] for f in old['files'] if f['path'].startswith('output/')}
report=dict(status='PASS_SCOPE_AND_EVIDENCE_IDENTITY',quality='NO-GO',originalP1Cleared=False,base=base['head'],originalProtectedFiles=5294,existingFilesCaptured=len(base['files']),allowedParentChanges=allowed,otherExistingFilesChanged=0,originalEvidenceAndFixturesUnchanged=True,outputFiles=len(output),sourceFilesUnmodified=11865,staged=staged,onlyTaskFilesStaged=True,rendererTests=12,widths=[1440,390,320],localLinksChecked=len(links),meaning='Audit completion is not application acceptance; original default exit and active EOF/dispose checks remain failed.')
(E/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({k:report[k] for k in ['status','quality','originalProtectedFiles','otherExistingFilesChanged','onlyTaskFilesStaged']},ensure_ascii=False))
