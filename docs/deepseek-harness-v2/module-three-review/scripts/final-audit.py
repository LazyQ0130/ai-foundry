from pathlib import Path
import hashlib,json,re,subprocess
ROOT=Path(__file__).resolve().parents[1];REPO=ROOT.parents[2];E=ROOT/'evidence'
baseline=json.loads((E/'workspace-before.json').read_text(encoding='utf-8'))
changed=[];missing=[]
for name,digest in baseline['files'].items():
 p=REPO/name
 if not p.exists():missing.append(name)
 elif hashlib.sha256(p.read_bytes()).hexdigest()!=digest:changed.append(name)
assert not changed and not missing,{'changed':changed,'missing':missing}
links=[];bad=[]
for p in ROOT.glob('*.md'):
 for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
  if target.startswith(('http:','https:','codex:')):continue
  name,_,anchor=target.partition('#');q=(p.parent/name).resolve() if name else p
  if q==E/'final-audit.json':pass # This result file is created below after the other checks.
  elif not q.exists():bad.append({'from':p.name,'target':target})
  elif anchor and q.suffix=='.md' and not re.search(r'id=[\"\']'+re.escape(anchor),q.read_text(encoding='utf-8')):bad.append({'from':p.name,'target':target,'reason':'explicit anchor absent'})
  links.append({'from':p.name,'target':target})
assert not bad,bad
for p in ROOT.rglob('*.json'):json.loads(p.read_text(encoding='utf-8'))
q=json.loads((ROOT/'assessment.json').read_text(encoding='utf-8'));assert len(q)==16 and sum(x['points'] for x in q)==100
assert [x['points'] for x in q[12:]]==[10]*4
assert len(re.findall('<article ',(ROOT/'assessment-preview.html').read_text(encoding='utf-8')))==16
source=json.loads((E/'source-check.json').read_text(encoding='utf-8'));assert len(source['assertions'])==172 and len(source['references'])==443
labResults=[]
for h,count in [('h09',24),('h10',31),('h11',40),('h12',49)]:
 r=json.loads((E/'baseline'/h/'evidence/lab-results.json').read_text(encoding='utf-8'));assert r['tests']==count and r['status']=='PASS';assert r['mutation']['status']=='EXPECTED_FAILURE';labResults.append({'course':h,'tests':count})
 v=json.loads((E/'baseline'/h/'evidence/visual-qa.json').read_text(encoding='utf-8'));assert len(v['figures'])==4 and len(v['viewports'])==3
for r in json.loads((E/'assessment-visual/results.json').read_text(encoding='utf-8'))['records']:assert r['status']=='PASS'
content=json.loads((E/'final-content/run-content.json').read_text(encoding='utf-8'));assert all(x.get('exit',0)==0 for x in content['records'])
renderer=(E/'final-content/renderer-tests.tap').read_text(encoding='utf-8');assert re.search(r'(?:#|ℹ) tests 12',renderer) and re.search(r'(?:#|ℹ) fail 0',renderer)
runs=sorted((E/'cross-course').glob('run-*.json'));last=json.loads(runs[-1].read_text(encoding='utf-8'));assert last['exit']==0 and '# pass 5' in last['stdout']
assert hashlib.sha256((ROOT/'probes/cross-course.test.ts').read_bytes()).hexdigest()==last['probeSha256']
exports=json.loads((E/'figure-export-comparison.json').read_text(encoding='utf-8'));assert len(exports)==16 and all(x['samePng'] for x in exports)
inventory=[{'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in ROOT.rglob('*') if p.is_file() and p.name!='final-audit.json']
staged=subprocess.check_output(['git','diff','--cached','--name-only'],cwd=REPO,text=True).splitlines()
assert all(p.startswith('docs/deepseek-harness-v2/module-three-review/') for p in staged),staged
result={'status':'PASS','baselineHead':baseline['head'],'protectedFiles':len(baseline['files']),'protectedOutputFiles':sum(p.startswith('output/') for p in baseline['files']),'protectedChanged':changed,'protectedMissing':missing,'newDirectoryOnly':'docs/deepseek-harness-v2/module-three-review/','originalCoursesRevised':[],'sourceFiles':len(source['verifiedFiles']),'references':443,'assertions':172,'prepMaterials':source['prepMaterialsChecked'],'labTests':labResults,'crossCourseLastRun':runs[-1].name,'crossCoursePass':5,'rendererTests':12,'assessmentQuestions':16,'assessmentPoints':100,'figures':16,'widths':[1440,390,320],'localLinks':len(links),'badLinks':bad,'deliverableFiles':len(inventory),'deliverableBytes':sum(i['bytes'] for i in inventory),'inventory':inventory,'conclusion':'CONDITIONAL GO','notVerified':['full Harness application E','full official test suite','real Provider/performance','disk flush/crash/cross-process recovery','learner trial and actual learning duration','independent external review'],'gitStatus':subprocess.check_output(['git','status','--short'],cwd=REPO,text=True)}
result['stagedScope']={'status':'PASS','paths':staged,'allWithinReviewDirectory':True}
(E/'final-audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({**{k:v for k,v in result.items() if k not in ['inventory','gitStatus','stagedScope']},'stagedPathsChecked':len(staged)},ensure_ascii=False))
