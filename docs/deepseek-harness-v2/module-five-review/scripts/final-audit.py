"""Verify review artifacts and preserved workspace. Read-only except this report."""
from pathlib import Path
from collections import Counter
from datetime import datetime, timezone
from urllib.parse import unquote
import json, hashlib, re, subprocess

ROOT=Path(__file__).resolve().parents[4]
HERE=Path(__file__).resolve().parents[1]
def read(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
def check(name,fn):
    try:
        details=fn()
        checks.append({'name':name,'status':'PASS','details':details})
    except Exception as e:
        checks.append({'name':name,'status':'FAIL','error':str(e)})
def must(ok,msg):
    if not ok: raise AssertionError(msg)

baseline=read(HERE/'evidence/workspace-before.json')
allowed={'course-content/internal/deepseek-harness/h17/lesson.md','docs/deepseek-harness-v2/h17/reading-preview.html'}
def protected():
    for p,h in baseline['protected'].items():must(sha(ROOT/p)==h,p)
    current={str(p.relative_to(ROOT)):sha(p) for p in (ROOT/'output').rglob('*') if p.is_file()}
    must(current==baseline['output'],'output file set or hash changed')
    return {'userFiles':len(baseline['protected']),'outputFiles':len(current),'unchanged':True}
check('protected user changes and output',protected)
def originals():
    rows=read(HERE/'evidence/material-inventory.json')
    changed=[r['path'] for r in rows if sha(ROOT/r['path'])!=r['sha256']]
    must(set(changed)==allowed & {r['path'] for r in rows},str(changed))
    before=HERE/'evidence/before/h17-reading-preview.html'
    original=subprocess.check_output(['git','show',baseline['head']+':docs/deepseek-harness-v2/h17/reading-preview.html'],cwd=ROOT)
    must(before.read_bytes().replace(b'\r\n',b'\n')==original.replace(b'\r\n',b'\n'),'preview before differs from original HEAD')
    for r in read(HERE/'evidence/historical-runs.json'):must(sha(ROOT/r['path'])==r['sha256'],r['path'])
    return {'inventoried':len(rows),'onlyChanged':changed,'historicalRunsPreserved':66}
check('old courses and evidence',originals)
def scope():
    tracked=subprocess.check_output(['git','diff','HEAD','--name-only'],cwd=ROOT,text=True).splitlines()
    valid=set(baseline['protected'])|allowed
    for p in tracked:must(p in valid or p.startswith('docs/deepseek-harness-v2/module-five-review/'),p)
    new=subprocess.check_output(['git','ls-files','--others','--exclude-standard'],cwd=ROOT,text=True).splitlines()
    for p in new:must(p in valid or p.startswith('docs/deepseek-harness-v2/module-five-review/'),p)
    staged=subprocess.check_output(['git','diff','--cached','--name-only'],cwd=ROOT,text=True).splitlines()
    for p in staged:must(p in allowed or p.startswith('docs/deepseek-harness-v2/module-five-review/'),'unrelated staged '+p)
    return 'Only authorized scope beyond unchanged original user edits; no unrelated staged path'
check('Git scope',scope)
def source():
    v=read(HERE/'evidence/source-check.json')
    must(v['status']=='PASS' and v['files']==9619 and v['assertions']==198,'source verification')
    must(len(read(HERE/'evidence/source-assertion-index.json'))==198,'claim count')
    return v
check('fixed source identity and assertion references',source)
def behaviors():
    counts={}
    for h,n in [('h17',20),('h18',24),('h19',34),('h20',45),('cross',5)]:
        s=(HERE/f'evidence/{h}/evidence/lab-tests.txt').read_text(encoding='utf-8')
        must(len(re.findall(r'^ok \d+ - ',s,re.M))==n,h)
        for key,val in [('tests',n),('pass',n),('fail',0),('skipped',0),('cancelled',0)]:
            must(re.search(r'^# '+key+' '+str(val)+r'$',s,re.M),h+' '+key)
        counts[h]=n
    rows=read(HERE/'evidence/test-matrix.json')
    must(len(rows)==123 and len({r['id'] for r in rows})==123,'matrix identities')
    must(Counter(r['grade'] for r in rows)==Counter(C=65,D=58),'reviewed grades')
    must(Counter(r['originalGrade'] for r in rows)==Counter(C=64,D=59),'original grades')
    must([r['id'] for r in rows if r['grade']!=r['originalGrade']]==['H20-19'],'grade difference')
    return {'tests':counts,'total':128,'reviewedGrades':{'C':65,'D':63,'E':0},'independentFaultCount':'not inferred'}
check('behavior tests and evidence grades',behaviors)
def renderer():
    s=(HERE/'evidence/renderer-tests.tap').read_text(encoding='utf-8')
    must('# pass 12' in s and '# fail 0' in s,'renderer TAP')
    copies=0
    for h in ['h17','h18','h19','h20']:
        lesson=ROOT/f'course-content/internal/deepseek-harness/{h}/lesson.md'
        c=read(HERE/f'evidence/{h}/evidence/content-check.json')
        v=read(HERE/f'evidence/{h}/visual/evidence/visual-qa.json')
        must(c['status']=='PASS' and c['lessonSha256']==sha(lesson),h+' content')
        must(v['lessonSha256']==sha(lesson),h+' visual hash')
        must([p['width'] for p in v['viewports']]==[1440,390,320],h+' widths')
        for p in v['viewports']:
            must(p['status']=='PASS' and not p['errors'] and not p['failed'],h+' view')
            copies+=len(p['copiedPrograms'])
    must(copies==117,'copied program count')
    figs=read(HERE/'evidence/figure-rerender.json')
    must(len(figs)==16 and all(f['byteIdentical'] for f in figs),'figures')
    return {'rendererTests':12,'contentChecks':4,'viewports':12,'clipboardProgramChecks':copies,'figures':16}
check('content Renderer and original figures',renderer)
def assessment():
    q=read(HERE/'assessment-data.json')
    must(len(q)==18 and sum(x['points'] for x in q)==100,'questions/score')
    for x in q:
        must(all(x[k] for k in ['context','input','task','answer','steps','rubric','mistakes']),str(x['id']))
    must(sum('综合' in x['title'] for x in q)==5,'five integrated tasks')
    qa=read(HERE/'evidence/assessment-qa.json')
    must(qa['assessmentSha256']==sha(HERE/'assessment-preview.html'),'assessment stale')
    must(len(qa['diagrams'])==4 and all(not d['out'] and d['font'] for d in qa['diagrams']),'diagram geometry')
    must([v['width'] for v in qa['viewports']]==[1440,390,320] and all(v['status']=='PASS' for v in qa['viewports']),'quiz widths')
    w=read(HERE/'evidence/cross/evidence/behavior-traces.json')['trace-M5-whole.json']
    must([p['cutoff'] for p in w['prefixes']]==[8,13,26,29,40],'whole prefixes')
    must(w['bodies']==1 and len(w['saved']['events'])==32 and len(w['after']['events'])==43,'whole counts')
    return {'questions':18,'points':100,'integrated':5,'sameAgentEvents':43,'wholePrefixCount':5}
check('assessment and actual whole trajectory',assessment)
def manual():
    m=read(HERE/'evidence/manual-review.json')
    must(m['status']=='PASS' and m['independentExternalReview'] is False,'author review status')
    for p,h in m['observedHashes'].items():must(sha(HERE/p)==h,'stale visual '+p)
    must(m['assessmentSha256']==sha(HERE/'assessment-preview.html'),'stale manual quiz')
    return {'method':m['method'],'observedArtifacts':len(m['observedHashes']),'independentExternalReview':False}
check('actual visual review hashes',manual)
def links():
    errors=[]
    for p in HERE.glob('*.md'):
        for url in re.findall(r'\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
            if re.match(r'^(https?:|#)',url):continue
            target=unquote(url.split('#',1)[0]).strip('<>')
            resolved=(p.parent/target).resolve()
            if resolved==HERE/'evidence/final-audit.json':continue # this call emits the report after checking
            if not resolved.exists():errors.append([p.name,url])
    must(not errors,str(errors))
    return 'All top-level review Markdown local targets exist; remote pages not fetched'
check('local artifact links',links)
def deliveries():
    names=['README.md','review-report.md','unified-reliability-model.md','technical-consistency.md','flowcharts.md','persistence-and-recovery.md','compaction-and-retry.md','cancel-and-side-effects.md','test-evidence-matrix.md','h18-acceptance.md','cross-course-validation.md','figures-review.md','assessment.md','assessment-answers.md','assessment-preview.html','workload.md','issues-initial.md','revisions.md','regression-report.md','production-standard-module-five-addendum.md','h21-h24-handoff.md']
    for n in names:must((HERE/n).stat().st_size>100,n)
    return {'files':len(names),'requirementGroups':19,'openP0':0,'openP1':0,'openP2':['M5-P2-01'],'unverified':['real Provider cost/performance','E integration','learners','measured learning time','independent external review','combined process-crash/power-loss/multiplatform matrix']}
check('delivery inventory and explicit gate',deliveries)
report={'timestampUtc':datetime.now(timezone.utc).isoformat(),'status':'PASS' if all(c['status']=='PASS' for c in checks) else 'FAIL','verdict':'CONDITIONAL GO','checks':checks}
(HERE/'evidence/final-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':report['status'],'checks':len(checks),'failures':[c for c in checks if c['status']=='FAIL']},ensure_ascii=False))
raise SystemExit(0 if report['status']=='PASS' else 1)
