from pathlib import Path
import json,hashlib,re
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence';h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
paths=['docs/deepseek-harness-v2/A-blueprint-v2.md','docs/deepseek-harness-v2/E-production-standard.md',
 'docs/deepseek-harness-v2/module-one-review/README.md','docs/deepseek-harness-v2/module-one-review/production-standard-v1.md',
 'docs/deepseek-harness-v2/module-two-review/README.md']
for n in ['two','three','four','five']:
 paths.append(f'docs/deepseek-harness-v2/module-{n}-review/production-standard-module-{n}-addendum.md')
 if n!='two':paths.append(f'docs/deepseek-harness-v2/module-{n}-review/review-report.md')
paths+=['docs/deepseek-harness-v2/module-five-review/h21-h24-handoff.md','docs/deepseek-harness-v2/h20/h21-handoff.md','docs/deepseek-harness-v2/h20/module-five-review-prep/12-h21-prerequisites.md']
for n in [5,7,9,10,13,14,15,17,18,20]:paths.append(f'course-content/internal/deepseek-harness/h{n:02}/lesson.md')
for n in [5,7,9,10,13,14,15,17,18,20]:
 for p in sorted((P/f'course-content/internal/deepseek-harness/h{n:02}/lab').glob('*.ts')):paths.append(p.relative_to(P).as_posix())
inputs=[]
for name in dict.fromkeys(paths):
 p=P/name;assert p.is_file(),name;inputs.append({'path':name,'sha256':h(p),'bytes':p.stat().st_size})
(E/'preparation-inputs.json').write_text(json.dumps({'baseline':'0aeaa54','scope':'Full input file identity; author semantic focus and bridge in preparation.md. Enumeration/hash is not a semantic reading or test-execution claim.','files':inputs},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
result=json.loads((E/'lab-results.json').read_text(encoding='utf-8'));raw=json.loads((E/result['rawRun']).read_text(encoding='utf-8'));tests=re.findall(r'^# Subtest: ([CD]) (.+)$',raw['stdout'],re.M);assert len(tests)==21
rows=[]
for i,(grade,name) in enumerate(tests,1):
 fixture=('A.ts' if name.startswith('A ') else 'B.ts' if name.startswith('B ') else 'C.ts' if name.startswith('C ') else 'D.ts' if name.startswith('D ') else 'X.ts' if name.startswith('X ') else 'boundaries.ts')
 rows.append({'id':f'H21-{i:02}','grade':grade,'name':grade+' '+name,'definition':'course-content/internal/deepseek-harness/h21/lab/subagent.test.ts','fixture':fixture,'status':'PASS','rawRun':result['rawRun'],'platform':result['platform'],'node':result['node'],'substitutes':'Scripted LLM, constant tools; boundaries external run is a fake handle, no external Agent.','overlap':'Shared support fixture; X includes C comparison; reruns and demos not added to count.'})
(E/'test-index.json').write_text(json.dumps({'tests':21,'levels':result['levels'],'cases':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
samples=['figures/qa/h21-01-320.png','figures/qa/h21-02-320.png','figures/qa/h21-03-320.png','figures/qa/h21-04-320.png','figures/qa/answer-320.png','figures/qa/combined-answer-390.png','figures/qa/static-intro-1440.png']
manifest={'status':'PASS','reviewer':'same author; not independent review','method':'Author actually viewed listed images through view_image after React/Chrome rendering; geometry checks are separate.','observations':['All four 320px figures: readable Chinese, no cropped or overlapping text; arrows and captions match ownership/history/delivery limits.','Long A answer at320 and integrated answer at390: wrapping and full endings visible.','1440 introduction: title and note readable, no visible raw directives or Markdown artifacts.'],'samples':[{'path':p,'sha256':h(R/p)} for p in samples],'unverified':['real learner comfort','low-vision evaluation','additional browsers/devices']}
# Do not rewrite a manual-review identity after changed screenshots without viewing again.
old=E/'manual-review.json'
if old.exists():assert json.loads(old.read_text(encoding='utf-8'))['samples']==manifest['samples'],'Changed sample: view before updating manual evidence'
old.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
temporary=[]
for p in sorted(E.glob('run-*.json')):
 d=json.loads(p.read_text(encoding='utf-8'));temporary.append({'rawRun':p.name,'root':d.get('scratch'),'exit':d.get('exit'),'retained':True})
(E/'temporary-artifacts.json').write_text(json.dumps({'policy':'Retain all created fixture roots, JSONL and empty directories; no batch deletion.','runs':temporary},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(len(inputs),'preparation identities, 21 test identities,',len(samples),'actually viewed samples indexed')
