"""Packet integrity and targeted executable checks. No destructive operations."""
from pathlib import Path
import hashlib,json,re,struct,subprocess,sys,datetime
OUT=Path(__file__).resolve().parents[1]; ROOT=OUT.parents[1]
COMMIT='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
def read(name):return json.loads((OUT/name).read_text('utf-8'))
checks=[]
def check(name,condition,detail):
    checks.append({'name':name,'status':'PASS' if condition else 'FAIL','detail':detail})
lessons=read('evidence/lesson-specs.json');refs=read('evidence/source-index.json');plan=read('evidence/figure-plan.json')
source=Path(read('evidence/source-lock.json')['sourceCache'])
a=(OUT/'A-blueprint-v2.md').read_text('utf-8')
sections=re.split(r'\n## (H\d{2})\n',a)[1:]
check('30 lessons with all 20 numbered fields',len(sections)==60 and all([int(n) for n in re.findall(r'^### (\d+)\.',sections[i],re.M)]==list(range(1,21)) for i in range(1,60,2)),{'lessonCount':len(lessons),'fieldCount':len(re.findall(r'^### \d+\.',a,re.M))})
check('selected source range',all(2<=len({r[0] for r in l['routes']})<=5 for l in lessons),'2–5 distinct main files per lesson')
source_errors=[]
for r in refs:
    p=source/r['path']
    if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=r['sha256']:source_errors.append(r['id']);continue
    lines=p.read_text('utf-8').splitlines()
    if not 1<=r['start']<=r['end']<=len(lines) or (r['symbol']!='文件入口' and r['symbol'] not in lines[r['start']-1]) or '/blob/'+COMMIT+'/' not in r['url']:source_errors.append(r['id'])
check('fixed source references and exact anchors',not source_errors,{'references':len(refs),'errors':source_errors})
check('30 lesson figures within pedagogical budget',40<=len(plan)<=60 and all(1<=sum(r['lesson']==l['id'] for r in plan)<=3 for l in lessons) and all(r['alt'] and r['caption'] and r['structure'] for r in plan),{'planned':len(plan)})
samples=[]
for r in plan:
    if r['status']!='GENERATED_SAMPLE':continue
    stem=r['id'].lower();p=OUT/f'figures/rendered/{stem}.png';svg=OUT/f'figures/source/{stem}.svg'
    if p.exists() and svg.exists():
        data=p.read_bytes();w,h=struct.unpack('>II',data[16:24]);samples.append({'id':r['id'],'width':w,'height':h,'sha256':hashlib.sha256(data).hexdigest()})
check('4 real original diagrams with editable SVG',len(samples)==4,samples)
qa=read('evidence/visual-qa.json')
check('actual renderer image QA',len(qa['screens'])==12 and all(s['status']=='PASS' for s in qa['screens']) and isinstance(qa['manualReview'],dict) and qa['manualReview']['status']=='PASS',{'viewports':[1440,390,320],'screens':len(qa['screens']),'manual':qa['manualReview']})
check('archive integrity',read('evidence/source-integrity.json')['status']=='PASS',read('evidence/source-integrity.json'))
audit=read('evidence/stage-audit.json')
changed=[k for k,v in audit.items() if hashlib.sha256((ROOT/v['path']).read_bytes()).hexdigest()!=v['sha256']]
check('existing 29 formal lessons plus prep unchanged',len(audit)==30 and not changed,{'audited':len(audit),'changed':changed})
probe=read('evidence/official-probes.json')
check('limited actual source probes',len(probe['checks'])==6 and all(r['status']=='PASS' for r in probe['checks']),{'scope':probe['scope'],'checks':len(probe['checks'])})
badlinks=[]
for doc in OUT.glob('*.md'):
    for link in re.findall(r'\]\(([^\n)]+)\)',doc.read_text('utf-8')):
        target=link.split(' "')[0].split('#')[0]
        if not target or target.startswith(('http','/','mailto:')):continue
        if target=='evidence/validation.json':continue # this report is created below, including on first run
        if not (doc.parent/target).exists():badlinks.append({'doc':doc.name,'link':target})
check('local delivery links and images',not badlinks,badlinks)
commands=[('labs',['node','--test','docs/deepseek-harness-v2/labs/acceptance.test.mjs']),('renderer',['node','--import','tsx','--test','tests/lesson-renderer.test.ts']),('scope',[sys.executable,'-X','utf8','docs/deepseek-harness-v2/scripts/snapshot.py','after'])]
for name,cmd in commands:
    r=subprocess.run(cmd,cwd=ROOT,capture_output=True,text=True,encoding='utf-8',errors='replace')
    log=r.stdout+r.stderr;(OUT/f'evidence/{name}-validation.txt').write_text(log,encoding='utf-8')
    count=re.search(r'(?:#|ℹ)\s*tests\s+(\d+)',log)
    check(name+' executable acceptance',r.returncode==0,{'command':cmd,'exitCode':r.returncode,'tests':int(count.group(1)) if count else None,'log':f'{name}-validation.txt'})
check('no publication integration',not any((ROOT/p).exists() for p in ['public/course-media/harness-v2','course-content/harness-v2']),'Research assets remain under docs; baseline hash check covers existing platform files')
report={'date':'2026-10-28','timezone':'Asia/Shanghai','commit':COMMIT,'status':'PASS' if all(x['status']=='PASS' for x in checks) else 'FAIL','checks':checks,
 'notRun':['full official Vitest/snapshot/API e2e','native sandbox and OS isolation','real browser/desktop integration','real Provider/API semantic evaluation','cross-process restore/lease runtime','independent external reviewer','publication/integration/routes/entitlements/migrations']}
(OUT/'evidence/validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':report['status'],'checks':len(checks),'failed':[x for x in checks if x['status']=='FAIL']},ensure_ascii=False))
sys.exit(report['status']!='PASS')
